/**
 * PostForge Processing Server
 * Video processing pipeline: Upload → Transcribe → Analyze → Cut → Download
 * 
 * Deploy: Docker or standalone Node.js
 * Requirements: ffmpeg, whisper, Python 3
 * 
 * Environment variables:
 * - PORT: Server port (default 4000)
 * - PROCESSING_API_KEY: API key for requests (default: dev key)
 * - ANTHROPIC_API_KEY: Claude API key
 * - OPENAI_API_KEY: OpenAI API key (fallback for Whisper)
 * - UPLOAD_DIR: Directory for uploaded videos (default /tmp/postforge-uploads)
 * - CLIPS_DIR: Directory for generated clips (default /tmp/postforge-clips)
 * - DEBUG: Enable debug output (default false)
 */

require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');

// Import routes
const videoRoutes = require('./routes/video');

const app = express();
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.PROCESSING_API_KEY || 'pf-process-key-dev-change-in-production';

// ─── Middleware ────────────────────────────────────────────

// Parse JSON bodies up to 100MB (for metadata transmission)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Key authentication (optional - disable for internal use)
const authRequired = process.env.REQUIRE_AUTH !== 'false';
const authMiddleware = (req, res, next) => {
  if (!authRequired) return next();

  const key = req.headers['x-api-key'] || req.query.key;
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

app.use(authMiddleware);

// ─── Routes ────────────────────────────────────────────────

// Health check endpoint
app.get('/health', (req, res) => {
  const checks = {
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      apiKeyRequired: authRequired,
      ffmpegAvailable: checkCommand('ffmpeg -version'),
      whisperAvailable: checkCommand('whisper --help'),
      ffprobeAvailable: checkCommand('ffprobe -version'),
      apiKeys: {
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        openai: !!process.env.OPENAI_API_KEY
      }
    }
  };

  res.json(checks);
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'PostForge Processing Server',
    version: '1.0.0',
    description: 'Video processing pipeline for creating viral clips',
    endpoints: {
      'POST /upload': 'Upload a video file',
      'POST /transcribe/:videoId': 'Transcribe video audio with Whisper',
      'POST /analyze/:videoId': 'Find viral moments using Claude',
      'POST /cut/:videoId': 'Generate clipped videos with captions',
      'GET /clip/:videoId/:clipIndex': 'Download a generated clip',
      'GET /batch/:videoId': 'List all clips for a video',
      'POST /cleanup': 'Delete old files',
      'GET /health': 'Health check',
      'GET /': 'This documentation'
    },
    authentication: authRequired ? 'Required (x-api-key header)' : 'Disabled',
    documentation: 'See README.md'
  });
});

// Register video processing routes
app.use('/', videoRoutes);

// ─── Error Handling ────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (err.message.includes('File too large')) {
    return res.status(413).json({ error: 'File too large (max 500MB)' });
  }

  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.DEBUG ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// ─── Startup ───────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  PostForge Processing Server                  ║
║  Listening on port ${PORT}                      ║
╚════════════════════════════════════════════════╝

Configuration:
  Environment: ${process.env.NODE_ENV || 'development'}
  Auth Required: ${authRequired}
  Upload Dir: ${process.env.UPLOAD_DIR || '/tmp/postforge-uploads'}
  Clips Dir: ${process.env.CLIPS_DIR || '/tmp/postforge-clips'}
  Debug: ${process.env.DEBUG || 'false'}

Available Endpoints:
  GET  /                    - API documentation
  GET  /health              - Health check
  POST /upload              - Upload video
  POST /transcribe/:videoId - Transcribe with Whisper
  POST /analyze/:videoId    - Find viral moments (Claude)
  POST /cut/:videoId        - Generate clips with captions
  GET  /clip/:videoId/:idx  - Download clip
  GET  /batch/:videoId      - List all clips
  POST /cleanup             - Delete old files

Ready to process videos!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// ─── Utilities ─────────────────────────────────────────────

function checkCommand(cmd) {
  try {
    const { execSync } = require('child_process');
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = app;
