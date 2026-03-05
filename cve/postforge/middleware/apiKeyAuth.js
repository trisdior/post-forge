/**
 * API Key Authentication Middleware
 * Extracts and validates API key from x-api-key header
 */

const keyManager = require('../services/keyManager');

/**
 * Middleware to authenticate API requests using API keys
 * Extracts key from x-api-key header and validates it
 */
async function apiKeyAuth(req, res, next) {
  // Skip auth for non-API routes
  if (!req.path.startsWith('/api/v1/')) {
    return next();
  }

  // Extract API key from header
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key',
      message: 'Please provide an x-api-key header',
      docs: 'https://postforge.com/api-docs'
    });
  }

  try {
    // Validate the key
    const validation = await keyManager.validateKey(apiKey);
    
    if (!validation.valid) {
      return res.status(validation.status || 401).json({
        error: 'Invalid API key',
        message: validation.reason,
        docs: 'https://postforge.com/api-docs'
      });
    }

    // Attach to request object for use in route handlers
    req.apiKey = {
      key: apiKey,
      keyId: validation.keyId,
      email: validation.email,
      tier: validation.tier,
      limit: validation.limit
    };

    next();
  } catch (error) {
    console.error('[API_AUTH]', error.message);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Unable to validate API key'
    });
  }
}

module.exports = apiKeyAuth;
