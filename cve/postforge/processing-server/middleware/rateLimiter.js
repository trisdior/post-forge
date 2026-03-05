/**
 * Rate Limiter Middleware
 * Enforces:
 * - Monthly clip quota per user/tier
 * - File size limits per tier
 * - Request rate limits
 */

const { getTier, getLimitExceededMessage } = require('../config/tiers');

// In-memory store for rate limiting (Redis would be used in production)
// Format: { userId:clipsThisMonth: number, userId:lastReset: timestamp, etc. }
class RateLimitStore {
  constructor() {
    this.data = new Map();
    this.requestCounts = new Map(); // For IP-based rate limiting
  }

  /**
   * Get clips used this month for a user
   * @param {string} userId
   * @returns {number} clips used
   */
  getClipsUsed(userId) {
    return this.data.get(`${userId}:clipsUsed`) || 0;
  }

  /**
   * Increment clips used
   * @param {string} userId
   * @param {number} amount
   */
  incrementClipsUsed(userId, amount = 1) {
    const key = `${userId}:clipsUsed`;
    const current = this.data.get(key) || 0;
    this.data.set(key, current + amount);

    // Reset monthly counter (first of month)
    const lastReset = this.data.get(`${userId}:lastReset`);
    const now = new Date();
    const isNewMonth = !lastReset || new Date(lastReset).getMonth() !== now.getMonth();

    if (isNewMonth) {
      this.data.set(key, amount);
      this.data.set(`${userId}:lastReset`, now.toISOString());
    }
  }

  /**
   * Check if clip quota exceeded
   * @param {string} userId
   * @param {string} tierName
   * @returns {boolean} true if quota exceeded
   */
  isQuotaExceeded(userId, tierName) {
    const tier = getTier(tierName);
    const used = this.getClipsUsed(userId);
    return used >= tier.clipsPerMonth;
  }

  /**
   * Get bandwidth used this month
   * @param {string} userId
   * @returns {number} bytes used
   */
  getBandwidthUsed(userId) {
    return this.data.get(`${userId}:bandwidthUsed`) || 0;
  }

  /**
   * Add bandwidth usage
   * @param {string} userId
   * @param {number} bytes
   */
  addBandwidthUsed(userId, bytes) {
    const key = `${userId}:bandwidthUsed`;
    const current = this.data.get(key) || 0;
    this.data.set(key, current + bytes);

    // Reset monthly counter
    const lastReset = this.data.get(`${userId}:bandwidthReset`);
    const now = new Date();
    const isNewMonth = !lastReset || new Date(lastReset).getMonth() !== now.getMonth();

    if (isNewMonth) {
      this.data.set(key, bytes);
      this.data.set(`${userId}:bandwidthReset`, now.toISOString());
    }
  }

  /**
   * Rate limit by IP (simple request throttling)
   * @param {string} ip
   * @param {number} maxRequests - max requests per minute
   * @returns {boolean} true if rate limited
   */
  isRateLimitedByIP(ip, maxRequests = 60) {
    const key = `ip:${ip}`;
    const now = Date.now();
    const data = this.requestCounts.get(key) || { requests: [], lastReset: now };

    // Reset if over a minute old
    if (now - data.lastReset > 60000) {
      data.requests = [];
      data.lastReset = now;
    }

    // Check if exceeded
    if (data.requests.length >= maxRequests) {
      return true;
    }

    data.requests.push(now);
    this.requestCounts.set(key, data);
    return false;
  }

  /**
   * Get stats for a user (for monitoring)
   * @param {string} userId
   * @returns {object} stats
   */
  getStats(userId) {
    return {
      clipsUsed: this.getClipsUsed(userId),
      bandwidthUsedBytes: this.getBandwidthUsed(userId),
      bandwidthUsedGB: Math.round((this.getBandwidthUsed(userId) / (1024 * 1024 * 1024)) * 100) / 100,
      lastReset: this.data.get(`${userId}:lastReset`)
    };
  }

  /**
   * Reset user stats (admin function)
   * @param {string} userId
   */
  resetStats(userId) {
    this.data.delete(`${userId}:clipsUsed`);
    this.data.delete(`${userId}:bandwidthUsed`);
    this.data.delete(`${userId}:lastReset`);
    this.data.delete(`${userId}:bandwidthReset`);
  }
}

// Global store instance
const store = new RateLimitStore();

/**
 * Middleware: Validate upload file size against tier limits
 * Attaches validated metadata to req.uploadValidation
 */
function validateFileSize(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
  const userTier = req.headers['x-user-tier'] || req.query.tier || 'free';
  const tier = getTier(userTier);

  // Check file size
  if (req.file && req.file.size > tier.maxFileSizeBytes) {
    const maxSizeMB = tier.maxFileSizeBytes / (1024 * 1024);
    return res.status(413).json({
      error: 'file_too_large',
      message: getLimitExceededMessage(userTier, 'fileSize'),
      maxSizeMB: Math.round(maxSizeMB),
      fileSizeMB: Math.round(req.file.size / (1024 * 1024)),
      tier: tier.name
    });
  }

  // Attach validation info to request
  req.uploadValidation = {
    userId,
    userTier,
    tier,
    fileSize: req.file?.size || 0
  };

  next();
}

/**
 * Middleware: Check monthly clip quota
 * Should be called after /upload or before /cut
 */
function checkClipQuota(req, res, next) {
  const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
  const userTier = req.headers['x-user-tier'] || req.query.tier || 'free';
  const tier = getTier(userTier);

  if (store.isQuotaExceeded(userId, userTier)) {
    const used = store.getClipsUsed(userId);
    return res.status(429).json({
      error: 'clip_quota_exceeded',
      message: `Clip limit reached. You've used ${used}/${tier.clipsPerMonth} clips this month. Upgrade to ${tier.name === 'Business' ? 'Enterprise' : 'the next tier'} for more.`,
      clipsUsed: used,
      clipsLimit: tier.clipsPerMonth,
      tier: tier.name
    });
  }

  req.clipQuota = {
    userId,
    userTier,
    tier,
    clipsUsed: store.getClipsUsed(userId),
    clipsRemaining: tier.clipsPerMonth - store.getClipsUsed(userId)
  };

  next();
}

/**
 * Middleware: Rate limit by IP (global throttle)
 */
function rateLimitByIP(maxRequests = 100) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    if (store.isRateLimitedByIP(ip, maxRequests)) {
      return res.status(429).json({
        error: 'rate_limited',
        message: `Too many requests. Maximum ${maxRequests} requests per minute.`,
        retryAfter: 60
      });
    }

    next();
  };
}

/**
 * Record a clip being processed
 * @param {string} userId
 * @param {number} fileSize - in bytes
 */
function recordClip(userId, fileSize = 0) {
  store.incrementClipsUsed(userId);
  if (fileSize > 0) {
    store.addBandwidthUsed(userId, fileSize);
  }
}

/**
 * Get rate limit stats for a user (admin endpoint)
 * @param {string} userId
 * @returns {object} stats
 */
function getStats(userId) {
  return store.getStats(userId);
}

/**
 * Reset stats for a user (admin function)
 * @param {string} userId
 */
function resetStats(userId) {
  store.resetStats(userId);
}

/**
 * Get all tracking data (for admin dashboard)
 * @returns {object} all users and their stats
 */
function getAllStats() {
  const results = {};
  const keys = Array.from(store.data.keys());

  const uniqueUsers = new Set();
  keys.forEach(key => {
    const [userId] = key.split(':');
    if (userId) uniqueUsers.add(userId);
  });

  uniqueUsers.forEach(userId => {
    results[userId] = store.getStats(userId);
  });

  return results;
}

module.exports = {
  validateFileSize,
  checkClipQuota,
  rateLimitByIP,
  recordClip,
  getStats,
  resetStats,
  getAllStats,
  store
};
