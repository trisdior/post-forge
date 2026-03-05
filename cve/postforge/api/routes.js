/**
 * Express Routes for Social Media API
 */

const SocialAPI = require('./social');

module.exports = function setupSocialRoutes(app, redis) {
  // Initialize SocialAPI with environment variables
  const socialApi = new SocialAPI(redis, {
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
    INSTAGRAM_CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  });

  // Helper: Get user from request
  const getUser = (req) => {
    // Assumes user ID is in session or auth token
    // For now, use query param or header
    return req.query.userId || req.headers['x-user-id'] || req.body.userId || 'user123';
  };

  // Helper: Error response
  const errorResponse = (res, status, message) => {
    res.status(status).json({ error: message, timestamp: new Date().toISOString() });
  };

  // ─── OAUTH AUTHORIZATION ENDPOINTS ───

  // GET /api/social/auth/twitter
  app.get('/api/social/auth/twitter', async (req, res) => {
    try {
      const userId = getUser(req);
      const redirectUrl = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/social/callback/twitter`;

      const { url, state } = await socialApi.getTwitterAuthUrl(userId, redirectUrl);

      res.json({ authUrl: url, state });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/auth/instagram
  app.get('/api/social/auth/instagram', async (req, res) => {
    try {
      const userId = getUser(req);
      const redirectUrl = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/social/callback/instagram`;

      const { url, state } = await socialApi.getInstagramAuthUrl(userId, redirectUrl);

      res.json({ authUrl: url, state });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/auth/linkedin
  app.get('/api/social/auth/linkedin', async (req, res) => {
    try {
      const userId = getUser(req);
      const redirectUrl = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/social/callback/linkedin`;

      const { url, state } = await socialApi.getLinkedInAuthUrl(userId, redirectUrl);

      res.json({ authUrl: url, state });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/auth/facebook
  app.get('/api/social/auth/facebook', async (req, res) => {
    try {
      const userId = getUser(req);
      const redirectUrl = req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/social/callback/facebook`;

      const { url, state } = await socialApi.getFacebookAuthUrl(userId, redirectUrl);

      res.json({ authUrl: url, state });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // ─── OAUTH CALLBACK ENDPOINTS ───

  // GET /api/social/callback/twitter
  app.get('/api/social/callback/twitter', async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return errorResponse(res, 400, `Twitter auth error: ${error}`);
      }

      if (!code || !state) {
        return errorResponse(res, 400, 'Missing code or state');
      }

      const result = await socialApi.handleTwitterCallback(code, state);

      // Redirect to settings page with success
      res.redirect(`/settings.html?connected=twitter&account=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/callback/instagram
  app.get('/api/social/callback/instagram', async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return errorResponse(res, 400, `Instagram auth error: ${error}`);
      }

      if (!code || !state) {
        return errorResponse(res, 400, 'Missing code or state');
      }

      const result = await socialApi.handleInstagramCallback(code, state);

      res.redirect(`/settings.html?connected=instagram&account=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/callback/linkedin
  app.get('/api/social/callback/linkedin', async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return errorResponse(res, 400, `LinkedIn auth error: ${error}`);
      }

      if (!code || !state) {
        return errorResponse(res, 400, 'Missing code or state');
      }

      const result = await socialApi.handleLinkedInCallback(code, state);

      res.redirect(`/settings.html?connected=linkedin&account=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // GET /api/social/callback/facebook
  app.get('/api/social/callback/facebook', async (req, res) => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return errorResponse(res, 400, `Facebook auth error: ${error}`);
      }

      if (!code || !state) {
        return errorResponse(res, 400, 'Missing code or state');
      }

      const result = await socialApi.handleFacebookCallback(code, state);

      res.redirect(`/settings.html?connected=facebook&account=${encodeURIComponent(JSON.stringify(result))}`);
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // ─── POST CONTENT ENDPOINT ───

  // POST /api/social/post
  app.post('/api/social/post', async (req, res) => {
    try {
      const userId = getUser(req);
      const { text, imageUrl, platformList, metadata } = req.body;

      if (!text && !imageUrl) {
        return errorResponse(res, 400, 'Text or image required');
      }

      const results = await socialApi.postContent(userId, {
        text,
        imageUrl,
        platformList,
        metadata
      });

      res.json({
        success: Object.values(results).some(r => r.success),
        results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // ─── DISCONNECT ENDPOINT ───

  // DELETE /api/social/disconnect/:platform
  app.delete('/api/social/disconnect/:platform', async (req, res) => {
    try {
      const userId = getUser(req);
      const { platform } = req.params;

      const result = await socialApi.disconnectPlatform(userId, platform);

      res.json(result);
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // ─── STATUS ENDPOINT ───

  // GET /api/social/status
  app.get('/api/social/status', async (req, res) => {
    try {
      const userId = getUser(req);

      const status = await socialApi.getConnectionStatus(userId);

      res.json({
        userId,
        connections: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  // ─── ANALYTICS ENDPOINT ───

  // GET /api/social/analytics
  app.get('/api/social/analytics', async (req, res) => {
    try {
      const userId = getUser(req);
      const days = parseInt(req.query.days) || 30;

      const analytics = await socialApi.getAnalytics(userId, Math.min(days, 365));

      res.json({
        userId,
        period: `${days} days`,
        analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      errorResponse(res, 500, error.message);
    }
  });

  console.log('✓ Social Media API routes initialized');
};
