# Phase D Deployment Guide: Rate Limiting & Infrastructure Protection

Complete guide for deploying the rate limiting, queue management, and monitoring systems for PostForge.

## What Was Built

### Core Features Implemented

1. **Tier-Based Rate Limiting**
   - Free: 5 clips/month, 100MB max file
   - Growth: 50 clips/month, 500MB max file
   - Pro: 150 clips/month, 1GB max file
   - Business: 500 clips/month, 5GB max file

2. **Job Queue System**
   - Max 3 concurrent jobs processing
   - Priority-based queuing (critical > high > medium > low)
   - 30-minute timeout per job
   - Queue position tracking

3. **Resource Monitoring**
   - Real-time CPU, RAM, disk tracking
   - Monthly bandwidth usage tracking
   - System alerts and recommendations
   - Graceful degradation when CPU >90%

4. **Auto-Cleanup Service**
   - Hourly runs to delete files >24 hours old
   - Prevents disk space runaway
   - Configurable retention policies

5. **Admin Monitoring Dashboard**
   - `/admin/stats` - System metrics
   - `/admin/queue` - Queue status
   - `/admin/users` - User stats for abuse detection
   - `/admin/dashboard` - Full overview
   - `/admin/alerts` - Recent alerts
   - `/admin/job/:jobId` - Individual job status

## Files Created

```
config/
  └── tiers.js                    (183 lines)  - Tier definitions

middleware/
  └── rateLimiter.js              (340 lines)  - Rate limiting middleware

services/
  ├── queue.js                    (350 lines)  - Job queue management
  └── monitoring.js               (270 lines)  - System monitoring

utils/
  └── cleanup.js                  (220 lines)  - Auto-cleanup service

routes/
  ├── admin.js                    (280 lines)  - Admin endpoints
  └── video.js                    (UPDATED)    - Integration of rate limiting

test-rate-limiting.js             (350 lines)  - Comprehensive test suite

RATE_LIMITING.md                  (400 lines)  - Feature documentation
DEPLOYMENT_GUIDE.md               (this file)  - Deployment instructions
```

**Total New Code:** ~2,000 lines of production-ready, tested code

## Pre-Deployment Checklist

- [ ] All dependencies installed: `npm install`
- [ ] Tests pass: `node test-rate-limiting.js`
- [ ] Environment variables configured (see below)
- [ ] Admin password changed in production
- [ ] Redis configured for production (optional but recommended)
- [ ] Disk space available for uploads and clips
- [ ] FFmpeg, Whisper, Python dependencies installed
- [ ] API keys set (ANTHROPIC_API_KEY, OPENAI_API_KEY)

## Environment Setup

### Development

```bash
# .env file
PORT=4000
NODE_ENV=development
REQUIRE_AUTH=false
REQUIRE_ADMIN_AUTH=false
ADMIN_PASSWORD=admin-change-in-production
DEBUG=true
UPLOAD_DIR=/tmp/postforge-uploads
CLIPS_DIR=/tmp/postforge-clips
```

### Production

```bash
# .env file (store in secure location)
PORT=4000
NODE_ENV=production
REQUIRE_AUTH=true
PROCESSING_API_KEY=your-secure-api-key-here
REQUIRE_ADMIN_AUTH=true
ADMIN_PASSWORD=your-secure-admin-password-here
DEBUG=false
UPLOAD_DIR=/var/postforge/uploads
CLIPS_DIR=/var/postforge/clips
REDIS_HOST=localhost          # For production (optional)
REDIS_PORT=6379
```

## Startup Instructions

### Local Development

```bash
# Install dependencies
npm install

# Run tests
node test-rate-limiting.js

# Start server
npm run dev
```

### Docker

```bash
# Build image
docker build -t postforge-processing:latest .

# Run container with rate limiting
docker run -d \
  --name postforge-processing \
  -p 4000:4000 \
  -e ADMIN_PASSWORD=your-secure-password \
  -e UPLOAD_DIR=/data/uploads \
  -e CLIPS_DIR=/data/clips \
  -v /data/uploads:/data/uploads \
  -v /data/clips:/data/clips \
  postforge-processing:latest
```

### Standalone Server

```bash
# Install Node.js 18+
node --version  # Should be v18 or higher

# Install dependencies
npm install

# Start production server
npm start

# Monitor logs
tail -f nohup.out
```

## Integration with Existing Routes

The rate limiting system integrates seamlessly with existing endpoints:

### Upload Endpoint
```bash
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-id: user123" \
  -H "x-user-tier: pro" \
  -H "x-api-key: your-api-key"
```

**Validation Flow:**
1. File uploaded via multer
2. `validateFileSize` middleware checks tier limit
3. `checkClipQuota` middleware checks monthly quota
4. If valid, clip is recorded in rate limiter
5. Response includes updated clip count

### Cut Endpoint
```bash
curl -X POST http://localhost:4000/cut/abc123 \
  -H "x-user-id: user123" \
  -H "x-user-tier: pro" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{ "quality": "high" }'
```

**Processing Flow:**
1. Check clip quota
2. Check system health (CPU usage)
3. If CPU >90%, queue the job
4. If CPU normal, process immediately
5. Return 202 (queued) or 200 (success)

## Admin Access

### Authentication

```bash
# Option 1: Use x-admin-key header
curl http://localhost:4000/admin/stats \
  -H "x-admin-key: your-admin-password"

# Option 2: Use query parameter
curl "http://localhost:4000/admin/stats?adminKey=your-admin-password"
```

### Common Admin Tasks

**View System Health**
```bash
curl http://localhost:4000/admin/health \
  -H "x-admin-key: admin-password"
```

**View Queue Status**
```bash
curl http://localhost:4000/admin/queue \
  -H "x-admin-key: admin-password"
```

**View User Stats**
```bash
curl http://localhost:4000/admin/users \
  -H "x-admin-key: admin-password"
```

**Trigger Cleanup**
```bash
curl -X POST http://localhost:4000/admin/cleanup \
  -H "x-admin-key: admin-password" \
  -H "Content-Type: application/json" \
  -d '{ "maxAgeHours": 24 }'
```

**Reset User Rate Limit**
```bash
curl -X POST http://localhost:4000/admin/reset-user \
  -H "x-admin-key: admin-password" \
  -H "Content-Type: application/json" \
  -d '{ "userId": "user123" }'
```

**View Alerts**
```bash
curl "http://localhost:4000/admin/alerts?severity=warning&limit=50" \
  -H "x-admin-key: admin-password"
```

## Monitoring Recommendations

### Key Metrics to Watch

1. **Queue Depth**: Should be <10 in normal operation
2. **CPU Usage**: Alert if >80%, degrade if >90%
3. **Disk Usage**: Alert if >80%, stop at 95%
4. **Memory Usage**: Alert if >85%
5. **Job Timeout Rate**: Should be <2%
6. **Average Job Time**: Track trends

### Recommended Setup

1. **Prometheus** - Scrape `/admin/stats` every 30 seconds
2. **Grafana** - Dashboard with metrics
3. **AlertManager** - Send alerts on threshold breaches
4. **ELK Stack** - Log aggregation and analysis

### Example Prometheus Config

```yaml
global:
  scrape_interval: 30s

scrape_configs:
  - job_name: 'postforge-processing'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/admin/stats'
    bearer_token: 'your-admin-password'
```

## Performance Tuning

### Increase Concurrent Jobs

Edit `services/queue.js`:
```javascript
const queue = new JobQueue(5); // Increase from 3 to 5
```

Then restart server.

### Adjust Timeout

Edit `services/queue.js`:
```javascript
this.MAX_JOB_DURATION_MS = 45 * 60 * 1000; // 45 minutes instead of 30
```

### Configure Auto-Cleanup

Edit `utils/cleanup.js`:
```javascript
const CLEANUP_INTERVAL = 1800 * 1000; // Run every 30 minutes instead of 1 hour
```

### Redis Integration (Production)

For multi-server deployments, use Redis:

```javascript
// Install
npm install redis bull

// Update middleware/rateLimiter.js to use Redis
const redis = require('redis');
const client = redis.createClient();

// Use client.get/set for distributed rate limiting
```

## Troubleshooting

### Issue: "Rate limit exceeded" too aggressive

**Solution**: Check tier configuration in `config/tiers.js`, adjust limits.

### Issue: Queue growing indefinitely

**Possible Causes:**
- Too many concurrent jobs configured
- FFmpeg hanging on large files
- Disk space running out

**Solutions:**
- Decrease `maxConcurrent` in queue
- Add timeout safety to FFmpeg
- Monitor disk space, trigger cleanup manually

### Issue: Admin endpoints returning 401

**Solution**: Ensure `ADMIN_PASSWORD` env var matches header/query param.

### Issue: Memory usage growing

**Possible Causes:**
- Too many completed jobs in memory
- Memory leak in cleanup service

**Solutions:**
- Restart server periodically
- Monitor with `node --inspect` and Chrome DevTools
- Check for async leaks in queue processing

## Migration from No Rate Limiting

If upgrading existing deployment:

1. **Backup data** before deploying
2. **Test locally** with production config
3. **Deploy during low traffic** window
4. **Monitor closely** for first 24 hours
5. **Verify** all tiers are working:
   - Free user can only upload 5 clips
   - Pro user can upload 150 clips
   - Large files rejected appropriately

## Success Metrics

After deployment, verify:

- [ ] Users can't exceed tier limits
- [ ] Large files rejected with clear messages
- [ ] Queue prevents server overload
- [ ] Cleanup runs hourly without errors
- [ ] Admin dashboard shows correct metrics
- [ ] Graceful degradation works under load
- [ ] No memory leaks after 24h runtime
- [ ] Disk space stable over time

## Rollback Plan

If issues arise:

```bash
# Stop server
pm2 stop postforge-processing

# Revert to previous version
git checkout HEAD~1
npm install

# Restart
pm2 start postforge-processing
```

Or with Docker:
```bash
# Stop current container
docker stop postforge-processing

# Run previous image
docker run -d --name postforge-processing-v1 \
  postforge-processing:previous-version
```

## Support Contacts

For questions about:
- **Rate limiting logic**: Check `middleware/rateLimiter.js` and `config/tiers.js`
- **Queue management**: See `services/queue.js`
- **Monitoring**: See `services/monitoring.js`
- **Auto-cleanup**: See `utils/cleanup.js`
- **API usage**: See `RATE_LIMITING.md`

## Next Steps

1. Review and update tier limits if needed
2. Configure Redis for production
3. Set up monitoring (Prometheus/Grafana)
4. Create admin dashboard UI
5. Set up alerting on rate limit breaches
6. Document tier upgrade process for customers
7. Plan for horizontal scaling with shared Redis

---

**Deployment Version**: 1.0.0  
**Last Updated**: 2026-03-05  
**Status**: Production Ready ✅
