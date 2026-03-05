# Quick Start Guide - PostForge with Rate Limiting

Get up and running with PostForge's rate limiting and monitoring in 5 minutes.

## 1. Install Dependencies

```bash
npm install
```

This installs Express, FFmpeg tools, UUID, and all required packages.

## 2. Run Tests

```bash
node test-rate-limiting.js
```

Expected output:
```
✅ ALL TESTS PASSED
  ✓ Tier Configuration (3/3)
  ✓ Rate Limiter (6/6)
  ✓ Job Queue (7/7)
  ✓ Monitoring (5/5)
  ✓ Cleanup Service (2/2)
  ✓ Integration Scenarios (3/3)
```

## 3. Start Server

```bash
npm start
```

Server starts on `http://localhost:4000`

## 4. Test Upload with Rate Limiting

### Free Tier User (5 clips/month max)

```bash
# Upload first clip - SUCCESS
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-id: user-free-1" \
  -H "x-user-tier: free"

# Response: 200 OK, clipsRemaining: 4
```

### File Too Large

```bash
# Try to upload 200MB file as free user - REJECTED
curl -X POST http://localhost:4000/upload \
  -F "video=@large.mp4" \
  -H "x-user-tier: free"

# Response: 413 Error
# "File too large. Max 100MB for Free tier. Upgrade to Pro for 1GB."
```

### Pro Tier User (150 clips/month)

```bash
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-id: user-pro-1" \
  -H "x-user-tier: pro"

# Response: 200 OK, clipsRemaining: 149
```

## 5. Check Queue Status

```bash
curl http://localhost:4000/admin/queue \
  -H "x-admin-key: admin-change-in-production"

# Response shows:
# - activeJobs: 0
# - queuedJobs: 0
# - topUsers: [...]
```

## 6. View System Health

```bash
curl http://localhost:4000/admin/stats \
  -H "x-admin-key: admin-change-in-production"

# Shows CPU, memory, disk, queue stats
```

## 7. Get Full Dashboard

```bash
curl http://localhost:4000/admin/dashboard \
  -H "x-admin-key: admin-change-in-production"

# Comprehensive overview of system state
```

## Common Scenarios

### Scenario 1: Free User Exhausts Quota

```bash
# User has 5/5 clips used
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-id: exhausted-user" \
  -H "x-user-tier: free"

# Response: 429 Error
# "Clip limit reached. You've used 5/5 clips this month."
```

### Scenario 2: High Load - Jobs Get Queued

When CPU >90%:

```bash
curl -X POST http://localhost:4000/cut/videoId \
  -H "x-user-tier: pro"

# Response: 202 Accepted (not 200)
# {
#   "status": "queued",
#   "jobId": "uuid",
#   "position": 3,
#   "estimatedWaitSeconds": 300,
#   "message": "Server busy. Your clip is queued (#3 in line)..."
# }
```

### Scenario 3: Check Job Status

```bash
curl http://localhost:4000/admin/job/job-uuid \
  -H "x-admin-key: admin-password"

# Returns: processing, queued, completed, timeout, or failed
```

## Configuration

### Change Admin Password

Edit `.env`:
```bash
ADMIN_PASSWORD=your-secure-password-here
```

### Adjust Tier Limits

Edit `config/tiers.js`:
```javascript
free: {
  clipsPerMonth: 5,      // Change this
  maxFileSizeBytes: 100 * 1024 * 1024,  // Change this
  // ... other limits
}
```

### Increase Concurrent Jobs

Edit `services/queue.js`:
```javascript
const queue = new JobQueue(5); // Increase from 3
```

## Monitoring

### Dashboard Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/admin/stats` | Full system metrics |
| `/admin/queue` | Queue and job status |
| `/admin/users` | User statistics |
| `/admin/health` | Quick health check |
| `/admin/dashboard` | Comprehensive view |
| `/admin/alerts` | Recent system alerts |

### Setting Up Monitoring

```bash
# Watch stats in real-time
watch -n 5 "curl -s http://localhost:4000/admin/health \
  -H 'x-admin-key: admin-password' | jq ."
```

## API Headers

### For User-Facing Endpoints

```bash
-H "x-user-id: user123"          # User identifier
-H "x-user-tier: pro"             # free, growth, pro, business
-H "x-api-key: api-key-here"     # If auth required
```

### For Admin Endpoints

```bash
-H "x-admin-key: admin-password"  # Admin authentication
```

## Files to Know

| File | Purpose |
|------|---------|
| `config/tiers.js` | Tier definitions |
| `middleware/rateLimiter.js` | Rate limiting logic |
| `services/queue.js` | Job queue |
| `services/monitoring.js` | System monitoring |
| `routes/admin.js` | Admin endpoints |
| `test-rate-limiting.js` | Tests (run this!) |

## Documentation

- **API_REFERENCE.md** - Complete API documentation
- **RATE_LIMITING.md** - Feature details
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **PHASE_D_SUMMARY.md** - Technical overview

## Troubleshooting

### "Module not found" errors

```bash
npm install
```

### Admin endpoints returning 401

Check you're using correct password:
```bash
# In .env (default)
ADMIN_PASSWORD=admin-change-in-production
```

### Queue not processing jobs

Check CPU - if >90%, jobs get queued instead:
```bash
curl http://localhost:4000/admin/stats -H "x-admin-key: admin-password"
# Check "cpu.percentUsed"
```

### Disk full errors

Manual cleanup:
```bash
curl -X POST http://localhost:4000/admin/cleanup \
  -H "x-admin-key: admin-password" \
  -H "Content-Type: application/json" \
  -d '{ "maxAgeHours": 24 }'
```

## Next Steps

1. **Read API_REFERENCE.md** - Understand all endpoints
2. **Review RATE_LIMITING.md** - Understand rate limiting
3. **Check DEPLOYMENT_GUIDE.md** - Prepare for production
4. **Set up monitoring** - Configure Prometheus/Grafana
5. **Test scenarios** - Try different tier limits

## Example Workflow

```bash
# 1. Start server
npm start

# 2. Upload video as Pro user
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-tier: pro"
# Get videoId: abc123

# 3. Transcribe
curl -X POST http://localhost:4000/transcribe/abc123

# 4. Analyze
curl -X POST http://localhost:4000/analyze/abc123

# 5. Cut clips
curl -X POST http://localhost:4000/cut/abc123

# 6. Check stats
curl http://localhost:4000/admin/stats \
  -H "x-admin-key: admin-password"

# 7. Check alerts
curl http://localhost:4000/admin/alerts \
  -H "x-admin-key: admin-password"
```

## Key Features Recap

✅ **Tier-based limits** - Different limits per subscription  
✅ **File size validation** - Large files rejected per tier  
✅ **Monthly quotas** - 5-500 clips depending on tier  
✅ **Job queueing** - Max 3 concurrent, queue rest  
✅ **CPU monitoring** - Graceful degradation at 90%  
✅ **Disk monitoring** - Alerts at 80%, stops at 95%  
✅ **Auto cleanup** - Hourly cleanup of old files  
✅ **Admin dashboard** - 10 monitoring endpoints  

---

**You're ready to go!** 🚀

For detailed information, see the full documentation files.
