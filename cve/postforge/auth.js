/**
 * PostForge Auth — Upstash Redis-backed auth
 * Persistent across deploys, serverless-friendly
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

function hashPassword(password) {
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return salt + ':' + hash;
}

function verifyPassword(password, stored) {
  var parts = stored.split(':');
  var salt = parts[0];
  var hash = parts[1];
  var test = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === test;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ─── Public API ───

async function signup(email, password, businessName) {
  email = (email || '').toLowerCase().trim();
  if (!email || !password) return { error: 'Email and password required' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters' };

  var db = getRedis();
  var existing = await db.get('user:' + email);
  if (existing) return { error: 'Account already exists' };

  var token = generateToken();
  var now = new Date().toISOString();

  var user = {
    email: email,
    password: hashPassword(password),
    businessName: businessName || '',
    plan: 'free',
    usage: { posts_generated: 0, month: new Date().getMonth() },
    created: now,
    lastLogin: now
  };

  await db.set('user:' + email, JSON.stringify(user));
  await db.set('session:' + token, email);

  return { success: true, token: token, user: sanitizeUser(user) };
}

async function login(email, password) {
  email = (email || '').toLowerCase().trim();
  var db = getRedis();
  var raw = await db.get('user:' + email);
  if (!raw) return { error: 'Invalid email or password' };

  var user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!verifyPassword(password, user.password)) return { error: 'Invalid email or password' };

  var token = generateToken();
  user.lastLogin = new Date().toISOString();
  await db.set('user:' + email, JSON.stringify(user));
  await db.set('session:' + token, email);

  return { success: true, token: token, user: sanitizeUser(user) };
}

async function getUser(token) {
  if (!token) return null;
  var db = getRedis();
  var email = await db.get('session:' + token);
  if (!email) return null;

  var raw = await db.get('user:' + email);
  if (!raw) return null;

  var user = typeof raw === 'string' ? JSON.parse(raw) : raw;

  // Reset monthly usage if new month
  var currentMonth = new Date().getMonth();
  if (user.usage.month !== currentMonth) {
    user.usage.posts_generated = 0;
    user.usage.month = currentMonth;
    await db.set('user:' + email, JSON.stringify(user));
  }

  return sanitizeUser(user);
}

async function trackUsage(token, postsGenerated) {
  if (!token) return false;
  var db = getRedis();
  var email = await db.get('session:' + token);
  if (!email) return false;

  var raw = await db.get('user:' + email);
  if (!raw) return false;

  var user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  user.usage.posts_generated += postsGenerated;
  await db.set('user:' + email, JSON.stringify(user));
  return true;
}

async function checkLimit(token) {
  var user = await getUser(token);
  if (!user) return { allowed: false, reason: 'Not logged in' };

  // Hard caps — NEVER exceed these. Every tier must be profitable.
  // Cost per post: ~$0.003 (Haiku). These limits guarantee profit.
  var limits = {
    free: 10,       // 10 posts/mo — $0.03 cost, $0 revenue (marketing spend)
    growth: 50,     // 50 posts/mo — $0.15 cost, $19 revenue = $18.85 profit
    pro: 150,       // 150 posts/mo — $0.50 cost, $49 revenue = $48.50 profit
    business: 500   // 500 posts/mo — $1.50 cost, $99 revenue = $97.50 profit
  };
  var limit = limits[user.plan] || 10;
  var used = user.usage.posts_generated;

  if (used >= limit) {
    var upgradeMsg = user.plan === 'free' ? ' Upgrade to Growth ($19/mo) for 50 posts.' :
                     user.plan === 'growth' ? ' Upgrade to Pro ($49/mo) for 150 posts.' :
                     user.plan === 'pro' ? ' Upgrade to Business ($99/mo) for 500 posts.' :
                     '';
    return { allowed: false, reason: 'Monthly limit reached (' + used + '/' + limit + ').' + upgradeMsg, used: used, limit: limit, plan: user.plan };
  }

  return { allowed: true, used: used, limit: limit, remaining: limit - used, plan: user.plan };
}

function sanitizeUser(user) {
  return {
    email: user.email,
    businessName: user.businessName,
    plan: user.plan,
    usage: user.usage,
    created: user.created
  };
}

async function saveUser(token, userData) {
  var db = getRedis();
  var email = await db.get('session:' + token);
  if (!email) return false;
  var raw = await db.get('user:' + email);
  if (!raw) return false;
  var user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  // Merge in new data (keep password)
  Object.assign(user, userData);
  if (!user.password && raw) {
    var orig = typeof raw === 'string' ? JSON.parse(raw) : raw;
    user.password = orig.password;
  }
  await db.set('user:' + email, JSON.stringify(user));
  return true;
}

async function getAllUsers() {
  var db = getRedis();
  // Scan for all user keys
  var users = [];
  var cursor = 0;
  do {
    var result = await db.scan(cursor, { match: 'user:*', count: 100 });
    cursor = result[0];
    var keys = result[1];
    for (var i = 0; i < keys.length; i++) {
      try {
        var raw = await db.get(keys[i]);
        if (raw) {
          var u = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (u.email) users.push(sanitizeUser(u));
        }
      } catch(e) {}
    }
  } while (cursor !== 0 && cursor !== '0');
  return users;
}

module.exports = { signup, login, getUser, trackUsage, checkLimit, saveUser, getAllUsers };
