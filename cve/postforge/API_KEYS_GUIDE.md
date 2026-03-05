# PostForge API Key Management Guide

## Overview

The PostForge API uses API keys for authentication. Each key has a tier-based monthly request limit that automatically resets on the first of each month.

## Key Concepts

### Tier Limits (Requests per Month)
- **Free**: 100 requests/month
- **Growth**: 1,000 requests/month  
- **Pro**: 10,000 requests/month
- **Business**: 100,000 requests/month

### Key Format
All API keys are prefixed with `pk_live_` followed by a random 64-character hex string.

Example: `pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0`

### Monthly Resets
Usage counters automatically reset at the first of each calendar month at 00:00 UTC. The `resetDate` in responses shows when your quota will reset.

## Dashboard

Visit `/api-keys` to manage your API keys:
- ✅ Generate new API keys
- 📊 View usage statistics
- 🔄 See monthly reset dates
- ❌ Revoke compromised keys

## API Key Management

### Create API Key
**Endpoint**: `POST /api/keys/create`

**Authentication**: Session token (via Bearer header)

**Request**:
```bash
curl -X POST https://postforge.local:3004/api/keys/create \
  -H "Authorization: Bearer your_session_token" \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "Production API",
    "tier": "pro"
  }'
```

**Response**:
```json
{
  "success": true,
  "key": "pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
  "keyId": "a1b2c3d4",
  "name": "Production API",
  "tier": "pro",
  "limit": 10000,
  "created": "2026-03-05T15:57:00Z",
  "message": "Save your API key in a safe place. You won't be able to see it again."
}
```

⚠️ **IMPORTANT**: The full API key is returned **only once**. Save it immediately. You cannot retrieve it later.

### List API Keys
**Endpoint**: `GET /api/keys/list`

**Request**:
```bash
curl https://postforge.local:3004/api/keys/list \
  -H "Authorization: Bearer your_session_token"
```

**Response**:
```json
{
  "success": true,
  "tier": "pro",
  "email": "user@example.com",
  "keys": [
    {
      "keyId": "a1b2c3d4",
      "name": "Production API",
      "tier": "pro",
      "preview": "pk_live_a1b2c3d4...",
      "created": "2026-03-05T15:57:00Z",
      "lastUsed": "2026-03-05T16:30:00Z",
      "usage": 234,
      "limit": 10000,
      "resetDate": "2026-04-01T00:00:00Z",
      "percentUsed": 2,
      "revoked": false
    }
  ]
}
```

### Get Key Statistics
**Endpoint**: `GET /api/keys/:keyId/stats`

**Request**:
```bash
curl https://postforge.local:3004/api/keys/a1b2c3d4/stats \
  -H "Authorization: Bearer your_session_token"
```

**Response**:
```json
{
  "success": true,
  "keyId": "a1b2c3d4",
  "name": "Production API",
  "tier": "pro",
  "created": "2026-03-05T15:57:00Z",
  "lastUsed": "2026-03-05T16:30:00Z",
  "usage": 234,
  "limit": 10000,
  "remaining": 9766,
  "resetDate": "2026-04-01T00:00:00Z",
  "percentUsed": 2
}
```

### Revoke API Key
**Endpoint**: `DELETE /api/keys/:keyId`

**Request**:
```bash
curl -X DELETE https://postforge.local:3004/api/keys/a1b2c3d4 \
  -H "Authorization: Bearer your_session_token"
```

**Response**:
```json
{
  "success": true,
  "message": "API key revoked successfully",
  "keyId": "a1b2c3d4"
}
```

⚠️ **IRREVERSIBLE**: Once revoked, a key cannot be restored. Any applications using it will immediately stop working.

## Using API Keys

### Authentication
Include your API key in the `x-api-key` header for all requests to `/api/v1/*` endpoints.

### Request Format
```bash
curl https://postforge.local:3004/api/v1/generate \
  -H "x-api-key: pk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Acme Corp",
    "businessType": "General Contracting",
    "platform": "instagram",
    "count": 5
  }'
```

### Response Headers
The API includes rate limit information in response headers:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9766
X-RateLimit-Reset: 1743556800000
```

### Error Responses

**Missing API Key** (401):
```json
{
  "error": "Missing API key",
  "message": "Please provide an x-api-key header",
  "docs": "https://postforge.com/api-docs"
}
```

**Invalid API Key** (401):
```json
{
  "error": "Invalid API key",
  "message": "Key not found",
  "docs": "https://postforge.com/api-docs"
}
```

**Revoked Key** (401):
```json
{
  "error": "Invalid API key",
  "message": "Key has been revoked",
  "docs": "https://postforge.com/api-docs"
}
```

**Rate Limit Exceeded** (429):
```json
{
  "error": "Monthly API limit exceeded: 10000/10000 requests used",
  "status": 429,
  "usage": 10000,
  "limit": 10000,
  "resetDate": "2026-04-01T00:00:00Z",
  "remainingDays": 27,
  "upgradeUrl": "https://postforge.com/pricing"
}
```

## Examples

### Generate Social Media Posts
```bash
curl -X POST https://postforge.local:3004/api/v1/generate \
  -H "x-api-key: pk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Valencia Construction",
    "businessType": "Kitchen Remodeling & General Contracting",
    "location": "Chicago, IL",
    "platform": "instagram",
    "count": 5,
    "brandVoice": "friendly, professional, local expert"
  }'
```

**Response**:
```json
[
  {
    "id": 1,
    "platform": "instagram",
    "type": "showcase",
    "content": "Just finished this stunning kitchen transformation... [post text]",
    "image_suggestion": "Close-up of quartz countertop with coffee cup...",
    "best_time": "Tuesday 6:30 PM"
  },
  ...
]
```

### Check Rate Limit Status
```bash
curl https://postforge.local:3004/api/v1/generate \
  -H "x-api-key: pk_live_your_api_key_here" \
  -X OPTIONS

# Check the X-RateLimit-* headers
```

### Create Captions for Videos
```bash
curl -X POST https://postforge.local:3004/api/v1/clips \
  -H "x-api-key: pk_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://example.com/video.mp4",
    "style": "hormozi",
    "platform": "tiktok"
  }'
```

## Security Best Practices

1. **Never share API keys** — Treat them like passwords
2. **Use environment variables** — Don't hardcode keys in source code
3. **Rotate regularly** — Revoke old keys and generate new ones periodically
4. **Use specific tiers** — Don't give all keys the highest tier
5. **Monitor usage** — Check your usage dashboard regularly for unusual activity
6. **Revoke compromised keys** — Act immediately if a key is exposed

## Rate Limiting Strategy

- Requests reset on the 1st of each month at 00:00 UTC
- Usage is tracked per API key, not per user
- If you exceed your limit, you'll receive a 429 response
- To increase your limit, upgrade your plan via the settings page

## Monitoring & Alerts

Check your usage dashboard (`/api-keys`) to:
- See current monthly usage
- View reset dates
- Identify approaching limits
- Monitor last-used timestamps

## Troubleshooting

### "Key not found"
The API key doesn't exist or hasn't been created yet. Create a new key in the dashboard.

### "Key has been revoked"
The key was deliberately disabled. Create a new key to continue.

### "Monthly rate limit exceeded"
You've used all requests for this month. Upgrade your plan or wait until the reset date.

### "Server error" on key creation
Check that you're authenticated with a valid session token and that your user account exists.

## Support

For API issues or questions:
- Check the dashboard for usage info: `/api-keys`
- See the main API docs: https://postforge.com/api-docs
- Contact support: support@postforge.com

---

**Last Updated**: March 5, 2026
**API Version**: v1
**Auth Method**: API Key (x-api-key header)
