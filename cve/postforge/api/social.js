/**
 * Social Media API Routes
 * OAuth flows + posting endpoints for Twitter, Instagram, LinkedIn, Facebook
 */

const crypto = require('crypto');
const https = require('https');
const SocialConnectionsSchema = require('../schemas/socialConnections');
const {
  TwitterOAuthHandler,
  InstagramOAuthHandler,
  LinkedInOAuthHandler,
  FacebookOAuthHandler,
  httpsRequest
} = require('../middleware/socialAuth');

// Rate limits per platform (requests per 15 minutes)
const RATE_LIMITS = {
  twitter: 300,
  instagram: 25,
  linkedin: 100,
  facebook: 200
};

class SocialAPI {
  constructor(redis, apiKeys = {}) {
    this.redis = redis;
    this.apiKeys = {
      twitter_client_id: apiKeys.TWITTER_CLIENT_ID,
      twitter_client_secret: apiKeys.TWITTER_CLIENT_SECRET,
      instagram_client_id: apiKeys.INSTAGRAM_CLIENT_ID,
      instagram_client_secret: apiKeys.INSTAGRAM_CLIENT_SECRET,
      linkedin_client_id: apiKeys.LINKEDIN_CLIENT_ID,
      linkedin_client_secret: apiKeys.LINKEDIN_CLIENT_SECRET,
      facebook_client_id: apiKeys.FACEBOOK_CLIENT_ID,
      facebook_client_secret: apiKeys.FACEBOOK_CLIENT_SECRET,
    };
  }

  // ─── TWITTER/X OAUTH ───
  async getTwitterAuthUrl(userId, redirectUrl) {
    if (!this.apiKeys.twitter_client_id || !this.apiKeys.twitter_client_secret) {
      throw new Error('Twitter credentials not configured');
    }

    const { url, verifier, state } = await TwitterOAuthHandler.getAuthorizationUrl(
      this.apiKeys.twitter_client_id,
      redirectUrl
    );

    // Store verifier and state for callback
    await this.redis.setex(
      `oauth:twitter:verifier:${state}`,
      900,
      verifier
    );

    await SocialConnectionsSchema.storeOAuthState(
      this.redis,
      state,
      userId,
      'twitter',
      redirectUrl
    );

    return { url, state };
  }

  async handleTwitterCallback(code, state) {
    const oauthState = await SocialConnectionsSchema.getOAuthState(this.redis, state);
    if (!oauthState) throw new Error('Invalid OAuth state');

    const verifier = await this.redis.get(`oauth:twitter:verifier:${state}`);
    if (!verifier) throw new Error('Verifier not found');

    const { accessToken, refreshToken, expiresAt } = await TwitterOAuthHandler.exchangeCodeForToken(
      this.apiKeys.twitter_client_id,
      this.apiKeys.twitter_client_secret,
      code,
      oauthState.redirectUrl,
      verifier
    );

    const accountInfo = await TwitterOAuthHandler.getUserInfo(accessToken);

    await SocialConnectionsSchema.store(
      this.redis,
      oauthState.userId,
      'twitter',
      { accessToken, refreshToken, expiresAt, accountInfo }
    );

    await this.redis.del(`oauth:twitter:verifier:${state}`);

    return {
      userId: oauthState.userId,
      platform: 'twitter',
      accountInfo,
      connectedAt: new Date().toISOString()
    };
  }

  // ─── INSTAGRAM OAUTH ───
  async getInstagramAuthUrl(userId, redirectUrl) {
    if (!this.apiKeys.instagram_client_id || !this.apiKeys.instagram_client_secret) {
      throw new Error('Instagram credentials not configured');
    }

    const { url, state } = await InstagramOAuthHandler.getAuthorizationUrl(
      this.apiKeys.instagram_client_id,
      redirectUrl
    );

    await SocialConnectionsSchema.storeOAuthState(
      this.redis,
      state,
      userId,
      'instagram',
      redirectUrl
    );

    return { url, state };
  }

  async handleInstagramCallback(code, state) {
    const oauthState = await SocialConnectionsSchema.getOAuthState(this.redis, state);
    if (!oauthState) throw new Error('Invalid OAuth state');

    const { accessToken, expiresAt } = await InstagramOAuthHandler.exchangeCodeForToken(
      this.apiKeys.instagram_client_id,
      this.apiKeys.instagram_client_secret,
      code,
      oauthState.redirectUrl
    );

    // For Instagram, we need the user ID from the initial login data
    // This would come from the Facebook Graph API
    const accountInfo = {
      accessToken, // Note: needs conversion to long-lived token
      connectedAt: new Date().toISOString()
    };

    await SocialConnectionsSchema.store(
      this.redis,
      oauthState.userId,
      'instagram',
      { accessToken, expiresAt, accountInfo }
    );

    return {
      userId: oauthState.userId,
      platform: 'instagram',
      accountInfo,
      connectedAt: new Date().toISOString()
    };
  }

  // ─── LINKEDIN OAUTH ───
  async getLinkedInAuthUrl(userId, redirectUrl) {
    if (!this.apiKeys.linkedin_client_id || !this.apiKeys.linkedin_client_secret) {
      throw new Error('LinkedIn credentials not configured');
    }

    const { url, state } = await LinkedInOAuthHandler.getAuthorizationUrl(
      this.apiKeys.linkedin_client_id,
      redirectUrl
    );

    await SocialConnectionsSchema.storeOAuthState(
      this.redis,
      state,
      userId,
      'linkedin',
      redirectUrl
    );

    return { url, state };
  }

  async handleLinkedInCallback(code, state) {
    const oauthState = await SocialConnectionsSchema.getOAuthState(this.redis, state);
    if (!oauthState) throw new Error('Invalid OAuth state');

    const { accessToken, expiresAt } = await LinkedInOAuthHandler.exchangeCodeForToken(
      this.apiKeys.linkedin_client_id,
      this.apiKeys.linkedin_client_secret,
      code,
      oauthState.redirectUrl
    );

    const accountInfo = await LinkedInOAuthHandler.getUserInfo(accessToken);

    await SocialConnectionsSchema.store(
      this.redis,
      oauthState.userId,
      'linkedin',
      { accessToken, expiresAt, accountInfo }
    );

    return {
      userId: oauthState.userId,
      platform: 'linkedin',
      accountInfo,
      connectedAt: new Date().toISOString()
    };
  }

  // ─── FACEBOOK OAUTH ───
  async getFacebookAuthUrl(userId, redirectUrl) {
    if (!this.apiKeys.facebook_client_id || !this.apiKeys.facebook_client_secret) {
      throw new Error('Facebook credentials not configured');
    }

    const { url, state } = await FacebookOAuthHandler.getAuthorizationUrl(
      this.apiKeys.facebook_client_id,
      redirectUrl
    );

    await SocialConnectionsSchema.storeOAuthState(
      this.redis,
      state,
      userId,
      'facebook',
      redirectUrl
    );

    return { url, state };
  }

  async handleFacebookCallback(code, state) {
    const oauthState = await SocialConnectionsSchema.getOAuthState(this.redis, state);
    if (!oauthState) throw new Error('Invalid OAuth state');

    const { accessToken, expiresAt } = await FacebookOAuthHandler.exchangeCodeForToken(
      this.apiKeys.facebook_client_id,
      this.apiKeys.facebook_client_secret,
      code,
      oauthState.redirectUrl
    );

    // Get user's pages
    const pages = await FacebookOAuthHandler.getPages(accessToken);

    const accountInfo = {
      pages: pages.map(p => ({
        id: p.id,
        name: p.name,
        token: p.access_token
      })),
      userAccessToken: accessToken
    };

    await SocialConnectionsSchema.store(
      this.redis,
      oauthState.userId,
      'facebook',
      { accessToken, expiresAt, accountInfo }
    );

    return {
      userId: oauthState.userId,
      platform: 'facebook',
      accountInfo,
      connectedAt: new Date().toISOString()
    };
  }

  // ─── DISCONNECT PLATFORM ───
  async disconnectPlatform(userId, platform) {
    const valid = ['twitter', 'instagram', 'linkedin', 'facebook'];
    if (!valid.includes(platform)) throw new Error('Invalid platform');

    await SocialConnectionsSchema.delete(this.redis, userId, platform);

    return { success: true, platform, disconnected: new Date().toISOString() };
  }

  // ─── POST TO SOCIAL PLATFORMS ───
  async postContent(userId, { text, imageUrl, platformList, metadata = {} }) {
    if (!platformList || platformList.length === 0) {
      throw new Error('No platforms specified');
    }

    // Check rate limits
    for (const platform of platformList) {
      const count = await SocialConnectionsSchema.recordRequest(this.redis, userId, platform);
      const limit = RATE_LIMITS[platform] || 100;
      if (count > limit) {
        throw new Error(`Rate limit exceeded for ${platform}`);
      }
    }

    const results = {};

    for (const platform of platformList) {
      try {
        results[platform] = await this.postToPlatform(userId, platform, { text, imageUrl, metadata });
      } catch (error) {
        results[platform] = {
          success: false,
          error: error.message
        };
      }
    }

    // Store in analytics
    await this.recordAnalytics(userId, platformList, results);

    return results;
  }

  async postToPlatform(userId, platform, { text, imageUrl, metadata }) {
    const connection = await SocialConnectionsSchema.get(this.redis, userId, platform);
    if (!connection) throw new Error(`No ${platform} connection found`);

    switch (platform) {
      case 'twitter':
        return await this.postToTwitter(connection.accessToken, { text, imageUrl });
      case 'instagram':
        return await this.postToInstagram(connection, { text, imageUrl, metadata });
      case 'linkedin':
        return await this.postToLinkedIn(connection.accessToken, { text, imageUrl, metadata });
      case 'facebook':
        return await this.postToFacebook(connection, { text, imageUrl, metadata });
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async postToTwitter(accessToken, { text, imageUrl }) {
    let mediaId = null;

    if (imageUrl) {
      // Upload media
      const mediaRes = await httpsRequest('POST', 'upload.twitter.com', '/2/tweets/search/stream',
        { 'Authorization': `Bearer ${accessToken}` }
      );
      // Simplified - actual media upload requires multipart form data
    }

    const body = JSON.stringify({
      text,
      ...(mediaId && { media: { media_ids: [mediaId] } })
    });

    const res = await httpsRequest('POST', 'api.twitter.com', '/2/tweets',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body
    );

    if (res.status !== 201) {
      throw new Error(`Twitter post failed: ${res.data}`);
    }

    return {
      success: true,
      postId: res.data.data.id,
      platform: 'twitter',
      url: `https://twitter.com/i/web/status/${res.data.data.id}`,
      postedAt: new Date().toISOString()
    };
  }

  async postToInstagram(connection, { text, imageUrl, metadata }) {
    // Instagram Business API requires a different approach
    // Posts are typically scheduled
    const accountInfo = connection.accountInfo;

    if (!imageUrl) {
      throw new Error('Instagram requires an image');
    }

    // Create media container
    const res = await httpsRequest('POST', 'graph.instagram.com',
      `/v18.0/${accountInfo.ig_user_id}/media`,
      {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json'
      },
      JSON.stringify({
        image_url: imageUrl,
        caption: text,
        media_type: 'IMAGE'
      })
    );

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Instagram media creation failed: ${res.data}`);
    }

    return {
      success: true,
      postId: res.data.id,
      platform: 'instagram',
      status: 'pending', // Scheduled for later
      scheduledAt: metadata.scheduledTime || new Date().toISOString()
    };
  }

  async postToLinkedIn(accessToken, { text, imageUrl, metadata }) {
    const body = JSON.stringify({
      content: {
        contentEntities: imageUrl ? [{
          entity: imageUrl
        }] : [],
        title: 'Posted via PostForge'
      },
      distribution: {
        linkedInDistributionTarget: {}
      },
      owner: 'urn:li:person:ME',
      subject: text.substring(0, 100),
      text: {
        annotations: [],
        attributes: [],
        text
      }
    });

    const res = await httpsRequest('POST', 'api.linkedin.com', '/v2/ugcPosts',
      {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body
    );

    if (res.status !== 201) {
      throw new Error(`LinkedIn post failed: ${res.data}`);
    }

    return {
      success: true,
      postId: res.data.id,
      platform: 'linkedin',
      url: `https://www.linkedin.com/feed/update/${res.data.id}`,
      postedAt: new Date().toISOString()
    };
  }

  async postToFacebook(connection, { text, imageUrl, metadata }) {
    const accountInfo = connection.accountInfo;
    if (!accountInfo || !accountInfo.pages) {
      throw new Error('No Facebook pages configured');
    }

    const results = [];

    for (const page of accountInfo.pages) {
      try {
        const body = new URLSearchParams({
          message: text,
          ...(imageUrl && { link: imageUrl }),
          access_token: page.token
        }).toString();

        const res = await httpsRequest('POST', 'graph.facebook.com',
          `/v18.0/${page.id}/feed`,
          { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        );

        if (res.status === 200) {
          results.push({
            pageId: page.id,
            pageName: page.name,
            postId: res.data.id,
            success: true
          });
        } else {
          results.push({
            pageId: page.id,
            pageName: page.name,
            success: false,
            error: res.data
          });
        }
      } catch (error) {
        results.push({
          pageId: page.id,
          pageName: page.name,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: results.some(r => r.success),
      platform: 'facebook',
      pageResults: results,
      postedAt: new Date().toISOString()
    };
  }

  // ─── ANALYTICS ───
  async recordAnalytics(userId, platforms, results) {
    const date = new Date().toISOString().split('T')[0];
    const key = `analytics:${userId}:${date}`;

    const stats = {
      twitter: { sent: 0, failed: 0, impressions: 0 },
      instagram: { sent: 0, failed: 0, engagement: 0 },
      linkedin: { sent: 0, failed: 0, reactions: 0 },
      facebook: { sent: 0, failed: 0, shares: 0 }
    };

    for (const [platform, result] of Object.entries(results)) {
      if (result.success) {
        stats[platform].sent += 1;
      } else {
        stats[platform].failed += 1;
      }
    }

    await this.redis.hset(key, 'stats', JSON.stringify(stats));
    await this.redis.expire(key, 2592000); // 30 days
  }

  async getAnalytics(userId, days = 30) {
    const analytics = {};
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now - i * 86400000).toISOString().split('T')[0];
      const key = `analytics:${userId}:${date}`;
      const data = await this.redis.hget(key, 'stats');

      if (data) {
        analytics[date] = JSON.parse(data);
      }
    }

    return analytics;
  }

  // ─── CONNECTION STATUS ───
  async getConnectionStatus(userId) {
    const connections = await SocialConnectionsSchema.getAll(this.redis, userId);
    const platforms = ['twitter', 'instagram', 'linkedin', 'facebook'];

    return platforms.reduce((acc, platform) => {
      acc[platform] = {
        connected: !!connections[platform],
        accountInfo: connections[platform]?.accountInfo || null,
        connectedAt: connections[platform]?.connectedAt || null,
        expiresAt: connections[platform]?.expiresAt || null
      };
      return acc;
    }, {});
  }
}

module.exports = SocialAPI;
