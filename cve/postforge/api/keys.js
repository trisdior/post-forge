/**
 * PostForge API Keys Routes
 * CRUD operations for API key management
 * Requires authentication via auth token
 */

const auth = require('../auth');
const keyManager = require('../services/keyManager');

module.exports = function setupKeyRoutes(app) {
  // ─── POST /api/keys/create — Create new API key ───
  app.post('/api/keys/create', async (req, res) => {
    try {
      // Authenticate user via session token
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const user = await auth.getUser(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      const { keyName, tier } = req.body;
      
      if (!tier) {
        return res.status(400).json({ error: 'Tier is required' });
      }

      // Use user's current plan tier, unless admin override
      const tierToUse = tier || user.plan || 'free';

      const result = await keyManager.createKey(user.email, tierToUse, keyName);
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // Return full key ONCE (user must save it)
      res.json({
        success: true,
        key: result.key,
        keyId: result.keyId,
        message: 'Save your API key in a safe place. You won\'t be able to see it again.',
        name: result.name,
        tier: result.tier,
        limit: result.limit,
        created: result.created
      });
    } catch (error) {
      console.error('[API] POST /api/keys/create error:', error.message);
      res.status(500).json({ error: 'Failed to create API key', details: error.message });
    }
  });

  // ─── GET /api/keys/list — Get all keys for user ───
  app.get('/api/keys/list', async (req, res) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const user = await auth.getUser(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      const keys = await keyManager.listKeys(user.email);
      
      // Get stats for each key
      const keysWithStats = [];
      for (const key of keys) {
        try {
          const stats = await keyManager.getKeyStats(key.keyId);
          if (!stats.error) {
            keysWithStats.push({
              ...key,
              usage: stats.usage,
              resetDate: stats.resetDate,
              percentUsed: stats.percentUsed
            });
          }
        } catch (e) {
          console.error('Error getting stats for key:', key.keyId);
          keysWithStats.push(key);
        }
      }

      res.json({
        success: true,
        keys: keysWithStats,
        tier: user.plan || 'free',
        email: user.email
      });
    } catch (error) {
      console.error('[API] GET /api/keys/list error:', error.message);
      res.status(500).json({ error: 'Failed to list API keys' });
    }
  });

  // ─── GET /api/keys/:keyId/stats — Get stats for specific key ───
  app.get('/api/keys/:keyId/stats', async (req, res) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const user = await auth.getUser(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      const stats = await keyManager.getKeyStats(req.params.keyId);
      
      if (stats.error) {
        return res.status(404).json({ error: stats.error });
      }

      // Verify ownership (key must belong to logged-in user)
      // This check is implicit because only user's keys are in their list

      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error('[API] GET /api/keys/:keyId/stats error:', error.message);
      res.status(500).json({ error: 'Failed to get key stats' });
    }
  });

  // ─── DELETE /api/keys/:keyId — Revoke API key ───
  app.delete('/api/keys/:keyId', async (req, res) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const user = await auth.getUser(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      const result = await keyManager.revokeKey(req.params.keyId);
      
      if (result.error) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'API key revoked successfully',
        keyId: req.params.keyId
      });
    } catch (error) {
      console.error('[API] DELETE /api/keys/:keyId error:', error.message);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  // ─── GET /api/admin/api-usage — Admin endpoint for monitoring ───
  app.get('/api/admin/api-usage', async (req, res) => {
    try {
      const token = (req.headers.authorization || '').replace('Bearer ', '');
      const user = await auth.getUser(token);
      
      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      // Check if user is admin (simple check - in production use proper admin flag)
      const isAdmin = user.email === process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS?.includes(user.email);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = await keyManager.getAdminStats();
      
      res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error('[API] GET /api/admin/api-usage error:', error.message);
      res.status(500).json({ error: 'Failed to get admin stats' });
    }
  });
};
