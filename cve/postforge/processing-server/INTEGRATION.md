# Integration Guide

How to integrate the Processing Server into your main PostForge app.

---

## Overview

The Processing Server is a **separate microservice** that handles video processing. Your main app communicates via REST API calls.

```
Main App (Vercel)
    ↓ HTTP calls
Processing Server (DigitalOcean/AWS)
    ↓ Process
    ↑ Return MP4s
```

---

## 1. Installation

### Option A: As an NPM Package

```bash
npm install postforge-processing-client
```

### Option B: Inline Usage

Copy `client-example.js` to your main app and import:

```javascript
const ProcessingClient = require('./services/ProcessingClient');
```

---

## 2. Configuration

In your main app's `.env`:

```env
PROCESSING_SERVER_URL=https://processing.postforge.com
PROCESSING_API_KEY=your-secret-api-key
```

Or in `config.js`:

```javascript
module.exports = {
  processing: {
    serverUrl: process.env.PROCESSING_SERVER_URL || 'http://localhost:4000',
    apiKey: process.env.PROCESSING_API_KEY,
    timeout: 600000  // 10 minutes for video processing
  }
};
```

---

## 3. Basic Usage

### Simple Pipeline

```javascript
const ProcessingClient = require('./client-example');

const client = new ProcessingClient(
  process.env.PROCESSING_SERVER_URL,
  process.env.PROCESSING_API_KEY
);

// Process a video
async function createClips(videoFile, businessContext) {
  try {
    const result = await client.processVideo(videoFile, {
      clipCount: 5,
      captionStyle: 'hormozi',
      quality: 'high',
      context: {
        industry: businessContext.industry,
        audience: businessContext.targetAudience,
        voice: businessContext.voice
      }
    });

    return {
      success: true,
      videoId: result.videoId,
      clips: result.clips,
      clipCount: result.clipsGenerated
    };
  } catch (error) {
    console.error('Video processing failed:', error.message);
    return { success: false, error: error.message };
  }
}
```

---

## 4. Step-by-Step Pipeline

If you want more control, call each step separately:

```javascript
async function processVideoDetailed(videoFile, options) {
  const client = new ProcessingClient(
    process.env.PROCESSING_SERVER_URL,
    process.env.PROCESSING_API_KEY
  );

  // Step 1: Upload
  console.log('Uploading...');
  const upload = await client.uploadVideo(videoFile);
  const videoId = upload.videoId;
  console.log(`Video ID: ${videoId}`);

  // Step 2: Transcribe
  console.log('Transcribing...');
  const transcript = await client.transcribe(videoId, {
    model: 'base',
    language: 'en'
  });
  console.log(`Transcript: ${transcript.segmentCount} segments`);

  // Step 3: Analyze
  console.log('Finding viral moments...');
  const moments = await client.analyze(videoId, {
    clipCount: 5,
    context: options.context
  });
  console.log(`Found ${moments.momentCount} moments`);

  // Step 4: Cut
  console.log('Generating clips...');
  const cut = await client.cut(videoId, {
    captionStyle: options.captionStyle || 'hormozi',
    quality: options.quality || 'high'
  });
  console.log(`Generated ${cut.clipsGenerated} clips`);

  // Step 5: Download (if needed)
  if (options.downloadClips) {
    console.log('Downloading clips...');
    await client.downloadAllClips(videoId, './clips');
  }

  return {
    videoId,
    transcript,
    moments,
    clips: cut.results
  };
}
```

---

## 5. Express Route Example

Add this to your main app's routes:

```javascript
const express = require('express');
const multer = require('multer');
const ProcessingClient = require('../services/ProcessingClient');

const router = express.Router();
const upload = multer({ dest: 'tmp/uploads' });
const client = new ProcessingClient(
  process.env.PROCESSING_SERVER_URL,
  process.env.PROCESSING_API_KEY
);

// POST /api/clips/generate
router.post('/clips/generate', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video provided' });
    }

    // Get business context from request
    const context = req.body.context ? JSON.parse(req.body.context) : {};

    // Process video
    const result = await client.processVideo(req.file.path, {
      clipCount: parseInt(req.body.clipCount) || 5,
      captionStyle: req.body.captionStyle || 'hormozi',
      quality: req.body.quality || 'high',
      context
    });

    // Store result in database
    const clips = await Clip.create({
      videoId: result.videoId,
      userId: req.user.id,
      clipCount: result.clipCount,
      clips: result.clips,
      status: 'ready'
    });

    res.json({ success: true, clips });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clips/:videoId
router.get('/clips/:videoId', async (req, res) => {
  try {
    const list = await client.listClips(req.params.videoId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/clips/:videoId/:clipIndex/download
router.get('/clips/:videoId/:clipIndex/download', async (req, res) => {
  try {
    const { videoId, clipIndex } = req.params;
    const file = await client.downloadClip(
      videoId,
      clipIndex,
      `./tmp/clip-${Date.now()}.mp4`
    );

    res.download(file, `clip_${clipIndex}.mp4`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 6. Frontend Integration

### React Component Example

```jsx
import React, { useState } from 'react';
import axios from 'axios';

export function VideoClipGenerator() {
  const [video, setVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clips, setClips] = useState([]);
  const [progress, setProgress] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    setProgress('Uploading...');

    try {
      const formData = new FormData();
      formData.append('video', file);

      setProgress('Transcribing...');
      const uploadRes = await axios.post('/api/clips/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProgress('Generating clips...');
      // Server handles the rest

      setProgress('Done! Downloading...');
      const clipsRes = await axios.get(
        `/api/clips/${uploadRes.data.clips.videoId}`
      );

      setClips(clipsRes.data.clips);
      setProgress('');
    } catch (error) {
      setProgress(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="video-generator">
      <h2>Generate Viral Clips</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleUpload}
        disabled={processing}
      />

      {processing && (
        <div className="progress">
          <p>{progress}</p>
          <div className="spinner"></div>
        </div>
      )}

      {clips.length > 0 && (
        <div className="clips-list">
          <h3>Generated Clips ({clips.length})</h3>
          {clips.map(clip => (
            <div key={clip.clipIndex} className="clip-card">
              <video controls width="200">
                <source src={`/api/clips/${clip.videoId}/${clip.clipIndex}/download`} type="video/mp4" />
              </video>
              <a href={`/api/clips/${clip.videoId}/${clip.clipIndex}/download`} download>
                Download Clip {clip.clipIndex}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 7. Database Schema

If you want to track clips in your database:

```javascript
// Clips table
{
  id: String,
  userId: String,
  videoId: String,  // ID from processing server
  originalVideoPath: String,
  clipCount: Number,
  clips: [
    {
      clipIndex: Number,
      filename: String,
      size: Number,
      duration: Number,
      hook: String,
      downloadUrl: String
    }
  ],
  status: 'processing' | 'ready' | 'failed',
  error: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. Error Handling

```javascript
async function safeProcessVideo(videoFile, options) {
  try {
    return await client.processVideo(videoFile, options);
  } catch (error) {
    // Log error
    console.error('Processing error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    });

    // Return user-friendly error
    if (error.message.includes('Rate limited')) {
      return {
        success: false,
        error: 'API limit reached. Please try again in a few minutes.'
      };
    }

    if (error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Processing took too long. Try with a shorter video.'
      };
    }

    if (error.message.includes('Not found')) {
      return {
        success: false,
        error: 'Video processing session expired. Please upload again.'
      };
    }

    return {
      success: false,
      error: 'Video processing failed. Please try again.'
    };
  }
}
```

---

## 9. Webhooks (Optional)

If you want real-time status updates, the server can send webhooks:

```javascript
// In your main app
app.post('/webhooks/processing', (req, res) => {
  const { videoId, status, data } = req.body;

  // Update database
  Clip.updateOne(
    { videoId },
    {
      status,
      clips: data.clips || undefined,
      error: data.error || undefined
    }
  );

  // Notify user via WebSocket
  io.emit(`video:${videoId}:${status}`, data);

  res.json({ ok: true });
});
```

---

## 10. Deployment Checklist

Before going live:

- [ ] Processing server deployed and accessible
- [ ] API key configured in main app's `.env`
- [ ] Error handling implemented
- [ ] Database schema for tracking clips
- [ ] Frontend UI for uploading videos
- [ ] Download endpoint tested
- [ ] File cleanup configured (cron job)
- [ ] Rate limiting on upload endpoint
- [ ] Logging in place for debugging
- [ ] SSL/HTTPS enabled on both services

---

## Performance Considerations

### Timeout Settings

Video processing can be slow. Adjust timeouts:

```javascript
// For a 30-minute video (high quality):
// - Whisper: 30-60 minutes (depends on model)
// - Claude analysis: 1-2 minutes
// - FFmpeg cutting: 5-10 minutes
// Total: 45-75 minutes

axios.defaults.timeout = 90 * 60 * 1000;  // 90 minutes
```

### Queue Management

For many concurrent uploads, use a job queue:

```javascript
const Queue = require('bull');
const videoQueue = new Queue('video-processing');

videoQueue.process(async job => {
  const client = new ProcessingClient(...);
  return await client.processVideo(job.data.videoFile, job.data.options);
});

// In route:
videoQueue.add({
  videoFile: req.file.path,
  options: { clipCount: 5 }
});
```

---

## Testing Integration

```bash
# 1. Start processing server locally
cd processing-server
docker-compose up

# 2. Update main app .env
PROCESSING_SERVER_URL=http://localhost:4000
PROCESSING_API_KEY=pf-process-key-dev

# 3. Test endpoint
curl -X POST http://localhost:3000/api/clips/generate \
  -F "video=@test-video.mp4"

# 4. Check clip status
curl http://localhost:3000/api/clips/video-id-123
```

---

## Support

Questions about integration? Check:
- Processing Server `README.md`
- Processing Server `API` section
- Main app logs for errors
- Processing server logs: `docker logs postforge-processing`
