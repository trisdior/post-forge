// Advanced Clipping Routes
// Integrates all 7 advanced features

const express = require('express');
const router = express.Router();
const AdvancedClippingEngine = require('./advanced-clipping');
const engine = new AdvancedClippingEngine();

// POST /api/v1/advanced/batch
// Upload 1 video → Get 20+ clips with variations
router.post('/api/v1/advanced/batch', async (req, res) => {
  try {
    const { videoPath, transcript, clipCount = 20 } = req.body;
    
    console.log(`[BATCH] Processing: ${clipCount} clips from video`);
    const clips = await engine.batchProcess(videoPath, transcript, clipCount);
    
    res.json({
      success: true,
      totalClips: clips.length,
      totalVariations: clips.length * engine.lengths.length * engine.captionStyles.length,
      clips
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/advanced/lengths
// Generate 15s, 30s, 60s versions of same moment
router.post('/api/v1/advanced/lengths', async (req, res) => {
  try {
    const { videoPath, moment } = req.body;
    
    console.log(`[LENGTHS] Generating: 15s, 30s, 60s versions`);
    const variations = await engine.generateMultipleLengths(videoPath, moment);
    
    res.json({
      success: true,
      variations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/advanced/styles
// Apply all 4 caption styles to clips
router.post('/api/v1/advanced/styles', async (req, res) => {
  try {
    const { clips, moment } = req.body;
    
    console.log(`[STYLES] Applying: Hormozi, Minimal, Karaoke, Impact`);
    const styled = await engine.applyStyles(clips, moment);
    
    res.json({
      success: true,
      totalVariations: styled.length,
      styles: engine.captionStyles,
      clips: styled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/advanced/audio-analysis
// Detect peaks, energy spikes, best moments
router.post('/api/v1/advanced/audio-analysis', async (req, res) => {
  try {
    const { audioPath } = req.body;
    
    console.log(`[AUDIO] Analyzing: peaks, energy, spikes`);
    const peaks = await engine.analyzeAudio(audioPath);
    
    res.json({
      success: true,
      peaksFound: peaks.length,
      peaks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/advanced/smart-crop
// AI detects faces/action, suggests best crop
router.post('/api/v1/advanced/smart-crop', async (req, res) => {
  try {
    const { videoPath, startTime, endTime } = req.body;
    
    console.log(`[CROP] Smart crop: detecting subjects`);
    const crop = await engine.smartCrop(videoPath, startTime, endTime);
    
    res.json({
      success: true,
      crop,
      recommendation: 'Centered on primary speaker'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/advanced/branding
// Apply logo, colors, fonts to clips
router.post('/api/v1/advanced/branding', async (req, res) => {
  try {
    const { clipPath, brand } = req.body;
    
    console.log(`[BRANDING] Applying: ${brand.name}`);
    const branded = await engine.applyBrandingTemplate(clipPath, brand);
    
    res.json({
      success: true,
      clipPath: branded,
      applied: ['logo', 'colors', 'fonts']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/advanced/trends
// What's trending in user's niche
router.get('/api/v1/advanced/trends', async (req, res) => {
  try {
    console.log(`[TRENDS] Detecting trending formats & topics`);
    const trends = await engine.detectTrends();
    
    res.json({
      success: true,
      trends,
      recommendation: `Post at ${trends.bestTimes[0]} for max engagement`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/advanced/status
// Health check + feature availability
router.get('/api/v1/advanced/status', (req, res) => {
  res.json({
    status: 'ready',
    features: {
      multipleLengths: '✅',
      batchProcessing: '✅',
      styleVariations: '✅',
      audioAnalysis: '⏳ (in progress)',
      smartCropping: '⏳ (in progress)',
      brandingTemplates: '⏳ (in progress)',
      trendDetection: '✅'
    }
  });
});

module.exports = router;
