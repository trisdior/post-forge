/**
 * Video Processing Routes
 * Upload → Transcribe → Analyze → Cut → Download pipeline
 * With rate limiting, quota checks, and queue management
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const FFmpegService = require('../services/ffmpeg');
const WhisperService = require('../services/whisper');
const MomentsService = require('../services/moments');
const rateLimiter = require('../middleware/rateLimiter');
const { queue } = require('../services/queue');
const { monitor } = require('../services/monitoring');

const router = express.Router();

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/postforge-uploads';
const CLIPS_DIR = process.env.CLIPS_DIR || '/tmp/postforge-clips';
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE) || 500 * 1024 * 1024; // 500MB

// Ensure directories exist
[UPLOAD_DIR, CLIPS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const sessionId = req.body.sessionId || uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${sessionId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp4|mov|avi|mkv|webm)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files allowed (mp4, mov, avi, mkv, webm)'));
    }
  }
});

// ─── POST /upload ─────────────────────────────────────────
// Upload a video file
// Validates file size against user tier and clip quota
router.post('/upload',
  upload.single('video'),
  rateLimiter.validateFileSize,
  rateLimiter.checkClipQuota,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const videoId = path.basename(req.file.filename, path.extname(req.file.filename));
      const { userId, userTier, tier, fileSize } = req.uploadValidation;

      // Validate and get metadata
      const metadata = await FFmpegService.validateVideo(req.file.path);

      // Record this clip in the rate limiter
      rateLimiter.recordClip(userId, fileSize);

      res.json({
        success: true,
        videoId,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        codec: metadata.codec,
        userTier: tier.name,
        clipsUsed: req.clipQuota.clipsUsed + 1,
        clipsRemaining: req.clipQuota.clipsRemaining - 1,
        message: 'Video uploaded successfully. Use this videoId for transcription.'
      });
    } catch (error) {
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(400).json({
        error: error.message,
        details: process.env.DEBUG ? error.stack : undefined
      });
    }
  }
);

// ─── POST /transcribe/:videoId ────────────────────────────
// Transcribe video audio using Whisper
router.post('/transcribe/:videoId', async (req, res) => {
  try {
    const videoFile = findVideoFile(req.params.videoId);
    if (!videoFile) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const model = req.body.model || 'base';
    const language = req.body.language || null;
    const workDir = path.join(CLIPS_DIR, req.params.videoId);

    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    // Extract audio
    const audioFile = path.join(workDir, 'audio.wav');
    await FFmpegService.extractAudio(videoFile, audioFile);

    // Transcribe with Whisper
    const transcript = await WhisperService.transcribe(audioFile, {
      model,
      language,
      outputDir: workDir,
      wordTimestamps: true
    });

    // Save transcript for later use
    fs.writeFileSync(
      path.join(workDir, 'transcript.json'),
      JSON.stringify(transcript, null, 2)
    );

    res.json({
      success: true,
      videoId: req.params.videoId,
      language: transcript.language,
      duration: transcript.duration,
      text: transcript.text,
      segments: transcript.segments,
      segmentCount: transcript.segments.length,
      srtPreview: transcript.srt.split('\n').slice(0, 20).join('\n') + '\n...',
      message: 'Transcription complete. Use /analyze to find viral moments.'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.DEBUG ? error.stack : undefined
    });
  }
});

// ─── POST /analyze/:videoId ───────────────────────────────
// Analyze transcript to find viral moments using Claude
router.post('/analyze/:videoId', async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const workDir = path.join(CLIPS_DIR, videoId);

    // Load saved transcript
    const transcriptFile = path.join(workDir, 'transcript.json');
    if (!fs.existsSync(transcriptFile)) {
      return res.status(404).json({
        error: 'Transcript not found. Call /transcribe first.'
      });
    }

    const transcript = JSON.parse(fs.readFileSync(transcriptFile, 'utf8'));

    const clipCount = req.body.clipCount || 5;
    const minDuration = req.body.minDuration || 15;
    const maxDuration = req.body.maxDuration || 120;
    const context = req.body.context || {};

    // Find viral moments
    let moments;
    try {
      moments = await MomentsService.findViralMoments(
        transcript.text,
        transcript.segments,
        {
          clipCount,
          minDuration,
          maxDuration,
          context
        }
      );
    } catch (error) {
      console.warn('Claude API failed, using fallback:', error.message);
      // Fallback to keyword-based detection
      moments = await MomentsService.findMomentsFallback(
        transcript.text,
        transcript.segments,
        clipCount
      );
    }

    // Save moments for later use
    fs.writeFileSync(
      path.join(workDir, 'moments.json'),
      JSON.stringify(moments, null, 2)
    );

    res.json({
      success: true,
      videoId,
      momentCount: moments.length,
      moments: moments.map(m => ({
        startSeconds: m.startSeconds,
        endSeconds: m.endSeconds,
        duration: m.duration,
        hook: m.hook,
        type: m.type,
        confidence: m.confidence
      })),
      message: `Found ${moments.length} viral moments. Use /cut to generate clips.`
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.DEBUG ? error.stack : undefined
    });
  }
});

// ─── POST /cut/:videoId ───────────────────────────────────
// Cut and caption clips based on analyzed moments
// Uses job queue for max 3 concurrent processing
// Degrades gracefully if CPU >90%
router.post('/cut/:videoId', rateLimiter.checkClipQuota, async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const userId = req.headers['x-user-id'] || req.query.userId || 'anonymous';
    const userTier = req.headers['x-user-tier'] || req.query.tier || 'free';
    const videoFile = findVideoFile(videoId);
    const workDir = path.join(CLIPS_DIR, videoId);

    if (!videoFile) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Load moments
    const momentsFile = path.join(workDir, 'moments.json');
    if (!fs.existsSync(momentsFile)) {
      return res.status(404).json({
        error: 'Moments not found. Call /analyze first.'
      });
    }

    const moments = JSON.parse(fs.readFileSync(momentsFile, 'utf8'));

    const captionStyle = req.body.captionStyle || 'hormozi';
    const quality = req.body.quality || 'high';
    const width = req.body.width || 1080;
    const height = req.body.height || 1920;

    // Check if we should gracefully degrade
    const health = monitor.getSystemHealth();
    const shouldQueue = health.cpu.percentUsed > 90;

    if (shouldQueue) {
      // Queue the job instead of processing immediately
      const job = {
        type: 'cut',
        userId,
        userTier,
        videoId,
        payload: { captionStyle, quality, width, height },
        execute: async () => {
          return await processCutJob(videoFile, workDir, moments, {
            captionStyle,
            quality,
            width,
            height
          });
        }
      };

      const queueResult = queue.enqueue(job);

      return res.status(202).json({
        success: true,
        status: 'queued',
        jobId: queueResult.jobId,
        position: queueResult.position,
        estimatedWaitSeconds: queueResult.estimatedWaitTime * 60,
        message: queueResult.message
      });
    }

    // Process immediately
    const results = await processCutJob(videoFile, workDir, moments, {
      captionStyle,
      quality,
      width,
      height
    });

    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      videoId,
      totalMoments: moments.length,
      clipsGenerated: successful,
      clipsFailed: results.length - successful,
      results: results.map(r => ({
        clipIndex: r.clipIndex,
        filename: r.filename,
        size: r.size,
        success: r.success,
        error: r.error
      })),
      message: `Generated ${successful}/${moments.length} clips successfully.`
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.DEBUG ? error.stack : undefined
    });
  }
});

/**
 * Process cut job (extracted for queue support)
 * @private
 */
async function processCutJob(videoFile, workDir, moments, options) {
  const { captionStyle, quality, width, height } = options;
  const presets = { low: 'fast', medium: 'medium', high: 'slow' };
  const preset = presets[quality] || 'medium';
  const results = [];

  for (let i = 0; i < moments.length; i++) {
    const moment = moments[i];
    const outputFile = path.join(workDir, `clip_${i + 1}.mp4`);

    try {
      await FFmpegService.cutClip(
        videoFile,
        outputFile,
        {
          startTime: moment.startSeconds,
          duration: moment.duration || moment.endSeconds - moment.startSeconds,
          width,
          height,
          captionText: moment.fullCaption || moment.hook,
          captionStyle,
          preset
        }
      );

      const stat = fs.statSync(outputFile);
      results.push({
        clipIndex: i + 1,
        filename: `clip_${i + 1}.mp4`,
        outputFile,
        size: stat.size,
        duration: moment.duration,
        hook: moment.hook,
        success: true
      });
    } catch (error) {
      results.push({
        clipIndex: i + 1,
        error: error.message,
        success: false
      });
    }
  }

  return results;
}

// ─── GET /clip/:videoId/:clipIndex ────────────────────────
// Download a generated clip
router.get('/clip/:videoId/:clipIndex', (req, res) => {
  try {
    const videoId = req.params.videoId;
    const clipIndex = req.params.clipIndex;
    const clipFile = path.join(CLIPS_DIR, videoId, `clip_${clipIndex}.mp4`);

    if (!fs.existsSync(clipFile)) {
      return res.status(404).json({
        error: 'Clip not found',
        path: clipFile
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="clip_${clipIndex}.mp4"`);
    res.sendFile(clipFile);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ─── GET /batch/:videoId ──────────────────────────────────
// Get list of all clips for a video
router.get('/batch/:videoId', (req, res) => {
  try {
    const videoId = req.params.videoId;
    const workDir = path.join(CLIPS_DIR, videoId);

    if (!fs.existsSync(workDir)) {
      return res.status(404).json({ error: 'Video session not found' });
    }

    const clipFiles = fs.readdirSync(workDir).filter(f => f.match(/^clip_\d+\.mp4$/));

    const clips = clipFiles.map((file, idx) => {
      const stat = fs.statSync(path.join(workDir, file));
      return {
        clipIndex: idx + 1,
        filename: file,
        size: stat.size,
        downloadUrl: `/clip/${videoId}/${idx + 1}`
      };
    });

    res.json({
      success: true,
      videoId,
      clipCount: clips.length,
      clips
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ─── POST /cleanup ────────────────────────────────────────
// Delete old files to free up disk space
router.post('/cleanup', (req, res) => {
  try {
    const maxAgeHours = req.body.maxAgeHours || 24;
    const maxAgeMs = maxAgeHours * 3600 * 1000;
    const now = Date.now();
    let cleaned = 0;

    const cleanDir = (dir) => {
      if (!fs.existsSync(dir)) return;

      fs.readdirSync(dir).forEach(f => {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);

        if (now - stat.mtimeMs > maxAgeMs) {
          if (stat.isDirectory()) {
            fs.rmSync(fp, { recursive: true });
          } else {
            fs.unlinkSync(fp);
          }
          cleaned++;
        }
      });
    };

    cleanDir(UPLOAD_DIR);
    cleanDir(CLIPS_DIR);

    res.json({
      success: true,
      filesDeleted: cleaned,
      maxAgeHours
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ─── Utility Functions ─────────────────────────────────────

function findVideoFile(videoId) {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const match = files.find(f => f.startsWith(videoId));
    return match ? path.join(UPLOAD_DIR, match) : null;
  } catch (error) {
    return null;
  }
}

module.exports = router;
