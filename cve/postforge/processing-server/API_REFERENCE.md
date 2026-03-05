# PostForge Processing Server - Complete API Reference

Updated with rate limiting, queue management, and monitoring endpoints.

## Base URL

```
http://localhost:4000
```

## Authentication

### API Key (for /upload, /transcribe, etc.)

```
Header: x-api-key: your-api-key
OR
Query: ?key=your-api-key
```

### Admin Key (for /admin/*)

```
Header: x-admin-key: your-admin-password
OR
Query: ?adminKey=your-admin-password
```

### User Context (for rate limiting)

```
Header: x-user-id: user123
Header: x-user-tier: pro
```

Tiers: `free`, `growth`, `pro`, `business`

## Endpoints

### Video Processing

#### POST /upload

Upload a video file with rate limiting and quota checks.

**Request:**
```bash
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4" \
  -H "x-user-id: user123" \
  -H "x-user-tier: pro" \
  -H "x-api-key: your-api-key"
```

**Headers:**
- `x-user-id` (required) - User identifier
- `x-user-tier` (optional, default: free) - User subscription tier
- `x-api-key` (if auth required)
- `Content-Type: multipart/form-data`

**Request Body:**
- `video` (multipart file) - Video file to upload

**Response (200 - Success):**
```json
{
  "success": true,
  "videoId": "abc123def456",
  "filename": "abc123def456.mp4",
  "path": "/tmp/postforge-uploads/abc123def456.mp4",
  "size": 1500000,
  "duration": 120,
  "width": 1920,
  "height": 1080,
  "codec": "h264",
  "userTier": "Pro",
  "clipsUsed": 1,
  "clipsRemaining": 149,
  "message": "Video uploaded successfully. Use this videoId for transcription."
}
```

**Response (413 - File Too Large):**
```json
{
  "error": "file_too_large",
  "message": "File too large. Max 100MB for Free tier. Upgrade to Pro for 1GB.",
  "maxSizeMB": 100,
  "fileSizeMB": 250,
  "tier": "Free"
}
```

**Response (429 - Quota Exceeded):**
```json
{
  "error": "clip_quota_exceeded",
  "message": "Clip limit reached. You've used 5/5 clips this month. Upgrade to Pro for 150/month.",
  "clipsUsed": 5,
  "clipsLimit": 5,
  "tier": "Free"
}
```

---

#### POST /transcribe/:videoId

Transcribe video audio using Whisper.

**Request:**
```bash
curl -X POST http://localhost:4000/transcribe/abc123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "model": "base",
    "language": null
  }'
```

**URL Parameters:**
- `videoId` (required) - Video ID from /upload response

**Request Body:**
- `model` (optional, default: base) - Whisper model: tiny, base, small, medium, large
- `language` (optional) - ISO-639-1 language code (auto-detect if null)

**Response (200):**
```json
{
  "success": true,
  "videoId": "abc123",
  "language": "en",
  "duration": 120,
  "text": "Full transcript text here...",
  "segments": [
    {
      "id": 1,
      "seek": 0,
      "start": 0.0,
      "end": 5.2,
      "text": "First segment",
      "tokens": [...],
      "temperature": 0.0,
      "avg_logprob": -0.45,
      "compression_ratio": 1.5,
      "no_speech_prob": 0.001
    }
  ],
  "segmentCount": 24,
  "srtPreview": "1\n00:00:00,000 --> 00:00:05,200\nFirst segment\n...",
  "message": "Transcription complete. Use /analyze to find viral moments."
}
```

---

#### POST /analyze/:videoId

Find viral moments using Claude AI.

**Request:**
```bash
curl -X POST http://localhost:4000/analyze/abc123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "clipCount": 5,
    "minDuration": 15,
    "maxDuration": 120,
    "context": {
      "topic": "technology",
      "platform": "tiktok"
    }
  }'
```

**URL Parameters:**
- `videoId` (required)

**Request Body:**
- `clipCount` (optional, default: 5) - Number of clips to find
- `minDuration` (optional, default: 15) - Minimum clip duration in seconds
- `maxDuration` (optional, default: 120) - Maximum clip duration in seconds
- `context` (optional) - Context about the video for better analysis

**Response (200):**
```json
{
  "success": true,
  "videoId": "abc123",
  "momentCount": 5,
  "moments": [
    {
      "startSeconds": 10.5,
      "endSeconds": 35.2,
      "duration": 24.7,
      "hook": "The moment when the product fails spectacularly",
      "type": "failure",
      "confidence": 0.95
    },
    {
      "startSeconds": 45.0,
      "endSeconds": 67.3,
      "duration": 22.3,
      "hook": "Unexpected plot twist revealed",
      "type": "revelation",
      "confidence": 0.88
    }
  ],
  "message": "Found 5 viral moments. Use /cut to generate clips."
}
```

---

#### POST /cut/:videoId

Generate clips from analyzed moments.

**Request:**
```bash
curl -X POST http://localhost:4000/cut/abc123 \
  -H "Content-Type: application/json" \
  -H "x-user-id: user123" \
  -H "x-user-tier: pro" \
  -H "x-api-key: your-api-key" \
  -d '{
    "captionStyle": "hormozi",
    "quality": "high",
    "width": 1080,
    "height": 1920
  }'
```

**URL Parameters:**
- `videoId` (required)

**Request Body:**
- `captionStyle` (optional, default: hormozi) - Caption style (hormozi, simpley, etc.)
- `quality` (optional, default: high) - Quality: low, medium, high
- `width` (optional, default: 1080) - Video width
- `height` (optional, default: 1920) - Video height

**Response (200 - Immediate Processing):**
```json
{
  "success": true,
  "videoId": "abc123",
  "totalMoments": 5,
  "clipsGenerated": 5,
  "clipsFailed": 0,
  "results": [
    {
      "clipIndex": 1,
      "filename": "clip_1.mp4",
      "size": 12345678,
      "success": true
    }
  ],
  "message": "Generated 5/5 clips successfully."
}
```

**Response (202 - Queued, CPU >90%):**
```json
{
  "success": true,
  "status": "queued",
  "jobId": "job-uuid-here",
  "position": 3,
  "estimatedWaitSeconds": 300,
  "message": "Server busy. Your clip is queued (#3 in line). Processing starts in ~5 min."
}
```

---

#### GET /clip/:videoId/:clipIndex

Download a generated clip.

**Request:**
```bash
curl -O http://localhost:4000/clip/abc123/1
```

**URL Parameters:**
- `videoId` (required)
- `clipIndex` (required) - Clip number (1-5, etc.)

**Response (200):**
- Binary MP4 file
- Content-Type: video/mp4
- Content-Disposition: attachment; filename="clip_1.mp4"

---

#### GET /batch/:videoId

List all clips for a video.

**Request:**
```bash
curl http://localhost:4000/batch/abc123
```

**Response (200):**
```json
{
  "success": true,
  "videoId": "abc123",
  "clipCount": 5,
  "clips": [
    {
      "clipIndex": 1,
      "filename": "clip_1.mp4",
      "size": 12345678,
      "downloadUrl": "/clip/abc123/1"
    },
    {
      "clipIndex": 2,
      "filename": "clip_2.mp4",
      "size": 11234567,
      "downloadUrl": "/clip/abc123/2"
    }
  ]
}
```

---

#### POST /cleanup

Delete old files to free disk space.

**Request:**
```bash
curl -X POST http://localhost:4000/cleanup \
  -H "Content-Type: application/json" \
  -d '{ "maxAgeHours": 24 }'
```

**Request Body:**
- `maxAgeHours` (optional, default: 24) - Delete files older than this

**Response (200):**
```json
{
  "success": true,
  "filesDeleted": 42,
  "maxAgeHours": 24
}
```

---

### Health & Status

#### GET /health

Check server status and dependencies.

**Request:**
```bash
curl http://localhost:4000/health
```

**Response (200):**
```json
{
  "status": "ok",
  "uptime": 3600,
  "memory": {
    "rss": 123456789,
    "heapUsed": 98765432,
    "heapTotal": 234567890,
    "external": 12345678
  },
  "environment": {
    "nodeEnv": "development",
    "apiKeyRequired": false,
    "ffmpegAvailable": true,
    "whisperAvailable": true,
    "ffprobeAvailable": true,
    "apiKeys": {
      "anthropic": true,
      "openai": true
    }
  }
}
```

---

#### GET /

API documentation.

**Request:**
```bash
curl http://localhost:4000/
```

**Response (200):**
```json
{
  "name": "PostForge Processing Server",
  "version": "1.0.0",
  "description": "Video processing pipeline for creating viral clips",
  "endpoints": {
    "POST /upload": "Upload a video file",
    "POST /transcribe/:videoId": "Transcribe video audio with Whisper",
    ...
  }
}
```

---

### Admin Endpoints

All admin endpoints require `x-admin-key` header or `?adminKey` query parameter.

#### GET /admin/stats

Get comprehensive system statistics.

**Request:**
```bash
curl http://localhost:4000/admin/stats -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "system": {
    "uptime": 3600,
    "cpu": {
      "percentUsed": 45,
      "alert": false
    },
    "memory": {
      "totalGB": 16,
      "usedGB": 8.5,
      "freeGB": 7.5,
      "percentUsed": 53
    },
    "disk": {
      "uploadDirGB": 45.2,
      "clipsDirGB": 128.7,
      "totalUsedGB": 173.9,
      "totalCapacityGB": 500,
      "percentUsed": 35,
      "shouldStop": false
    },
    "shouldDegradeGracefully": false
  },
  "queue": {
    "activeJobs": 2,
    "maxConcurrent": 3,
    "queuedJobs": 5,
    "totalQueued": 7,
    "completedJobs": 342,
    "avgJobTime": 45,
    "timeoutJobs": 0,
    "queuedByPriority": {
      "critical": 0,
      "high": 2,
      "medium": 2,
      "low": 1
    }
  },
  "cleanup": {
    "filesDeleted": 1234,
    "spacedFreedMB": 5678.9,
    "cleanupRuns": 24,
    "lastCleanup": {
      "timestamp": "2026-03-05T13:00:00Z",
      "filesDeleted": 42,
      "spacedFreedMB": 234.5,
      "durationMs": 1234,
      "maxAgeHours": 24
    }
  },
  "alerts": [...]
}
```

---

#### GET /admin/queue

Get queue status and top users.

**Request:**
```bash
curl http://localhost:4000/admin/queue -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "queue": {
    "activeJobs": 2,
    "maxConcurrent": 3,
    "queuedJobs": 5,
    "totalQueued": 7,
    "avgJobTime": 45,
    "timeoutJobs": 0,
    "queuedByPriority": {
      "critical": 0,
      "high": 2,
      "medium": 2,
      "low": 1
    }
  },
  "topUsers": [
    {
      "userId": "user123",
      "jobCount": 42
    },
    {
      "userId": "user456",
      "jobCount": 28
    }
  ],
  "recommendations": [
    "No issues detected"
  ]
}
```

---

#### GET /admin/users

Get user statistics for abuse detection.

**Request:**
```bash
curl http://localhost:4000/admin/users -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "totalUniqueUsers": 156,
  "topUsers": [
    {
      "userId": "user123",
      "clipsUsed": 4,
      "bandwidthUsedBytes": 2684354560,
      "bandwidthUsedGB": 2.5,
      "jobCount": 42
    },
    {
      "userId": "user456",
      "clipsUsed": 3,
      "bandwidthUsedBytes": 1288490189,
      "bandwidthUsedGB": 1.2,
      "jobCount": 28
    }
  ],
  "alerts": [...]
}
```

---

#### GET /admin/health

Quick health check.

**Request:**
```bash
curl http://localhost:4000/admin/health -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "status": "healthy",
  "cpu": 45,
  "memory": 53,
  "disk": 35,
  "queue": 5,
  "alerts": false
}
```

---

#### GET /admin/job/:jobId

Get specific job status.

**Request:**
```bash
curl http://localhost:4000/admin/job/job-uuid-here -H "x-admin-key: password"
```

**Response (200 - Active Job):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "job": {
    "jobId": "job-uuid-here",
    "status": "processing",
    "progress": 45,
    "elapsedSeconds": 120
  }
}
```

**Response (200 - Completed Job):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "job": {
    "jobId": "job-uuid-here",
    "status": "completed",
    "result": { "clipsGenerated": 5 },
    "durationSeconds": 280
  }
}
```

---

#### GET /admin/dashboard

Full monitoring dashboard.

**Request:**
```bash
curl http://localhost:4000/admin/dashboard -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "overview": {
    "status": "operational",
    "cpuPercent": 45,
    "memoryPercent": 53,
    "diskPercent": 35,
    "activeJobs": 2,
    "queuedJobs": 5,
    "totalJobs": 7
  },
  "system": { ... },
  "queue": { ... },
  "topUsers": [ ... ],
  "alerts": [ ... ],
  "recommendations": [ ... ]
}
```

---

#### GET /admin/alerts

Get recent alerts.

**Request:**
```bash
curl "http://localhost:4000/admin/alerts?severity=warning&limit=50" \
  -H "x-admin-key: password"
```

**Query Parameters:**
- `severity` (optional) - Filter by: info, warning, critical
- `limit` (optional, default: 50) - Number of alerts to return

**Response (200):**
```json
{
  "timestamp": "2026-03-05T14:21:00Z",
  "count": 3,
  "alerts": [
    {
      "timestamp": "2026-03-05T14:20:00Z",
      "severity": "warning",
      "type": "disk_warning",
      "message": "Disk 75% full. Consider cleanup."
    },
    {
      "timestamp": "2026-03-05T14:10:00Z",
      "severity": "info",
      "type": "cleanup_complete",
      "message": "Cleanup completed: 42 files deleted, 234.5MB freed"
    }
  ]
}
```

---

#### GET /admin/config

Get server configuration.

**Request:**
```bash
curl http://localhost:4000/admin/config -H "x-admin-key: password"
```

**Response (200):**
```json
{
  "uploadDir": "/tmp/postforge-uploads",
  "clipsDir": "/tmp/postforge-clips",
  "maxConcurrentJobs": 3,
  "jobTimeoutMinutes": 30,
  "cleanupIntervalHours": 1,
  "maxAgeHoursForCleanup": 24,
  "authRequired": true,
  "adminAuthRequired": true,
  "environment": "development",
  "debugMode": false
}
```

---

#### POST /admin/cleanup

Manually trigger cleanup.

**Request:**
```bash
curl -X POST http://localhost:4000/admin/cleanup \
  -H "x-admin-key: password" \
  -H "Content-Type: application/json" \
  -d '{ "maxAgeHours": 24 }'
```

**Request Body:**
- `maxAgeHours` (optional, default: 24)

**Response (200):**
```json
{
  "success": true,
  "timestamp": "2026-03-05T14:21:00Z",
  "cleanup": {
    "timestamp": "2026-03-05T14:21:00Z",
    "filesDeleted": 42,
    "spacedFreedMB": 234.5,
    "durationMs": 1234,
    "maxAgeHours": 24
  },
  "message": "Cleaned up successfully. Freed 234.5MB"
}
```

---

#### POST /admin/reset-user

Reset rate limit stats for a user.

**Request:**
```bash
curl -X POST http://localhost:4000/admin/reset-user \
  -H "x-admin-key: password" \
  -H "Content-Type: application/json" \
  -d '{ "userId": "user123" }'
```

**Request Body:**
- `userId` (required) - User ID to reset

**Response (200):**
```json
{
  "success": true,
  "message": "Reset stats for user user123",
  "userId": "user123"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "invalid_request",
  "message": "Description of what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing API key"
}
```

### 413 Payload Too Large
```json
{
  "error": "file_too_large",
  "message": "File size exceeds tier limit"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limited",
  "message": "Too many requests. Maximum X requests per minute.",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "Something went wrong",
  "details": "Stack trace (if DEBUG=true)"
}
```

---

## Rate Limiting Tiers

| Tier | Clips/Month | Max File | Concurrent | Bandwidth |
|------|-------------|----------|-----------|-----------|
| Free | 5 | 100MB | 1 | 1GB |
| Growth | 50 | 500MB | 2 | 10GB |
| Pro | 150 | 1GB | 3 | 50GB |
| Business | 500 | 5GB | 5 | 200GB |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 202 | Accepted (queued) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 413 | Payload Too Large |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

