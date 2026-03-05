/**
 * Social Connections Schema for Redis
 * Stores encrypted OAuth tokens and connection metadata
 */

const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGO = 'aes-256-cbc';

class SocialConnectionsSchema {
  /**
   * Encrypt a token for storage
   */
  static encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt a stored token
   */
  static decryptToken(encryptedToken) {
    try {
      const [iv, encrypted] = encryptedToken.split(':');
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      console.error('Token decryption failed:', e.message);
      return null;
    }
  }

  /**
   * Get Redis key for user social connections
   */
  static getConnectionKey(userId) {
    return `social:${userId}`;
  }

  /**
   * Get Redis key for platform-specific tokens
   */
  static getPlatformTokenKey(userId, platform) {
    return `social:${userId}:${platform}:token`;
  }

  /**
   * Get Redis key for platform connection status
   */
  static getPlatformStatusKey(userId, platform) {
    return `social:${userId}:${platform}:status`;
  }

  /**
   * Store a social connection
   */
  static async store(redis, userId, platform, { accessToken, refreshToken, expiresAt, accountInfo }) {
    const encryptedAccess = this.encryptToken(accessToken);
    const encryptedRefresh = refreshToken ? this.encryptToken(refreshToken) : null;

    const connectionData = {
      platform,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      expiresAt,
      accountInfo: JSON.stringify(accountInfo || {}),
      connectedAt: new Date().toISOString(),
    };

    // Store in main connection set
    await redis.hset(
      this.getConnectionKey(userId),
      platform,
      JSON.stringify(connectionData)
    );

    // Store status flag
    await redis.set(this.getPlatformStatusKey(userId, platform), 'connected', { ex: 604800 }); // 7 days
  }

  /**
   * Get a social connection
   */
  static async get(redis, userId, platform) {
    const data = await redis.hget(this.getConnectionKey(userId), platform);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        accessToken: this.decryptToken(parsed.accessToken),
        refreshToken: parsed.refreshToken ? this.decryptToken(parsed.refreshToken) : null,
        accountInfo: JSON.parse(parsed.accountInfo || '{}'),
      };
    } catch (e) {
      console.error(`Failed to parse connection for ${userId}/${platform}:`, e);
      return null;
    }
  }

  /**
   * Get all connections for a user
   */
  static async getAll(redis, userId) {
    const connections = await redis.hgetall(this.getConnectionKey(userId));
    if (!connections) return {};

    const result = {};
    for (const [platform, data] of Object.entries(connections)) {
      try {
        const parsed = JSON.parse(data);
        result[platform] = {
          ...parsed,
          accessToken: this.decryptToken(parsed.accessToken),
          refreshToken: parsed.refreshToken ? this.decryptToken(parsed.refreshToken) : null,
          accountInfo: JSON.parse(parsed.accountInfo || '{}'),
        };
      } catch (e) {
        console.error(`Failed to parse connection for ${userId}/${platform}:`, e);
      }
    }
    return result;
  }

  /**
   * Delete a social connection
   */
  static async delete(redis, userId, platform) {
    await redis.hdel(this.getConnectionKey(userId), platform);
    await redis.del(this.getPlatformStatusKey(userId, platform));
  }

  /**
   * Check if user has a connection for a platform
   */
  static async hasConnection(redis, userId, platform) {
    const data = await redis.hget(this.getConnectionKey(userId), platform);
    return !!data;
  }

  /**
   * Store OAuth state for verification
   */
  static async storeOAuthState(redis, state, userId, platform, redirectUrl) {
    await redis.setex(
      `oauth:state:${state}`,
      600, // 10 minutes
      JSON.stringify({ userId, platform, redirectUrl, createdAt: new Date().toISOString() })
    );
  }

  /**
   * Retrieve and verify OAuth state
   */
  static async getOAuthState(redis, state) {
    const data = await redis.get(`oauth:state:${state}`);
    if (!data) return null;
    await redis.del(`oauth:state:${state}`); // Consume state after use
    return JSON.parse(data);
  }

  /**
   * Store rate limit info
   */
  static async recordRequest(redis, userId, platform) {
    const key = `ratelimit:${userId}:${platform}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 900); // 15 minutes
    }
    return count;
  }

  /**
   * Get current rate limit count
   */
  static async getRateLimit(redis, userId, platform) {
    const key = `ratelimit:${userId}:${platform}`;
    return await redis.get(key);
  }
}

module.exports = SocialConnectionsSchema;
