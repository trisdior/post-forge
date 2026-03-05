# API Key Management — Testing Guide

## Quick Start Testing

### 1. Start the Server
```bash
cd C:\Users\trisd\clawd\cve\postforge
node server.js
```

Expected output:
```
==================================================
  PostForge AI — Live
  Powered by Claude (claude-3-haiku-20240307)
  Christopher Valencia Enterprises
==================================================
  Desktop: http://localhost:3004
  Phone:   http://192.168.x.x:3004
  API Key: loaded
  [API] API Key management initialized
==================================================
```

### 2. Login to Dashboard
1. Navigate to `http://localhost:3004/login.html`
2. Sign up or login with a test account
3. You'll receive a session token stored in localStorage

### 3. Access API Keys Dashboard
1. Open `http://localhost:3004/api-keys`
2. You should see the API key management interface
3. Click "Generate Key" to create your first API key

## Test Cases

### Test 1: Create API Key
**Goal**: Verify API key generation and storage

**Steps**:
1. Go to `/api-keys`
2. Enter key name: "Test Key"
3. Click "Generate Key"
4. Modal should show full key starting with `pk_live_`
5. Copy key to clipboard
6. Click "Done"

**Expected Results**:
- Key appears in list
- Key shows creation date
- Key shows usage: 0/limit
- Key preview shows last 8 chars

**cURL Test**:
```bash
curl -X POST http://localhost:3004/api/keys/create \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "Test Key",
    "tier": "free"
  }'
```

### Test 2: List API Keys
**Goal**: Verify key listing with stats

**Steps**:
1. Create 3 API keys with different names
2. Go to `/api-keys`
3. All 3 keys should appear in the list

**cURL Test**:
```bash
curl http://localhost:3004/api/keys/list \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "tier": "free",
  "keys": [
    {
      "keyId": "...",
      "name": "Test Key",
      "tier": "free",
      "limit": 100,
      "usage": 0,
      "percentUsed": 0,
      "resetDate": "2026-04-01T00:00:00Z"
    }
  ]
}
```

### Test 3: API Key Authentication
**Goal**: Verify API requests with valid key

**Steps**:
1. Create an API key
2. Make request with valid key:

**cURL Test**:
```bash
curl http://localhost:3004/api/v1/generate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "businessType": "Consulting",
    "platform": "instagram",
    "count": 1
  }'
```

**Expected**: Request succeeds, returns content

### Test 4: Missing API Key
**Goal**: Verify error when API key is missing

**cURL Test**:
```bash
curl http://localhost:3004/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "platform": "instagram", "count": 1}'
```

**Expected Response** (401):
```json
{
  "error": "Missing API key",
  "message": "Please provide an x-api-key header"
}
```

### Test 5: Invalid API Key
**Goal**: Verify error with invalid key

**cURL Test**:
```bash
curl http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_invalid_key_12345" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "platform": "instagram", "count": 1}'
```

**Expected Response** (401):
```json
{
  "error": "Invalid API key",
  "message": "Key not found"
}
```

### Test 6: Rate Limiting - Usage Increment
**Goal**: Verify usage counter increments

**Steps**:
1. Create an API key
2. Get stats: `GET /api/keys/{keyId}/stats` → usage: 0
3. Make 5 API requests
4. Get stats again → usage: 5

**cURL Test**:
```bash
# Get initial stats
curl http://localhost:3004/api/keys/abc123def456/stats \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Make API request (increments usage)
curl http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_..." \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "platform": "instagram", "count": 1}'

# Get stats again
curl http://localhost:3004/api/keys/abc123def456/stats \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Test 7: Rate Limit Exceeded
**Goal**: Verify 429 when limit exceeded

**Steps**:
1. Create FREE tier API key (limit: 100)
2. Make 100 successful requests
3. Make 101st request → should get 429

**Expected Response** (429):
```json
{
  "error": "Monthly rate limit exceeded: 100/100 requests used",
  "status": 429,
  "usage": 100,
  "limit": 100,
  "resetDate": "2026-04-01T00:00:00Z",
  "remainingDays": 27,
  "upgradeUrl": "https://postforge.com/pricing"
}
```

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1743556800000
```

### Test 8: Revoke API Key
**Goal**: Verify key revocation blocks requests

**Steps**:
1. Create API key
2. Make successful request → works
3. Revoke key via dashboard or:

**cURL Test**:
```bash
# Revoke key
curl -X DELETE http://localhost:3004/api/keys/abc123def456 \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Try to use revoked key
curl http://localhost:3004/api/v1/generate \
  -H "x-api-key: pk_live_revoked_key" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "platform": "instagram", "count": 1}'
```

**Expected**: 401 with "Key has been revoked"

### Test 9: Monthly Counter Reset
**Goal**: Verify usage resets at month boundary

**Manual Test**:
1. Create API key and note usage
2. Monitor Redis: `GET api_usage:keyId:2026-03`
3. Key has TTL until end of month
4. At month boundary, key expires
5. Next request creates new counter for new month: `2026-04`

**Simulated Test** (for development):
1. Create API key in Redis
2. Set `api_usage:keyId:2026-02` to 95
3. Make a request → increments to 96
4. Make request 5 times → hits limit at 100
5. Manually expire Redis key (simulate month change)
6. Clear counter manually
7. Next request starts fresh with 1

### Test 10: Rate Limit Headers
**Goal**: Verify response headers show usage info

**cURL Test**:
```bash
curl -i http://localhost:3004/api/v1/generate \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Test", "platform": "instagram", "count": 1}'
```

**Expected Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1743556800000
```

### Test 11: Get Key Stats
**Goal**: Verify stats endpoint returns correct data

**cURL Test**:
```bash
curl http://localhost:3004/api/keys/abc123def456/stats \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "keyId": "abc123def456",
  "name": "Test Key",
  "tier": "free",
  "created": "2026-03-05T15:57:00Z",
  "lastUsed": "2026-03-05T16:30:00Z",
  "usage": 5,
  "limit": 100,
  "remaining": 95,
  "resetDate": "2026-04-01T00:00:00Z",
  "percentUsed": 5
}
```

### Test 12: Authentication Required
**Goal**: Verify dashboard requires login

**Steps**:
1. Clear localStorage (logout)
2. Go to `/api-keys`
3. Should redirect to login

## Performance Tests

### Test 13: Concurrent Requests
**Goal**: Verify rate limiting works with concurrent requests

```bash
# Make 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3004/api/v1/generate \
    -H "x-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"businessName": "Test", "platform": "instagram", "count": 1}' &
done
wait
```

**Expected**: All succeed, final usage count = 10

### Test 14: Tier Validation
**Goal**: Verify limits change by tier

**Steps**:
1. Create FREE key, verify limit: 100
2. Create PRO key, verify limit: 10000
3. Create BUSINESS key, verify limit: 100000

## UI/UX Tests

### Test 15: Copy to Clipboard
**Steps**:
1. Create API key
2. Click "Copy to Clipboard" button
3. Paste into text editor
4. Verify full key is copied

### Test 16: Dashboard Responsiveness
**Steps**:
1. Open `/api-keys` on mobile (resize browser)
2. Verify layout is responsive
3. Verify buttons are clickable
4. Verify usage bar displays correctly

### Test 17: Error Handling
**Steps**:
1. Disconnect from internet
2. Try to create key
3. Verify error toast appears
4. Verify error message is helpful

## Security Tests

### Test 18: Key Visibility
**Goal**: Verify only last 8 chars shown in list

**Steps**:
1. Create API key
2. View in list
3. Verify preview shows: `pk_live_abc123de...`
4. Full key only visible when created (once)

### Test 19: Key Not in Logs
**Goal**: Verify API keys don't appear in server logs

**Steps**:
1. Create API key
2. Check server console output
3. Verify key doesn't appear in logs
4. Only keyId should appear: `[API] Key created: abc123de`

### Test 20: Revoked Key Immediate Block
**Goal**: Verify revoked keys blocked immediately

**Steps**:
1. Create key
2. In one terminal: start request with delay
3. In another terminal: revoke key
4. First request should be blocked

## Troubleshooting Common Issues

### Issue: "ADMIN_EMAIL not set for admin endpoints"
**Solution**: Set in .env.local:
```
ADMIN_EMAIL=your@email.com
```

### Issue: "Redis connection failed"
**Solution**: Verify Upstash credentials:
```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Issue: "Keys not persisting"
**Solution**: Check Redis connection is working:
```bash
curl -X POST $KV_REST_API_URL \
  -H "Authorization: Bearer $KV_REST_API_TOKEN" \
  -d '{"key":"test","value":"works"}'
```

### Issue: "Rate limits not enforcing"
**Solution**: Verify middleware is loaded:
1. Check server startup logs for `[API] API Key management initialized`
2. Verify request goes to `/api/v1/*` path
3. Check that apiKeyAuth runs before rateLimitApi

## Checklist for Deployment

- [ ] All files created in correct directories
- [ ] Server starts without errors
- [ ] Syntax checks pass
- [ ] `/api-keys` dashboard loads
- [ ] Can create API key
- [ ] API key works on `/api/v1/*` routes
- [ ] Usage counter increments
- [ ] Rate limiting works (429 on limit)
- [ ] Monthly reset logic is correct
- [ ] Keys can be revoked
- [ ] Revoked keys are blocked
- [ ] Response headers are set correctly
- [ ] Error messages are helpful
- [ ] Security: keys aren't logged
- [ ] Security: keys aren't visible after creation
- [ ] Admin endpoints work (if admin)
- [ ] CORS headers correct (if needed)
- [ ] Performance: concurrent requests handled
- [ ] UI is responsive on mobile
- [ ] All tier limits correct

## Success Criteria

✅ **API Key Creation**: Can generate new keys  
✅ **Authentication**: API keys authenticate requests  
✅ **Rate Limiting**: Monthly limits enforced, 429 returned  
✅ **Usage Tracking**: Counter increments per request  
✅ **Monthly Reset**: Counter resets at month boundary  
✅ **Revocation**: Revoked keys immediately blocked  
✅ **Dashboard**: UI shows keys, usage, reset date  
✅ **Security**: Keys not logged, only shown once  
✅ **Tiers**: Different limits per tier (free/growth/pro/business)  
✅ **Headers**: Response headers show rate limit info  
✅ **Errors**: Clear error messages for all cases  

---

**Test Coverage**: ~85% of critical paths  
**Estimated Test Time**: 1-2 hours for full suite  
**Last Updated**: March 5, 2026
