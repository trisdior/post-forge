/**
 * PostForge API Key Manager
 * Handles key generation, storage, and lifecycle
 * Uses Upstash Redis for persistence
 */

const crypto = require('crypto');
const { Redis } = require('@upstash/redis');

var redis = null;
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
  }
  return redis;
}

// ─── Tier Limits (requests per month) ───
const TIER_LIMITS = {
  free: 100,
  growth: 1000,
  pro: 10000,
  business: 100000
};

// ─── Generate API Key ───
function generateApiKey() {
  const prefix = 'pk_live_';
  const randomPart = crypto.randomBytes(32).toString('hex');
  return prefix + randomPart;
}

// ─── Create API Key ───
async function createKey(email, tier, keyName) {
  const db = getRedis();
  
  if (!TIER_LIMITS[tier]) {
    return { error: 'Invalid tier: ' + tier };
  }

  const key = generateApiKey();
  const now = new Date().toISOString();
  const keyId = crypto.randomBytes(8).toString('hex');

  const keyData = {
    keyId: keyId,
    key: key,
    email: email,
    tier: tier,
    name: keyName || 'API Key ' + new Date().toLocaleDateString(),
    created: now,
    revoked: false,
    revokedAt: null,
    lastUsed: null,
    requestsThisMonth: 0
  };

  // Store key metadata (without full key)
  await db.set(
    'api_key_metadata:' + keyId,
    JSON.stringify({
      keyId: keyId,
      email: email,
      tier: tier,
      name: keyName || 'API Key ' + new Date().toLocaleDateString(),
      created: now,
      revoked: false,
      revokedAt: null,
      lastUsed: null
    })
  );

  // Store key→email mapping (for lookup)
  await db.set(
    'api_key:' + key,
    JSON.stringify({
      keyId: keyId,
      email: email,
      tier: tier,
      created: now,
      revoked: false
    })
  );

  // Add to user's key list
  const userKeysKey = 'user_keys:' + email;
  let userKeys = await db.get(userKeysKey);
  if (!userKeys) {
    userKeys = [];
  } else if (typeof userKeys === 'string') {
    userKeys = JSON.parse(userKeys);
  }
  userKeys.push(keyId);
  await db.set(userKeysKey, JSON.stringify(userKeys));

  // Initialize monthly counter
  const monthStr = getMonthString();
  await db.set(
    'api_usage:' + key + ':' + monthStr,
    '0'
  );

  // Set expiration for monthly counter (at next month boundary)
  const ttl = getMonthTTL();
  await db.expire('api_usage:' + key + ':' + monthStr, ttl);

  return {
    success: true,
    key: key,  // Return full key ONCE
    keyId: keyId,
    name: keyName || 'API Key',
    tier: tier,
    limit: TIER_LIMITS[tier],
    created: now
  };
}

// ─── List Keys for User ───
async function listKeys(email) {
  const db = getRedis();
  const userKeysKey = 'user_keys:' + email;
  
  let keyIds = await db.get(userKeysKey);
  if (!keyIds) return [];
  
  if (typeof keyIds === 'string') {
    keyIds = JSON.parse(keyIds);
  }

  const keys = [];
  const monthStr = getMonthString();

  for (const keyId of keyIds) {
    try {
      const metadata = await db.get('api_key_metadata:' + keyId);
      if (metadata) {
        const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        
        // Get usage for this key
        // Find the actual key to look up usage
        const userKeysMetadata = await db.get(userKeysKey);
        let usage = 0;
        
        // Try to find usage by scanning (fallback: just show 0)
        if (data.email === email && !data.revoked) {
          keys.push({
            keyId: keyId,
            name: data.name,
            tier: data.tier,
            limit: TIER_LIMITS[data.tier],
            created: data.created,
            lastUsed: data.lastUsed,
            revoked: data.revoked,
            usage: usage,
            preview: 'pk_live_' + keyId.substring(0, 8) + '...'
          });
        }
      }
    } catch(e) {
      console.error('Error loading key:', e.message);
    }
  }

  return keys;
}

// ─── Get Key Stats ───
async function getKeyStats(keyId) {
  const db = getRedis();
  const metadata = await db.get('api_key_metadata:' + keyId);
  
  if (!metadata) return { error: 'Key not found' };
  
  const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  
  if (data.revoked) {
    return { error: 'Key has been revoked' };
  }

  // Get current month usage
  const monthStr = getMonthString();
  const usageKey = 'api_usage:' + keyId + ':' + monthStr;
  
  let usage = await db.get(usageKey);
  usage = usage ? parseInt(usage) : 0;

  const resetDate = getNextMonthBoundary();

  return {
    keyId: keyId,
    name: data.name,
    tier: data.tier,
    created: data.created,
    lastUsed: data.lastUsed,
    usage: usage,
    limit: TIER_LIMITS[data.tier],
    remaining: TIER_LIMITS[data.tier] - usage,
    resetDate: resetDate,
    percentUsed: Math.round((usage / TIER_LIMITS[data.tier]) * 100)
  };
}

// ─── Revoke Key ───
async function revokeKey(keyId) {
  const db = getRedis();
  const metadata = await db.get('api_key_metadata:' + keyId);
  
  if (!metadata) return { error: 'Key not found' };
  
  const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  
  data.revoked = true;
  data.revokedAt = new Date().toISOString();
  
  await db.set('api_key_metadata:' + keyId, JSON.stringify(data));

  return { success: true, message: 'Key revoked' };
}

// ─── Validate API Key ───
async function validateKey(apiKey) {
  const db = getRedis();
  const keyData = await db.get('api_key:' + apiKey);
  
  if (!keyData) {
    return { valid: false, reason: 'Key not found' };
  }

  const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
  
  if (data.revoked) {
    return { valid: false, reason: 'Key has been revoked', status: 401 };
  }

  return {
    valid: true,
    keyId: data.keyId,
    email: data.email,
    tier: data.tier,
    limit: TIER_LIMITS[data.tier]
  };
}

// ─── Check and Increment Usage ───
async function checkAndIncrementUsage(keyId) {
  const db = getRedis();
  const monthStr = getMonthString();
  const usageKey = 'api_usage:' + keyId + ':' + monthStr;

  // Get metadata to check tier and revocation
  const metadata = await db.get('api_key_metadata:' + keyId);
  if (!metadata) {
    return { allowed: false, reason: 'Key not found', status: 401 };
  }

  const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  
  if (data.revoked) {
    return { allowed: false, reason: 'Key has been revoked', status: 401 };
  }

  const tier = data.tier;
  const limit = TIER_LIMITS[tier];

  // Get current usage
  let currentUsage = await db.get(usageKey);
  currentUsage = currentUsage ? parseInt(currentUsage) : 0;

  if (currentUsage >= limit) {
    const resetDate = getNextMonthBoundary();
    return {
      allowed: false,
      reason: 'Monthly rate limit exceeded',
      status: 429,
      usage: currentUsage,
      limit: limit,
      resetDate: resetDate
    };
  }

  // Increment usage
  await db.incr(usageKey);
  
  // Make sure expiration is set
  await db.expire(usageKey, getMonthTTL());

  // Update last used
  data.lastUsed = new Date().toISOString();
  await db.set('api_key_metadata:' + keyId, JSON.stringify(data));

  return {
    allowed: true,
    usage: currentUsage + 1,
    limit: limit,
    remaining: limit - (currentUsage + 1),
    resetDate: getNextMonthBoundary()
  };
}

// ─── Get Admin Stats ───
async function getAdminStats() {
  const db = getRedis();
  
  // This is a simplified version - in production, you'd want to scan more efficiently
  const stats = {
    totalKeys: 0,
    activeKeys: 0,
    revokedKeys: 0,
    totalUsage: 0,
    byTier: {
      free: { count: 0, usage: 0 },
      growth: { count: 0, usage: 0 },
      pro: { count: 0, usage: 0 },
      business: { count: 0, usage: 0 }
    },
    topUsers: []
  };

  return stats;
}

// ─── Helper Functions ───

function getMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return year + '-' + month;
}

function getMonthTTL() {
  // Return TTL in seconds until end of month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let nextMonthDate;
  if (currentMonth === 11) {
    // December -> January next year
    nextMonthDate = new Date(currentYear + 1, 0, 1, 0, 0, 0);
  } else {
    nextMonthDate = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0);
  }

  const ttl = Math.floor((nextMonthDate - now) / 1000);
  return Math.max(ttl, 60); // Minimum 60 seconds
}

function getNextMonthBoundary() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let nextMonthDate;
  if (currentMonth === 11) {
    nextMonthDate = new Date(currentYear + 1, 0, 1, 0, 0, 0);
  } else {
    nextMonthDate = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0);
  }

  return nextMonthDate.toISOString();
}

module.exports = {
  generateApiKey,
  createKey,
  listKeys,
  getKeyStats,
  revokeKey,
  validateKey,
  checkAndIncrementUsage,
  getAdminStats,
  TIER_LIMITS
};
