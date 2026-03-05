# PostForge Processing Server

Video processing pipeline for creating viral-worthy clips from longer videos.

**What it does:**
1. ✅ Upload videos (MP4, MOV, AVI, MKV, WebM)
2. ✅ Transcribe audio with Whisper
3. ✅ Analyze transcript with Claude AI to find viral moments
4. ✅ Cut clips with styled captions (Hormozi, Minimal, Karaoke, Impact)
5. ✅ Generate 5 optimized clips per video (1080x1920 for TikTok/Reels/Shorts)
6. ✅ Download ready-to-upload MP4 files

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- Docker & Docker Compose (recommended)
- FFmpeg (included in Docker)
- Python 3 (for Whisper)

### 2. Setup

```bash
# Clone and navigate
cd processing-server

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

Server runs at `http://localhost:4000`

### 4. Test the Pipeline

```bash
# Upload a video
curl -X POST http://localhost:4000/upload \
  -H "x-api-key: pf-process-key-dev" \
  -F "video=@test-video.mp4"

# Response: {"videoId": "abc123", ...}

# Transcribe
curl -X POST http://localhost:4000/transcribe/abc123 \
  -H "x-api-key: pf-process-key-dev" \
  -H "Content-Type: application/json" \
  -d '{"model": "base"}'

# Analyze for viral moments
curl -X POST http://localhost:4000/analyze/abc123 \
  -H "x-api-key: pf-process-key-dev" \
  -H "Content-Type: application/json" \
  -d '{"clipCount": 5}'

# Generate clips
curl -X POST http://localhost:4000/cut/abc123 \
  -H "x-api-key: pf-process-key-dev" \
  -H "Content-Type: application/json" \
  -d '{"captionStyle": "hormozi", "quality": "high"}'

# Download clip 1
curl http://localhost:4000/clip/abc123/1 \
  -H "x-api-key: pf-process-key-dev" \
  -o clip_1.mp4
```

---

## API Endpoints

### Health Check
```bash
GET /health
```
Returns system status, available tools, API key configuration.

---

### Upload Video
```bash
POST /upload
Content-Type: multipart/form-data

Parameters:
- video: Binary MP4/MOV/AVI/MKV file (<500MB)
- sessionId: Optional custom ID (default: auto-generated UUID)

Response:
{
  "success": true,
  "videoId": "abc123def456",
  "filename": "abc123def456.mp4",
  "size": 123456789,
  "duration": 600,
  "width": 1920,
  "height": 1080
}
```

---

### Transcribe
```bash
POST /transcribe/:videoId
Content-Type: application/json

Body:
{
  "model": "base",        // tiny, base, small, medium, large
  "language": "en"        // optional: auto-detect if null
}

Response:
{
  "success": true,
  "videoId": "abc123",
  "language": "en",
  "duration": 600,
  "text": "Full transcript here...",
  "segments": [
    {
      "id": 0,
      "start": 0,
      "end": 2.5,
      "text": "First few words"
    }
  ],
  "srtPreview": "[00:00:00,000 --> 00:00:02,500] First few words\n..."
}
```

**Note:** Whisper model sizes (trade-off between speed and accuracy):
- `tiny` - Fastest, lower accuracy (1-2 min for 10 min video)
- `base` - Good balance (2-5 min) ⭐ Recommended
- `small` - Better accuracy (5-10 min)
- `medium` - High accuracy (15-30 min)
- `large` - Best accuracy, slowest (30+ min)

---

### Analyze for Viral Moments
```bash
POST /analyze/:videoId
Content-Type: application/json

Body:
{
  "clipCount": 5,              // How many viral clips to find
  "minDuration": 15,           // Minimum clip length (seconds)
  "maxDuration": 120,          // Maximum clip length (seconds)
  "context": {
    "industry": "fitness",
    "audience": "Gen Z",
    "voice": "energetic",
    "keyMessage": "Get stronger without equipment"
  }
}

Response:
{
  "success": true,
  "videoId": "abc123",
  "momentCount": 5,
  "moments": [
    {
      "startSeconds": 5,
      "endSeconds": 45,
      "duration": 40,
      "hook": "You've been doing pushups wrong your whole life",
      "type": "pattern-break",
      "confidence": 0.95
    }
  ]
}
```

**Fallback:** If Claude API fails, uses keyword-based detection (still generates usable clips).

---

### Cut & Caption Clips
```bash
POST /cut/:videoId
Content-Type: application/json

Body:
{
  "captionStyle": "hormozi",   // hormozi, minimal, karaoke, impact
  "quality": "high",           // low, medium, high (speed vs quality)
  "width": 1080,               // Output width (default 1080)
  "height": 1920               // Output height (default 1920 for vertical)
}

Response:
{
  "success": true,
  "videoId": "abc123",
  "clipsGenerated": 5,
  "results": [
    {
      "clipIndex": 1,
      "filename": "clip_1.mp4",
      "size": 45678901,
      "duration": 40,
      "success": true
    }
  ]
}
```

**Caption Styles:**
- `hormozi` - Bold white text with thick black outline (Andrew Tate style)
- `minimal` - Clean sans-serif, subtle shadow
- `karaoke` - Yellow text with dark shadow effect
- `impact` - Large serif with strong border

---

### Download Clip
```bash
GET /clip/:videoId/:clipIndex
Header: x-api-key: your-key

Returns: MP4 file, ready for TikTok/Instagram/YouTube Shorts
```

---

### List All Clips
```bash
GET /batch/:videoId
Header: x-api-key: your-key

Response:
{
  "success": true,
  "videoId": "abc123",
  "clipCount": 5,
  "clips": [
    {
      "clipIndex": 1,
      "filename": "clip_1.mp4",
      "size": 45678901,
      "downloadUrl": "/clip/abc123/1"
    }
  ]
}
```

---

### Clean Up Old Files
```bash
POST /cleanup
Content-Type: application/json

Body:
{
  "maxAgeHours": 24  // Delete files older than 24 hours
}

Response:
{
  "success": true,
  "filesDeleted": 42,
  "maxAgeHours": 24
}
```

---

## Configuration

### Environment Variables

```env
# Server
NODE_ENV=production
PORT=4000
DEBUG=false

# Authentication
PROCESSING_API_KEY=your-secret-key
REQUIRE_AUTH=true

# File Storage
UPLOAD_DIR=/data/uploads
CLIPS_DIR=/data/clips

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### File Size Limits
- Max video upload: **500 MB**
- Max batch size: 5 clips per video
- Auto-cleanup: Files older than 24 hours

---

## Deployment

### Option 1: Docker (Recommended)

```bash
# Build image
docker build -t postforge-processing .

# Run container
docker run -d \
  -p 4000:4000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e PROCESSING_API_KEY=your-secret \
  -v postforge-data:/data \
  postforge-processing
```

### Option 2: DigitalOcean App Platform

```bash
# Build and push to Docker Hub
docker build -t your-username/postforge-processing .
docker push your-username/postforge-processing

# In DigitalOcean:
# 1. Create new App
# 2. Connect GitHub repo or Docker Hub image
# 3. Set environment variables
# 4. Deploy

# With app.yaml:
name: postforge-processing
services:
  - name: video-processor
    github:
      repo: your-repo/postforge
      branch: main
    build_command: "npm install"
    run_command: "node server.js"
    envs:
      - key: ANTHROPIC_API_KEY
        type: SECRET
      - key: PROCESSING_API_KEY
        type: SECRET
    http_port: 4000
```

### Option 3: Railway

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect GitHub to Railway
# 3. Set environment variables in Railway dashboard
# 4. Deploy (auto-deploys on push)

# Using railway.json:
{
  "builder": "dockerfile",
  "deploy": {
    "startCommand": "npm install && node server.js"
  }
}
```

### Option 4: Fly.io

```bash
# Install fly CLI
brew install flyctl

# Initialize and deploy
flyctl auth login
flyctl launch
flyctl deploy
```

---

## Troubleshooting

### "Whisper not found"
```bash
# Reinstall Whisper
pip install openai-whisper

# Or in Docker:
docker-compose rebuild
```

### "FFmpeg command failed"
- Ensure FFmpeg is installed: `ffmpeg -version`
- Check video codec compatibility: `ffprobe video.mp4`
- Try with a simpler video format (standard H.264 MP4)

### "Claude API rate limited"
- Built-in retry logic with exponential backoff
- Falls back to keyword-based moment detection
- Increase `Anthropic` rate limit in your account

### "Disk space running out"
```bash
# Clean up old files manually
curl -X POST http://localhost:4000/cleanup \
  -H "x-api-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"maxAgeHours": 6}'

# Or set up cron job
0 */6 * * * curl -X POST http://localhost:4000/cleanup ...
```

### "Video upload fails"
- Check file size (<500MB)
- Verify format (MP4, MOV, AVI, MKV, WebM)
- Test with sample video

---

## Performance Tips

### For Faster Transcription
- Use smaller Whisper model: `"model": "tiny"` or `"base"`
- Process multiple videos in parallel (separate requests)
- Consider speech-only audio (remove background music first)

### For Better Viral Moments
- Provide business context in `/analyze` request
- Use `minDuration: 20` to avoid too-short clips
- Request more clips (`clipCount: 10`) then manually select best

### For Faster Clip Generation
- Use `quality: "low"` for quick tests
- Use `quality: "high"` for final exports
- Consider batch processing

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PostForge App                        │
│                  (Vercel Frontend)                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ REST API calls
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Processing Server (This Service)              │
├─────────────────────────────────────────────────────────┤
│ Routes: upload, transcribe, analyze, cut, download     │
│                                                         │
│ Services:                                               │
│ - FFmpegService: Video cutting, encoding, captions    │
│ - WhisperService: Audio transcription (OpenAI)        │
│ - MomentsService: Claude AI viral moment detection    │
├─────────────────────────────────────────────────────────┤
│ Storage: /data/uploads, /data/clips                    │
│ External: ffmpeg, whisper, Claude API                 │
└─────────────────────────────────────────────────────────┘
```

---

## Development

### Running Locally (without Docker)

```bash
# Install dependencies
npm install

# Install system dependencies
# macOS:
brew install ffmpeg

# Linux (Ubuntu/Debian):
sudo apt-get install ffmpeg

# Install Whisper
pip install openai-whisper

# Set environment
export ANTHROPIC_API_KEY=sk-ant-...
export PROCESSING_API_KEY=dev-key
export REQUIRE_AUTH=false

# Start server
npm start

# Or with auto-reload:
npm run dev  # requires nodemon
```

### Testing

```bash
# Test health endpoint
curl http://localhost:4000/health

# Test with a sample video (upload a test file)
curl -X POST http://localhost:4000/upload \
  -F "video=@sample.mp4"
```

---

## License

Part of PostForge. All rights reserved.

---

## Support

Issues or questions? Check logs:

```bash
docker logs postforge-processing

# Or view server logs
tail -f /var/log/postforge-processing.log
```
