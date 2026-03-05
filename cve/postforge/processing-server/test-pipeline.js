/**
 * Test Pipeline Script
 * Demonstrates the complete video processing workflow
 * 
 * Usage:
 *   node test-pipeline.js /path/to/video.mp4
 *   
 * Or with environment:
 *   PROCESSING_SERVER=http://localhost:4000 \
 *   PROCESSING_API_KEY=your-key \
 *   node test-pipeline.js video.mp4
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const SERVER_URL = process.env.PROCESSING_SERVER || 'http://localhost:4000';
const API_KEY = process.env.PROCESSING_API_KEY || 'pf-process-key-dev';
const VIDEO_PATH = process.argv[2];
const OUTPUT_DIR = './test-output';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const client = axios.create({
  baseURL: SERVER_URL,
  headers: { 'x-api-key': API_KEY },
  timeout: 600000
});

// ─── Test Functions ───

async function testHealth() {
  console.log('\n🏥 Testing health endpoint...');
  try {
    const res = await client.get('/health');
    console.log('✅ Server is healthy');
    console.log(`   FFmpeg: ${res.data.environment.ffmpegAvailable ? '✅' : '❌'}`);
    console.log(`   Whisper: ${res.data.environment.whisperAvailable ? '✅' : '❌'}`);
    console.log(`   Anthropic API: ${res.data.environment.apiKeys.anthropic ? '✅' : '❌'}`);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testUpload(videoPath) {
  console.log('\n📤 Uploading video...');
  try {
    const form = new FormData();
    form.append('video', fs.createReadStream(videoPath));

    const res = await client.post('/upload', form, {
      headers: form.getHeaders()
    });

    console.log('✅ Upload successful');
    console.log(`   Video ID: ${res.data.videoId}`);
    console.log(`   Duration: ${res.data.duration}s`);
    console.log(`   Size: ${(res.data.size / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Resolution: ${res.data.width}x${res.data.height}`);

    return res.data.videoId;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function testTranscribe(videoId) {
  console.log('\n📝 Transcribing video...');
  console.log('   (This may take a few minutes depending on video length)');

  try {
    const res = await client.post(`/transcribe/${videoId}`, {
      model: 'base',
      language: 'en'
    });

    console.log('✅ Transcription successful');
    console.log(`   Language: ${res.data.language}`);
    console.log(`   Segments: ${res.data.segmentCount}`);
    console.log(`   Preview: ${res.data.text.substring(0, 100)}...`);

    // Save transcript
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'transcript.json'),
      JSON.stringify(res.data, null, 2)
    );

    return res.data;
  } catch (error) {
    console.error('❌ Transcription failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function testAnalyze(videoId) {
  console.log('\n🎬 Analyzing for viral moments...');
  console.log('   (Using Claude AI to detect hooks)');

  try {
    const res = await client.post(`/analyze/${videoId}`, {
      clipCount: 3,
      minDuration: 15,
      maxDuration: 120,
      context: {
        industry: 'education',
        audience: 'students',
        voice: 'casual'
      }
    });

    console.log('✅ Analysis complete');
    console.log(`   Moments found: ${res.data.momentCount}`);

    res.data.moments.forEach((moment, idx) => {
      const duration = (moment.endSeconds - moment.startSeconds).toFixed(1);
      console.log(`   ${idx + 1}. ${moment.hook}`);
      console.log(`      Type: ${moment.type} | Duration: ${duration}s | Confidence: ${(moment.confidence * 100).toFixed(0)}%`);
    });

    // Save moments
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'moments.json'),
      JSON.stringify(res.data.moments, null, 2)
    );

    return res.data.moments;
  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function testCut(videoId) {
  console.log('\n✂️  Cutting clips with captions...');
  console.log('   (This may take a few minutes)');

  try {
    const res = await client.post(`/cut/${videoId}`, {
      captionStyle: 'hormozi',
      quality: 'medium',
      width: 1080,
      height: 1920
    });

    console.log('✅ Clips generated');
    console.log(`   Successful: ${res.data.clipsGenerated}/${res.data.totalMoments}`);
    console.log(`   Failed: ${res.data.clipsFailed}`);

    res.data.results.forEach(result => {
      if (result.success) {
        console.log(`   ✅ ${result.filename} (${(result.size / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        console.log(`   ❌ Clip ${result.clipIndex}: ${result.error}`);
      }
    });

    // Save results
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'cut-results.json'),
      JSON.stringify(res.data, null, 2)
    );

    return res.data;
  } catch (error) {
    console.error('❌ Cutting failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function testDownload(videoId) {
  console.log('\n⬇️  Downloading clips...');

  try {
    const listRes = await client.get(`/batch/${videoId}`);
    console.log(`   Found ${listRes.data.clips.length} clips`);

    for (const clip of listRes.data.clips) {
      try {
        const res = await client.get(`/clip/${videoId}/${clip.clipIndex}`, {
          responseType: 'stream'
        });

        const filename = `clip_${clip.clipIndex}.mp4`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const file = fs.createWriteStream(filepath);

        await new Promise((resolve, reject) => {
          res.data.pipe(file);
          file.on('finish', resolve);
          file.on('error', reject);
        });

        const stat = fs.statSync(filepath);
        console.log(`   ✅ ${filename} (${(stat.size / 1024 / 1024).toFixed(1)}MB)`);
      } catch (error) {
        console.error(`   ❌ Failed to download clip ${clip.clipIndex}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Download failed:', error.response?.data?.error || error.message);
  }
}

async function testCleanup() {
  console.log('\n🧹 Testing cleanup...');

  try {
    const res = await client.post('/cleanup', {
      maxAgeHours: 0  // Clean everything for testing
    });

    console.log('✅ Cleanup complete');
    console.log(`   Files deleted: ${res.data.filesDeleted}`);
  } catch (error) {
    console.error('⚠️  Cleanup failed:', error.message);
  }
}

// ─── Main Test Runner ───

async function runTests() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   PostForge Processing Pipeline Test      ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\nServer: ${SERVER_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  try {
    // Health check
    const healthy = await testHealth();
    if (!healthy) {
      console.error('\n❌ Server is not healthy. Make sure it\'s running:');
      console.error('   docker-compose up -d');
      process.exit(1);
    }

    // Validate video
    if (!VIDEO_PATH) {
      console.error('\n❌ No video file provided');
      console.error('Usage: node test-pipeline.js /path/to/video.mp4');
      process.exit(1);
    }

    if (!fs.existsSync(VIDEO_PATH)) {
      console.error(`\n❌ Video file not found: ${VIDEO_PATH}`);
      process.exit(1);
    }

    // Run pipeline
    const videoId = await testUpload(VIDEO_PATH);
    const transcript = await testTranscribe(videoId);
    const moments = await testAnalyze(videoId);
    const cutResults = await testCut(videoId);
    await testDownload(videoId);

    // Summary
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║         ✅ All Tests Passed!              ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\nResults saved to: ${OUTPUT_DIR}`);
    console.log(`  - transcript.json`);
    console.log(`  - moments.json`);
    console.log(`  - cut-results.json`);
    console.log(`  - clip_*.mp4 files`);

    process.exit(0);
  } catch (error) {
    console.error('\n\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run
runTests();
