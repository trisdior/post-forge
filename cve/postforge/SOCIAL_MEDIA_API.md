# PostForge Social Media Auto-Posting Integration

## Overview

Phase C implements OAuth flows and auto-posting for Twitter/X, Instagram, LinkedIn, and Facebook. Users can:
- Connect their social accounts via OAuth (secure, no passwords stored)
- Auto-post generated content to one or multiple platforms simultaneously
- Track analytics by platform
- Disconnect platforms anytime

## Architecture

### File Structure

```
postforge/
├── api/
│   ├── social.js          # Core SocialAPI class (OAuth + posting logic)
│   ├── routes.js          # Express route handlers
├── middleware/
│   ├── socialAuth.js      # OAuth handlers for each platform
├── schemas/
│   ├── socialConnections.js  # Redis schema for token storage
├── settings.html          # Updated with OAuth buttons
```

### Data Flow

```
User clicks "Connect Platform"
  ↓
Frontend requests /api/social/auth/{platform}
  ↓
Server generates OAuth state + verifier (stored in Redis)
  ↓
Redirects user to platform's OAuth page
  ↓
User grants permissions
  ↓
Platform redirects to /api/social/callback/{platform}?code=...&state=...
  ↓
Server exchanges code for access token
  ↓
Token encrypted + stored in Redis
  ↓
User redirected back to settings page (marked as "connected")
```

### Token Storage

All tokens are:
- **Encrypted** using AES-256-CBC with a 32-byte key from `ENCRYPTION_KEY` env var
- **Stored in Redis** under `social:{userId}:{platform}` as encrypted JSON
- **Decrypted on-demand** when posting
- **Refreshed automatically** when expired (if refresh tokens available)

## API Endpoints

### OAuth Authorization

#### GET `/api/social/auth/{platform}`
Initiates OAuth flow for a platform.

**Params:**
- `userId`: User identifier (query param or header `X-User-ID`)
- `redirect_uri`: Optional callback URL override

**Response:**
```json
{
  "authUrl": "https://twitter.com/i/oauth2/authorize?...",
  "state": "abc123def456"
}
```

**Platforms:** `twitter`, `instagram`, `linkedin`, `facebook`

#### GET `/api/social/callback/{platform}`
OAuth callback endpoint (called by platform after user authorizes).

**Params:**
- `code`: Authorization code from platform
- `state`: CSRF protection state
- `error`: If authorization denied

**Response:** Redirects to `/settings.html?connected={platform}`

### Posting

#### POST `/api/social/post`
Post content to one or more platforms.

**Body:**
```json
{
  "userId": "user123",
  "text": "Check out this amazing feature! 🚀",
  "imageUrl": "https://example.com/image.jpg",
  "platformList": ["twitter", "instagram", "linkedin"],
  "metadata": {
    "scheduledTime": "2026-03-05T14:30:00Z",
    "analytics": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "twitter": {
      "success": true,
      "postId": "1742...",
      "url": "https://twitter.com/i/web/status/1742...",
      "postedAt": "2026-03-05T13:14:00Z"
    },
    "instagram": {
      "success": true,
      "postId": "9876543...",
      "status": "pending",
      "scheduledAt": "2026-03-05T14:30:00Z"
    },
    "linkedin": {
      "success": false,
      "error": "Rate limit exceeded"
    }
  },
  "timestamp": "2026-03-05T13:14:00Z"
}
```

**Rate Limits (per 15 minutes):**
- Twitter: 300 posts
- Instagram: 25 posts
- LinkedIn: 100 posts
- Facebook: 200 posts

### Disconnect

#### DELETE `/api/social/disconnect/{platform}`
Remove a platform connection.

**Response:**
```json
{
  "success": true,
  "platform": "twitter",
  "disconnected": "2026-03-05T13:14:00Z"
}
```

### Status & Analytics

#### GET `/api/social/status`
Get connection status for all platforms.

**Response:**
```json
{
  "userId": "user123",
  "connections": {
    "twitter": {
      "connected": true,
      "accountInfo": {
        "id": "123456",
        "username": "@example",
        "name": "Example Account"
      },
      "connectedAt": "2026-03-01T10:00:00Z",
      "expiresAt": null
    },
    "instagram": {
      "connected": false,
      "accountInfo": null,
      "connectedAt": null,
      "expiresAt": null
    },
    "linkedin": { /* ... */ },
    "facebook": { /* ... */ }
  },
  "timestamp": "2026-03-05T13:14:00Z"
}
```

#### GET `/api/social/analytics?days=30`
Get posting analytics for a date range.

**Response:**
```json
{
  "userId": "user123",
  "period": "30 days",
  "analytics": {
    "2026-03-05": {
      "twitter": { "sent": 2, "failed": 0, "impressions": 0 },
      "instagram": { "sent": 1, "failed": 0, "engagement": 0 },
      "linkedin": { "sent": 1, "failed": 0, "reactions": 0 },
      "facebook": { "sent": 2, "failed": 0, "shares": 0 }
    },
    "2026-03-04": { /* ... */ }
  },
  "timestamp": "2026-03-05T13:14:00Z"
}
```

## Environment Variables Required

**For Twitter/X:**
```
TWITTER_CLIENT_ID=xxxxxxx
TWITTER_CLIENT_SECRET=xxxxxxx
```

**For Instagram (via Facebook):**
```
INSTAGRAM_CLIENT_ID=xxxxxxx
INSTAGRAM_CLIENT_SECRET=xxxxxxx
```

**For LinkedIn:**
```
LINKEDIN_CLIENT_ID=xxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxx
```

**For Facebook:**
```
FACEBOOK_CLIENT_ID=xxxxxxx
FACEBOOK_CLIENT_SECRET=xxxxxxx
```

**For Token Encryption:**
```
ENCRYPTION_KEY=<32-byte hex string>
```
If not set, a random key is generated per session (tokens won't persist across restarts).

**Redis (already configured):**
```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=xxxx...
```

## Getting API Keys

### Twitter/X

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create an app in the Developer Portal
3. Enable OAuth 2.0 at scale
4. Set callback URL to: `https://yourdomain.com/api/social/callback/twitter`
5. Scopes needed: `tweet.read`, `tweet.write`, `users.read`, `follows.read`, `follows.write`, `offline.access`
6. Copy Client ID and Client Secret

### Instagram Business

1. Go to https://developers.facebook.com
2. Create an app → Select "App Type: Consumer"
3. Add Instagram Basic Display and Graph APIs
4. Set redirect URL to: `https://yourdomain.com/api/social/callback/instagram`
5. Get your App ID and App Secret
6. Set up Instagram Business account linked to Facebook page
7. Scopes: `instagram_business_basic`, `instagram_business_content_publish`

### LinkedIn

1. Go to https://www.linkedin.com/developers/apps
2. Create app
3. Request access to: Sign In with LinkedIn, Share on LinkedIn
4. Set redirect URL to: `https://yourdomain.com/api/social/callback/linkedin`
5. Copy Client ID and Client Secret
6. Scopes: `r_basicprofile`, `w_member_social`

### Facebook Pages

1. Go to https://developers.facebook.com
2. Create app → Select "App Type: Consumer"
3. Add Facebook Login and Pages API
4. Set redirect URL to: `https://yourdomain.com/api/social/callback/facebook`
5. Copy App ID and App Secret
6. Scopes: `pages_manage_posts`, `pages_read_engagement`, `pages_manage_engagement`

## Implementation Details

### OAuth Flows

Each platform uses platform-specific OAuth 2.0 implementations:

**Twitter:** PKCE (proof key for code exchange)
- Verifier + Challenge sent to prevent interception
- No refresh token (access token valid for 2 hours)

**Instagram/Facebook:** Standard OAuth 2.0
- Code exchanged for token
- Long-lived tokens (60+ days)
- Token can be refreshed

**LinkedIn:** Standard OAuth 2.0 with refresh
- Tokens expire in 60 days
- Refresh tokens available

### Posting Mechanics

#### Twitter
- Text posts: Direct API call to POST `/2/tweets`
- With image: Upload media first via `/v2/media/upload`, then reference in tweet

#### Instagram
- Requires Business Account
- Images: Create media container → POST media container → Publish
- Videos and carousels also supported

#### LinkedIn
- Profile posts: Create UGC post
- Company posts: Post to company profile (requires additional permissions)
- Media: Upload and attach to post

#### Facebook
- Multi-page support: Posts to all connected pages
- Each page has its own access token
- Supports text + link preview
- Supports image uploads

### Rate Limiting

Per-user, per-platform, 15-minute rolling window:
- Tracked in Redis key: `ratelimit:{userId}:{platform}`
- Returns HTTP 429 if exceeded
- Counts reset every 15 minutes

### Error Handling

All endpoints include error handling:
- Invalid OAuth state → 400 Bad Request
- Token expired → 401 Unauthorized (auto-refresh attempted)
- Rate limit exceeded → 429 Too Many Requests
- Platform API error → Logged, returned in results
- Network timeout → 500 Server Error

If one platform fails, others still post (graceful fallback).

## Testing

### Test OAuth Flow

```bash
# 1. Get authorization URL
curl "http://localhost:3004/api/social/auth/twitter?userId=user123"

# 2. Manual: Follow authUrl, approve, get redirected to callback

# 3. Verify connection
curl "http://localhost:3004/api/social/status?userId=user123"
```

### Test Posting

```bash
curl -X POST http://localhost:3004/api/social/post \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "text": "Hello from PostForge! 🚀",
    "platformList": ["twitter", "facebook"],
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### Test Disconnect

```bash
curl -X DELETE http://localhost:3004/api/social/disconnect/twitter \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

## Security Considerations

1. **Token Encryption:** All tokens encrypted at rest in Redis
2. **CSRF Protection:** OAuth state verified before token exchange
3. **Token Refresh:** Expired tokens refreshed automatically
4. **User Isolation:** Tokens scoped to user ID
5. **HTTPS Only:** Redirect URIs must use HTTPS in production
6. **Rate Limiting:** Prevents abuse and platform API throttling
7. **Error Masking:** Platform errors don't leak sensitive data

## Monitoring & Logging

Key metrics to monitor:
- OAuth connection success/failure rate
- Post success/failure rate by platform
- Rate limit hits per user/platform
- Token refresh failures
- Average post delivery time

All operations logged to console with `[SOCIAL]` prefix.

## Future Enhancements

1. **Token Refresh Automation:** Cron job to refresh expiring tokens
2. **Scheduled Posts:** Queue system for scheduling posts to future times
3. **Analytics Enrichment:** Track impressions, engagement, reach
4. **Platform-Specific Features:** Instagram Stories, Reels, LinkedIn Articles
5. **Content Adaptation:** Auto-adapt text/images per platform
6. **Hashtag Optimization:** AI-powered hashtag suggestions per platform
7. **TikTok Integration:** OAuth + posting for TikTok
8. **YouTube Integration:** Video uploads and scheduling

## Troubleshooting

### "Invalid OAuth state"
- State may have expired (10 min window)
- Browser cookies might be blocked
- Redis connection issue

**Fix:** Try connecting again, check Redis is running

### "Rate limit exceeded"
- You've posted too many times in 15 minutes for this platform
- Check `/api/social/analytics` to see current usage

**Fix:** Wait 15 minutes or upgrade plan for higher limits

### "Token not found"
- Platform was disconnected
- Token was manually deleted from Redis
- Different user ID being used

**Fix:** Reconnect the platform

### Posts not going through
- Token expired and refresh failed
- Platform API is rate limiting
- Platform credentials are invalid

**Fix:** Check error in response, reconnect if needed

## Deployment Checklist

- [ ] All API keys configured in environment
- [ ] ENCRYPTION_KEY set (32-byte hex string)
- [ ] Redis (Upstash) URL and token configured
- [ ] OAuth redirect URIs added to platform developer settings
- [ ] HTTPS enabled (required for OAuth)
- [ ] Email notifications configured (optional)
- [ ] Error monitoring (Sentry, LogRocket, etc.)
- [ ] Rate limits configured per plan
- [ ] Settings page tested and deployed
- [ ] Backup plan for token storage

## Support

For issues or questions:
1. Check TROUBLESHOOTING section above
2. Review API response for error details
3. Check server logs for `[SOCIAL]` entries
4. Verify environment variables are set
5. Contact support@postforge.com
