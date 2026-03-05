# Phase C Deployment Checklist

## Pre-Deployment (Before Going Live)

### Code & Files
- [x] `/api/social.js` created (15.7 KB) - Core OAuth + posting logic
- [x] `/api/routes.js` created (7.8 KB) - Express endpoints
- [x] `/middleware/socialAuth.js` created (9.0 KB) - OAuth handlers
- [x] `/schemas/socialConnections.js` created (5.4 KB) - Redis model
- [x] `settings.html` updated with OAuth buttons
- [x] `server.js` updated with route initialization
- [x] All imports correct and paths valid
- [x] No syntax errors (validated)

### Documentation
- [x] `SOCIAL_MEDIA_API.md` - Complete API reference
- [x] `DEPLOYMENT_GUIDE.md` - Step-by-step deployment
- [x] `API_EXAMPLES.md` - Code examples & patterns
- [x] `PHASE_C_SUMMARY.md` - Overview & status
- [x] This checklist

### Prepare API Keys (Need to Obtain)
- [ ] Twitter/X: CLIENT_ID, CLIENT_SECRET
- [ ] Instagram: CLIENT_ID, CLIENT_SECRET
- [ ] LinkedIn: CLIENT_ID, CLIENT_SECRET
- [ ] Facebook: CLIENT_ID, CLIENT_SECRET
- [ ] Generate ENCRYPTION_KEY (32-byte hex)

### Environment Setup
- [ ] Add all API keys to `.env.local`
- [ ] Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` set
- [ ] Test ENCRYPTION_KEY generation: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Backup current `.env` file

### Local Testing
- [ ] Start server: `npm start`
- [ ] Check for error: `✓ Social Media API routes initialized`
- [ ] Visit `http://localhost:3004/settings`
- [ ] Click "Connect Twitter" button
- [ ] OAuth flow should redirect to Twitter
- [ ] (Manual) Approve access on Twitter
- [ ] Should redirect back to `/settings.html?connected=twitter`
- [ ] Platform card shows "Connected" with account info
- [ ] Test "Disconnect" button
- [ ] Status should change to "Not connected"
- [ ] Test other platforms (Instagram, LinkedIn, Facebook)
- [ ] Test posting endpoint: `curl -X POST http://localhost:3004/api/social/post ...`
- [ ] Check Redis has tokens: `redis-cli hgetall "social:user123"`

### Browser Testing
- [ ] Chrome DevTools: No console errors
- [ ] Check Network tab: All API calls succeed
- [ ] Mobile responsive: Settings page on mobile
- [ ] Dark mode: UI looks good (already dark theme)

### OAuth Redirect URIs
- [ ] Twitter: Add `http://localhost:3004/api/social/callback/twitter` to dev settings
- [ ] Instagram: Add `http://localhost:3004/api/social/callback/instagram` to dev settings
- [ ] LinkedIn: Add `http://localhost:3004/api/social/callback/linkedin` to dev settings
- [ ] Facebook: Add `http://localhost:3004/api/social/callback/facebook` to dev settings

## Deployment Phase

### Choose Deployment Target
- [ ] **Vercel** - `vercel deploy` (Recommended)
- [ ] **Node server** - `scp` + `npm start`
- [ ] **Docker** - Build image + deploy
- [ ] Confirm domain: `https://postforge.io` (or your domain)

### Pre-Deployment on Server
- [ ] Git pull latest code
- [ ] Add all env vars to hosting platform
- [ ] Verify `npm install` succeeds
- [ ] Run `npm start` and check for startup message

### Update OAuth Redirect URIs (Production)
- [ ] Twitter: Change to `https://yourdomain.com/api/social/callback/twitter`
- [ ] Instagram: Change to `https://yourdomain.com/api/social/callback/instagram`
- [ ] LinkedIn: Change to `https://yourdomain.com/api/social/callback/linkedin`
- [ ] Facebook: Change to `https://yourdomain.com/api/social/callback/facebook`
- [ ] Note: Remove or keep localhost URIs (both can work)
- [ ] Test each platform's OAuth flow completes

### Security Checks
- [ ] HTTPS enforced (not HTTP)
- [ ] No API keys in code (only in env vars)
- [ ] ENCRYPTION_KEY backed up safely
- [ ] Redis credentials not exposed
- [ ] CORS configured appropriately
- [ ] Error messages don't leak sensitive data
- [ ] Token expiration handled
- [ ] Rate limits active

### Post-Deployment Verification

#### Health Checks
- [ ] Server is running: `curl https://yourdomain.com/api/social/status`
- [ ] Settings page loads: `https://yourdomain.com/settings.html`
- [ ] No 500 errors in logs
- [ ] `[SOCIAL] routes initialized` in startup logs

#### OAuth Test (All 4 Platforms)
- [ ] Go to settings page
- [ ] Click "Connect Twitter"
  - [ ] Redirects to Twitter OAuth page
  - [ ] After approval, redirects back with success message
  - [ ] Platform card shows "Connected"
  - [ ] Token stored in Redis
- [ ] Repeat for Instagram, LinkedIn, Facebook
- [ ] Each platform shows account info (username, name, etc)

#### Posting Test
```bash
curl -X POST https://yourdomain.com/api/social/post \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "text": "Testing PostForge deployment! 🚀",
    "platformList": ["twitter"],
    "imageUrl": null
  }'
```
- [ ] Response is `200 OK`
- [ ] `success: true` in response
- [ ] Twitter post URL returned
- [ ] Actually posted to real Twitter account

#### All Endpoints Test
- [ ] `GET /api/social/status?userId=test-user` → 200
- [ ] `DELETE /api/social/disconnect/twitter` → 200
- [ ] `GET /api/social/analytics?days=7` → 200
- [ ] `GET /api/social/auth/twitter` → 200 with authUrl

### Monitoring Setup
- [ ] Error tracking configured (Sentry, LogRocket, etc)
- [ ] Uptime monitoring configured
- [ ] Email alerts for critical errors
- [ ] Slack notifications for deployments
- [ ] Metrics dashboard set up (optional)

### Documentation
- [ ] README updated with social media feature
- [ ] Onboarding docs updated for users
- [ ] API docs published
- [ ] Support page updated with OAuth FAQ

## Post-Deployment (After Going Live)

### First Week Monitoring
- [ ] Daily check: Are all OAuth flows working?
- [ ] Check: Any users hitting rate limits?
- [ ] Logs: Any recurring error patterns?
- [ ] Support: Any user complaints?
- [ ] Performance: Posting latency acceptable?

### Analytics
- [ ] Monitor OAuth success rate (should be >95%)
- [ ] Monitor post success rate per platform
- [ ] Track most-used platforms
- [ ] Identify any failing platforms early

### User Communication
- [ ] Email announcement: "Social media auto-posting is live!"
- [ ] Blog post: Feature walkthrough
- [ ] Social media: Screenshot of new feature
- [ ] In-app notification: Guide users to settings

### Feedback Collection
- [ ] Survey: "How easy was connecting your accounts?"
- [ ] Survey: "Which platforms do you use most?"
- [ ] Support tickets: Any issues reported?
- [ ] Feature requests: What should come next?

### Scale & Performance
- [ ] Can handle 10+ simultaneous posting requests?
- [ ] Redis connection pool adequate?
- [ ] Token encryption/decryption overhead acceptable?
- [ ] Rate limiting working correctly?

### Maintenance Tasks
- [ ] Weekly: Review error logs
- [ ] Weekly: Check token refresh working
- [ ] Monthly: Verify all platforms API status
- [ ] Monthly: Clean up old analytics data (>30 days)
- [ ] Quarterly: Security audit of token storage

## Rollback Procedures

If critical issues discovered:

### Immediate Rollback
```bash
# Option 1: Git revert
git revert HEAD
git push

# Option 2: Disable routes in server.js
# Comment out:
# var setupSocialRoutes = require('./api/routes');
# setupSocialRoutes(app, redis);

# Option 3: Restore previous deployment
# Vercel: Click "Revert" on previous deployment
# or: npm start (with old code)
```

### Recovery Steps
1. Stop posting (prevent errors going live)
2. Rollback code to last stable version
3. Verify old endpoints still working
4. Investigate root cause
5. Fix in test environment
6. Redeploy when stable

### Data Recovery
- [ ] Tokens still in Redis (not deleted)
- [ ] User settings preserved
- [ ] Analytics data preserved
- [ ] Can reconnect if needed

## Final Sign-Off

Before marking complete:

- [ ] All files created and tested
- [ ] Documentation comprehensive
- [ ] Deployment guide followed
- [ ] All endpoints verified working
- [ ] OAuth flows tested on all platforms
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Ready for user announcement

## Approval & Deployment

**Ready for Deployment?** ✅ YES

**API Keys Needed?**
- [ ] TWITTER_CLIENT_ID
- [ ] TWITTER_CLIENT_SECRET
- [ ] INSTAGRAM_CLIENT_ID
- [ ] INSTAGRAM_CLIENT_SECRET
- [ ] LINKEDIN_CLIENT_ID
- [ ] LINKEDIN_CLIENT_SECRET
- [ ] FACEBOOK_CLIENT_ID
- [ ] FACEBOOK_CLIENT_SECRET
- [ ] ENCRYPTION_KEY (generated)

**Estimated Time to Deploy:** 2-4 hours
- 1 hour: Obtain & configure API keys
- 30 min: Test OAuth flows locally
- 30 min: Deploy to production
- 30 min: Verify all platforms working
- 30 min: Configure monitoring & alerts

**Next Steps:**
1. Provide the 8 API keys listed above
2. Follow DEPLOYMENT_GUIDE.md step-by-step
3. Run through this checklist
4. Contact support if any issues
5. Announce feature to users

---

**Status: READY FOR DEPLOYMENT** 🚀

Created: 2026-03-05 13:14 CST
By: Phase C Subagent
Last Updated: 2026-03-05 13:25 CST
