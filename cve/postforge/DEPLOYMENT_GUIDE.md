# PostForge Phase C Deployment Guide

## Pre-Deployment Setup

### 1. Acquire API Credentials

#### Twitter/X
1. Visit https://developer.twitter.com/en/portal/dashboard
2. Create new app or select existing
3. Go to "Keys and Tokens" tab
4. Generate Client ID and Client Secret
5. Note the generated credentials
6. Set OAuth 2.0 Redirect URIs to:
   - Development: `http://localhost:3004/api/social/callback/twitter`
   - Production: `https://postforge.io/api/social/callback/twitter` (adjust domain)

#### Instagram Business (via Facebook)
1. Visit https://developers.facebook.com/apps
2. Create new app → "Consumer" type
3. Add "Instagram Basic Display" and "Instagram Graph API"
4. Go to Settings → Basic, save App ID and App Secret
5. Set Redirect URI: `https://postforge.io/api/social/callback/instagram`
6. Ensure Instagram Business Account is linked to a Facebook Page

#### LinkedIn
1. Visit https://www.linkedin.com/developers/apps
2. Create app
3. Request access to "Sign In with LinkedIn" and "Share on LinkedIn"
4. Go to Auth tab, save Client ID and Client Secret
5. Set Redirect URL: `https://postforge.io/api/social/callback/linkedin`

#### Facebook Pages
1. Visit https://developers.facebook.com/apps
2. Create new app → "Consumer" type
3. Add "Facebook Login"
4. Go to Settings → Basic, save App ID and App Secret
5. Set Redirect URI: `https://postforge.io/api/social/callback/facebook`

### 2. Generate Encryption Key

```bash
# Generate a secure 32-byte hex encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: a1b2c3d4e5f6... (copy this entire string)
```

### 3. Update Environment Variables

In your deployment environment (Vercel, Heroku, Docker, etc.), add:

```env
# Social Media API Keys
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Encryption
ENCRYPTION_KEY=a1b2c3d4e5f6... (32-byte hex key from step 2)

# Redis (already configured)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### 4. Test Locally

```bash
cd postforge/

# Install dependencies (if any new ones added)
npm install

# Start server
npm start

# Should see:
# ✓ Social Media API routes initialized
```

Visit: `http://localhost:3004/settings` → Connected Platforms section

### 5. Deploy to Production

#### Option A: Vercel (Recommended)

```bash
# If not already set up
npx vercel login
cd postforge/
npx vercel

# Follow prompts to link project
# Add environment variables in Vercel dashboard:
# Settings → Environment Variables
```

#### Option B: Node.js Server

```bash
# Copy to server
scp -r postforge/ user@server:/var/app/

# On server
cd /var/app/postforge/
npm install
npm start

# Or use PM2 for process management
pm2 start server.js --name "postforge"
```

#### Option C: Docker

```bash
# Build image
docker build -t postforge:latest .

# Run container with env vars
docker run -e TWITTER_CLIENT_ID=... \
           -e TWITTER_CLIENT_SECRET=... \
           -e INSTAGRAM_CLIENT_ID=... \
           ... \
           -p 3004:3004 postforge:latest
```

### 6. Update Redirect URIs on All Platforms

After deploying, update OAuth redirect URIs on each platform to production domain:

- Twitter: `https://yourdomain.com/api/social/callback/twitter`
- Instagram: `https://yourdomain.com/api/social/callback/instagram`
- LinkedIn: `https://yourdomain.com/api/social/callback/linkedin`
- Facebook: `https://yourdomain.com/api/social/callback/facebook`

## Post-Deployment Verification

### 1. Health Check

```bash
curl https://yourdomain.com/api/social/status?userId=test
# Should return { "connections": { "twitter": {...} } }
```

### 2. OAuth Flow Test

1. Go to Settings page
2. Click "Connect" on Twitter
3. Approve authorization on Twitter
4. Should redirect back to settings with "Connected" badge
5. Check browser console for any errors

### 3. Post Test

```bash
curl -X POST https://yourdomain.com/api/social/post \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "Testing PostForge! 🚀",
    "platformList": ["twitter"],
    "imageUrl": null
  }'
```

Expected response includes:
```json
{
  "success": true,
  "results": {
    "twitter": {
      "success": true,
      "postId": "..."
    }
  }
}
```

### 4. Monitor Logs

Check for:
- `✓ Social Media API routes initialized` on startup
- No `[SOCIAL]` error messages
- Successful OAuth callbacks

```bash
# On Vercel: View logs in dashboard
# On server: 
tail -f /var/log/postforge/error.log
tail -f /var/log/postforge/access.log
```

## Monitoring & Maintenance

### Key Metrics to Track

```javascript
// Log these metrics to your monitoring service (DataDog, New Relic, etc.)

// OAuth success rate
POST /api/social/auth/twitter → 200 OK

// Posting success rate per platform
POST /api/social/post → twitter: ✓, instagram: ✓, linkedin: ✗

// Rate limit hits
POST /api/social/post → 429 Rate limit exceeded

// Token refresh failures
Token refresh failed: Instagram refresh_token expired
```

### Maintenance Tasks

#### Weekly
- Review Redis size (tokens stored)
- Check error logs for patterns
- Verify all platforms responding

#### Monthly
- Review analytics dashboard
- Check token expiration dates
- Update any expired API keys

#### Quarterly
- Review and update scopes if needed
- Test full OAuth flow on all platforms
- Audit token storage for unused accounts

### Scaling Considerations

1. **Rate Limiting:** Currently per-user, per-platform. Scale to per-account if needed.
2. **Token Storage:** Redis grows with user connections. Monitor and clean up.
3. **API Calls:** Each post can make 4+ platform API calls. Budget accordingly.
4. **Token Refresh:** Implement background job to refresh expiring tokens.

## Troubleshooting Deployment Issues

### "Social Media API routes initialized" not appearing

**Problem:** Routes not loading
**Solution:**
1. Check `/api/routes.js` exists
2. Check `/middleware/socialAuth.js` exists
3. Check `/schemas/socialConnections.js` exists
4. Verify all imports in `server.js` correct
5. Check server console for errors

### 403 Forbidden on OAuth redirect

**Problem:** Redirect URI mismatch
**Solution:**
1. Check redirect URI matches exactly on platform settings
2. Ensure HTTPS in production
3. No trailing slashes
4. No `localhost` in production settings

### "Invalid OAuth state" error

**Problem:** State not found in Redis
**Solution:**
1. Verify Redis connection working
2. Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` set
3. Check Redis isn't rate limiting
4. Try connecting again (state expires in 10 min)

### Tokens not being stored

**Problem:** Encryption key issue
**Solution:**
1. Verify `ENCRYPTION_KEY` is set and 32 bytes (hex)
2. Check if key changed (old tokens won't decrypt)
3. Verify Redis connection with:
   ```bash
   curl https://[token]@[url].upstash.io/get/test
   ```

### Platform API 401 Unauthorized

**Problem:** Token invalid or expired
**Solution:**
1. Check token wasn't manually revoked on platform
2. Verify `TWITTER_CLIENT_SECRET` etc. are correct
3. Re-authenticate: disconnect → reconnect
4. Check platform API status page

### Slow posting performance

**Problem:** Many API calls per post
**Solution:**
1. Only post to needed platforms (reduce `platformList`)
2. Add caching for user connections
3. Batch similar requests
4. Implement background job queue

## Rollback Plan

If deployment has critical issues:

```bash
# Vercel: Revert to last stable deployment
vercel rollback

# Node server:
git revert HEAD
npm install
npm start

# Docker:
docker run -e... postforge:previous-version
```

Key files to backup before deployment:
- `.env` (environment variables)
- `server.js` (main app)
- `/api/` directory (new routes)
- `/middleware/` directory (OAuth handlers)
- `/schemas/` directory (data models)

## Security Checklist

Before going live:

- [ ] All API keys secured (not in code)
- [ ] HTTPS enforced
- [ ] ENCRYPTION_KEY set and backed up
- [ ] OAuth redirect URIs updated
- [ ] Redis credentials secured
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive data
- [ ] CORS configured appropriately
- [ ] No debug endpoints exposed
- [ ] SQL injection / code injection prevented
- [ ] Token expiration handled
- [ ] Disconnection removes all data

## Performance Targets

After deployment, verify:

- OAuth flow: < 2 seconds total
- Post to single platform: < 1 second
- Post to 4 platforms: < 3 seconds
- Status check: < 500ms
- Error response: < 100ms

## Support & Escalation

If critical issues occur:

1. **Twitter API Issues:** Check https://status.twitter.com
2. **Instagram API Issues:** Check Facebook developer community
3. **LinkedIn API Issues:** Check LinkedIn developer support
4. **Facebook API Issues:** Check Facebook developer community
5. **Redis Issues:** Contact Upstash support
6. **Server Issues:** Check server logs, restart if needed

Emergency contacts:
- Twitter API: @TwitterAPI
- Facebook: developers.facebook.com/support
- LinkedIn: support.linkedin.com
- PostForge: support@postforge.com

## Next Steps

After successful deployment:

1. ✅ Announcement: Blog post "We now support auto-posting!"
2. ✅ Email users: "Connect your social accounts"
3. ✅ Monitor: First week of live usage
4. ✅ Gather feedback: Survey users
5. ✅ Iterate: Add requested features (stories, reels, etc.)
6. ✅ Scale: Handle increased load

---

**Deployment Complete!** 🎉

The social media auto-posting integration is now live. Users can connect their platforms and auto-post generated content to Twitter, Instagram, LinkedIn, and Facebook simultaneously.
