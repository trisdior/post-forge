/**
 * API Rate Limiting Middleware
 * Enforces tier-based monthly request limits
 */

const keyManager = require('../services/keyManager');

/**
 * Rate limiting middleware for API requests
 * Checks monthly usage and increments counter
 * Returns 429 if limit exceeded
 */
async function rateLimitApi(req, res, next) {
  // Skip rate limiting for non-API routes
  if (!req.path.startsWith('/api/v1/')) {
    return next();
  }

  // Check that apiKeyAuth ran first
  if (!req.apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key authentication failed'
    });
  }

  try {
    const keyId = req.apiKey.keyId;
    
    // Check usage and increment counter
    const usageCheck = await keyManager.checkAndIncrementUsage(keyId);

    if (!usageCheck.allowed) {
      const status = usageCheck.status || 429;
      const response = {
        error: usageCheck.reason,
        status: status
      };

      if (status === 429) {
        response.usage = usageCheck.usage;
        response.limit = usageCheck.limit;
        response.resetDate = usageCheck.resetDate;
        response.message = `Monthly API limit exceeded: ${usageCheck.usage}/${usageCheck.limit} requests used`;
        response.remainingDays = Math.ceil((new Date(usageCheck.resetDate) - new Date()) / (1000 * 60 * 60 * 24));
        response.upgradeUrl = 'https://postforge.com/pricing';
      }

      return res.status(status).json(response);
    }

    // Attach usage info to request for logging
    req.apiUsage = {
      usage: usageCheck.usage,
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
      resetDate: usageCheck.resetDate
    };

    // Add rate limit headers to response
    res.set('X-RateLimit-Limit', usageCheck.limit.toString());
    res.set('X-RateLimit-Remaining', usageCheck.remaining.toString());
    res.set('X-RateLimit-Reset', new Date(usageCheck.resetDate).getTime().toString());

    next();
  } catch (error) {
    console.error('[RATE_LIMIT]', error.message);
    res.status(500).json({
      error: 'Rate limit check failed',
      message: 'Unable to validate rate limits'
    });
  }
}

module.exports = rateLimitApi;
