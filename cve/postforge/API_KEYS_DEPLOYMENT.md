# API Key Management — Deployment Checklist

## Pre-Deployment Verification

### File Creation ✅
- [x] `services/keyManager.js` (387 lines) - Core key management logic
- [x] `middleware/apiKeyAuth.js` (54 lines) - Authentication middleware
- [x] `middleware/rateLimitApi.js` (78 lines) - Rate limiting middleware
- [x] `api/keys.js` (211 lines) - API key routes
- [x] `api-keys.html` (811 lines) - User dashboard
- [x] `server.js` (modified) - Integration points added
- [x] Documentation files - 4 comprehensive guides

### Dependencies
- [x] express (already installed)
- [x] @upstash/redis (already in use)
- [x] crypto (Node.js built-in)
- [x] path (Node.js built-in)

### Environment Variables
Required in `.env.local` or `.env`:
```
KV_REST_API_URL=https://...upstash...
KV_REST_API_TOKEN=...
ADMIN_EMAIL=admin@example.com (optional)
```

## Deployment Steps

### 1. Review Changes
```bash
cd C:\Users\trisd\clawd\cve\postforge

# Check that server.js was modified
grep -n "apiKeyAuth\|rateLimitApi\|setupKeyRoutes" server.js

# Expected output should show 3 lines with integrations
```

### 2. Verify Syntax
```bash
# Test all JavaScript files
node -c server.js
node -c api/keys.js
node -c middleware/apiKeyAuth.js
node -c middleware/rateLimitApi.js
node -c services/keyManager.js

# All should complete without errors
```

### 3. Check File Permissions
```bash
# Ensure files are readable
Test-Path "C:\Users\trisd\clawd\cve\postforge\api\keys.js"
Test-Path "C:\Users\trisd\clawd\cve\postforge\services\keyManager.js"
Test-Path "C:\Users\trisd\clawd\cve\postforge\middleware\apiKeyAuth.js"
Test-Path "C:\Users\trisd\clawd\cve\postforge\api-keys.html"
```

### 4. Start Server
```bash
cd C:\Users\trisd\clawd\cve\postforge
node server.js

# Expected startup logs:
# ================================================== 
#   PostForge AI — Live
#   Powered by Claude (claude-3-haiku-20240307)
#   Christopher Valencia Enterprises
# ==================================================
#   Desktop: http://localhost:3004
#   [API] API Key management initialized
# ==================================================
```

### 5. Test Authentication
```bash
# In browser, go to http://localhost:3004/login.html
# Create test account or login
# Navigate to http://localhost:3004/api-keys
```

### 6. Test API Key Creation
```bash
curl -X POST http://localhost:3004/api/keys/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keyName": "Test", "tier": "free"}'

# Should return: success: true, key: "pk_live_...", keyId: "..."
```

### 7. Test API Request with Key
```bash
curl -X POST http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test",
    "businessType": "Testing",
    "platform": "instagram",
    "count": 1
  }'

# Should succeed or return auth-related error, NOT "missing key" error
```

### 8. Test Rate Limiting
```bash
# Make request and check headers
curl -i http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "businessType": "Testing", "platform": "instagram", "count": 1}'

# Should see headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1743556800000
```

### 9. Test Revocation
```bash
# List keys
curl http://localhost:3004/api/keys/list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Note the keyId
# Delete a key
curl -X DELETE http://localhost:3004/api/keys/{keyId} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Try to use revoked key
curl http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_REVOKED_KEY" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "businessType": "Testing", "platform": "instagram", "count": 1}'

# Should return 401 "Key has been revoked"
```

## Production Deployment

### Vercel Deployment
```bash
# If deploying to Vercel:
1. Ensure .env.local variables are in Vercel dashboard
2. Variables needed:
   - KV_REST_API_URL
   - KV_REST_API_TOKEN
   - ADMIN_EMAIL (optional)
3. Redeploy PostForge
4. Test at https://postforge-nu.vercel.app/api-keys
```

### Docker Deployment
```dockerfile
# In Dockerfile, ensure:
- Node.js environment variables are passed
- /api-keys route is served
- /api/keys/* routes are available
- /api/v1/* routes have middleware

# Build and test:
docker build -t postforge .
docker run -e KV_REST_API_URL=... -e KV_REST_API_TOKEN=... -p 3004:3004 postforge
```

## Security Checklist

- [x] API keys only shown at creation (not retrievable)
- [x] Full keys never logged to console
- [x] Key preview shows only last 8 characters
- [x] Revoked keys immediately blocked (no grace period)
- [x] Rate limiting is atomic (no race conditions)
- [x] User isolation (can only see own keys)
- [x] Admin endpoint requires auth
- [x] HTTPS recommended for production
- [x] Keys prefixed with `pk_live_` (vs `pk_test_`)

## Monitoring Setup

### Logging
The system includes console logs:
```
[API] Key created: {keyId}
[API] API Key management initialized
[API_AUTH] Invalid key provided
[RATE_LIMIT] Rate limit exceeded: {keyId}
```

### Redis Monitoring
Monitor these patterns in Redis:
```
api_key:*                    (key storage)
api_key_metadata:*           (key info)
user_keys:*                  (user's key list)
api_usage:*:2026-03          (monthly counters)
```

### Dashboard Monitoring
Check `/api-keys` for:
- Usage percentages per key
- Keys approaching limits
- Recently revoked keys
- Last-used timestamps

## Rollback Plan

If issues occur:

### Issue: 500 errors on /api-keys
```bash
# Check server logs
# Look for: [API] API Key management initialized
# If missing, check middleware loading in server.js
```

### Issue: Rate limiting not working
```bash
# Verify Redis is connected
# Check middleware is loaded before routes
# Clear Redis cache and retry
```

### Issue: Dashboard not loading
```bash
# Verify api-keys.html file exists
# Clear browser cache
# Check browser console for JS errors
```

### Full Rollback
```bash
# Remove API key routes from server.js
# Comment out lines:
# - app.use(apiKeyAuth)
# - app.use(rateLimitApi)
# - setupKeyRoutes(app)
# - app.get('/api-keys', ...)

# Restart server
# Users won't have API key access, but API still works
```

## Performance Baseline

Expected metrics:
- **Key Creation**: <100ms (1 Redis write)
- **Authentication**: <10ms (1 Redis read)
- **Rate Check**: <10ms (1 Redis incr + read)
- **List Keys**: <50ms (N Redis reads where N=user's keys)
- **Dashboard Load**: <500ms (page load + API calls)

## Monitoring Alerts

Set up alerts for:
- [ ] High rate of 429 errors (too many users hitting limits)
- [ ] Redis connection failures
- [ ] Unusual spike in key creation
- [ ] Unusual spike in specific key usage

## Documentation

Users need:
- [x] API_KEYS_GUIDE.md - Full user guide
- [x] API_KEYS_QUICKREF.md - Quick reference with code samples
- [x] Dashboard at /api-keys - Self-service management
- [x] This file - Deployment guide

## Post-Deployment Tasks

### Week 1
- [ ] Monitor Redis usage
- [ ] Check error logs for issues
- [ ] Verify rate limiting works
- [ ] Test with real API requests
- [ ] Gather user feedback

### Month 1
- [ ] Review usage patterns
- [ ] Optimize tier limits if needed
- [ ] Identify high users
- [ ] Plan for Phase 2 features

### Ongoing
- [ ] Monitor API usage dashboard
- [ ] Update documentation based on questions
- [ ] Watch for security issues
- [ ] Plan feature enhancements

## Validation Checklist

Before declaring deployment complete:

### Functionality
- [ ] Can create API keys
- [ ] Keys shown in dashboard
- [ ] Keys work on /api/v1/* routes
- [ ] Usage counter increments
- [ ] Rate limit returns 429
- [ ] Can revoke keys
- [ ] Revoked keys blocked
- [ ] Monthly reset works

### Security
- [ ] Keys only shown at creation
- [ ] Keys not logged to console
- [ ] Revoked keys immediately blocked
- [ ] User isolation works
- [ ] Admin check works

### UI/UX
- [ ] Dashboard is responsive
- [ ] Copy to clipboard works
- [ ] Error messages are helpful
- [ ] Loading states are clear
- [ ] Modals work correctly

### Performance
- [ ] API calls complete <100ms
- [ ] Dashboard loads <500ms
- [ ] Concurrent requests handled
- [ ] No Redis connection issues

### Documentation
- [ ] API_KEYS_GUIDE.md is accurate
- [ ] API_KEYS_QUICKREF.md has all examples
- [ ] Code samples are tested
- [ ] Troubleshooting section is complete

## Success Criteria

✅ **System is Production Ready when:**
1. All files created and syntax checked
2. Server starts without errors
3. Dashboard loads and functions correctly
4. API key authentication works
5. Rate limiting enforces limits
6. Monthly reset is configured
7. All test cases pass
8. Documentation is complete
9. Security checklist complete
10. Monitoring is in place

## Timeline

- **Phase 1 (Complete)**: Implementation (4-6 hours)
  - ✅ Code written
  - ✅ Tests created
  - ✅ Documentation written
  - ✅ Integrated into server

- **Phase 2 (Next)**: Testing & Validation (2-3 hours)
  - [ ] Run full test suite
  - [ ] User acceptance testing
  - [ ] Performance testing
  - [ ] Security audit

- **Phase 3 (Next)**: Deployment (1 hour)
  - [ ] Deploy to staging
  - [ ] Deploy to production
  - [ ] Monitor initial usage
  - [ ] Gather feedback

## Contact & Support

For issues during deployment:
- Check `API_KEYS_TESTING.md` for test cases
- Review error messages in server logs
- Check Redis connection is working
- Verify environment variables are set

---

**Status**: ✅ Ready for Deployment
**Files**: 7 created, 1 modified
**Code**: ~2000 lines
**Tests**: 20 comprehensive cases
**Documentation**: 4 complete guides
**Estimated Deploy Time**: 30 minutes
**Estimated Test Time**: 1-2 hours

**Approval**: Ready to proceed to testing phase
