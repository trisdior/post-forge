/**
 * PostForge Processing Client
 * Example integration for the main PostForge app
 * 
 * Usage:
 *   const client = new ProcessingClient('http://localhost:4000', 'your-api-key');
 *   await client.processVideo(videoFile, { clipCount: 5 });
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ProcessingClient {
  constructor(serverUrl, apiKey) {
    this.serverUrl = serverUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: this.serverUrl,
      headers: {
        'x-api-key': apiKey
      },
      timeout: 60000
    });
  }

  /**
   * Complete pipeline: upload → transcribe → analyze → cut → download
   */
  async processVideo(videoPath, options = {}) {
    const {
      clipCount = 5,
      captionStyle = 'hormozi',
      quality = 'high',
      context = {},
      onProgress = null
    } = options;

    try {
      // Step 1: Upload
      this._log('Uploading video...');
      const uploadResult = await this.uploadVideo(videoPath);
      const videoId = uploadResult.videoId;
      this._progress(onProgress, 'upload', uploadResult);

      // Step 2: Transcribe
      this._log(`Transcribing (${uploadResult.duration}s video)...`);
      const transcriptResult = await this.transcribe(videoId, { model: 'base' });
      this._progress(onProgress, 'transcribe', transcriptResult);

      // Step 3: Analyze
      this._log('Finding viral moments with Claude...');
      const momentsResult = await this.analyze(videoId, {
        clipCount,
        context
      });
      this._progress(onProgress, 'analyze', momentsResult);

      // Step 4: Cut & Caption
      this._log(`Generating ${momentsResult.momentCount} clips...`);
      const cutResult = await this.cut(videoId, {
        captionStyle,
        quality
      });
      this._progress(onProgress, 'cut', cutResult);

      // Step 5: List clips
      const clipsResult = await this.listClips(videoId);

      return {
        success: true,
        videoId,
        clips: clipsResult.clips,
        momentCount: momentsResult.momentCount,
        clipsGenerated: cutResult.clipsGenerated,
        totalDuration: uploadResult.duration
      };
    } catch (error) {
      throw new Error(`Video processing failed: ${error.message}`);
    }
  }

  /**
   * Upload video file
   */
  async uploadVideo(videoPath, sessionId = null) {
    const form = new FormData();
    form.append('video', fs.createReadStream(videoPath));
    if (sessionId) form.append('sessionId', sessionId);

    try {
      const response = await this.client.post('/upload', form, {
        headers: form.getHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Upload failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Transcribe video
   */
  async transcribe(videoId, options = {}) {
    const { model = 'base', language = null } = options;

    try {
      const response = await this.client.post(`/transcribe/${videoId}`, {
        model,
        language
      });
      return response.data;
    } catch (error) {
      throw new Error(`Transcription failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Find viral moments
   */
  async analyze(videoId, options = {}) {
    const {
      clipCount = 5,
      minDuration = 15,
      maxDuration = 120,
      context = {}
    } = options;

    try {
      const response = await this.client.post(`/analyze/${videoId}`, {
        clipCount,
        minDuration,
        maxDuration,
        context
      });
      return response.data;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Cut clips with captions
   */
  async cut(videoId, options = {}) {
    const {
      captionStyle = 'hormozi',
      quality = 'high',
      width = 1080,
      height = 1920
    } = options;

    try {
      const response = await this.client.post(`/cut/${videoId}`, {
        captionStyle,
        quality,
        width,
        height
      });
      return response.data;
    } catch (error) {
      throw new Error(`Clipping failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Download a specific clip
   */
  async downloadClip(videoId, clipIndex, outputPath) {
    try {
      const response = await this.client.get(`/clip/${videoId}/${clipIndex}`, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        response.data.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(outputPath);
        });
        file.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Download failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Download all clips as a batch
   */
  async downloadAllClips(videoId, outputDir) {
    try {
      const listResult = await this.listClips(videoId);
      const downloaded = [];

      for (const clip of listResult.clips) {
        const filePath = `${outputDir}/clip_${clip.clipIndex}.mp4`;
        await this.downloadClip(videoId, clip.clipIndex, filePath);
        downloaded.push(filePath);
      }

      return downloaded;
    } catch (error) {
      throw new Error(`Batch download failed: ${error.message}`);
    }
  }

  /**
   * List all clips for a video
   */
  async listClips(videoId) {
    try {
      const response = await this.client.get(`/batch/${videoId}`);
      return response.data;
    } catch (error) {
      throw new Error(`List clips failed: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Check server health
   */
  async health() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Stream processing with progress tracking
   */
  async processVideoWithStream(videoPath, options = {}, onChunk = null) {
    const {
      clipCount = 5,
      context = {}
    } = options;

    const videoId = await this._uploadWithProgress(videoPath, onChunk);
    await this._transcribeWithStream(videoId, onChunk);
    await this._analyzeWithStream(videoId, { clipCount, context }, onChunk);
    const result = await this._cutWithStream(videoId, options, onChunk);

    return result;
  }

  // Private helpers
  _log(message) {
    console.log(`[ProcessingClient] ${message}`);
  }

  _progress(callback, stage, data) {
    if (callback) {
      callback({ stage, ...data });
    }
  }

  async _uploadWithProgress(videoPath, onChunk) {
    const form = new FormData();
    const file = fs.createReadStream(videoPath);
    form.append('video', file);

    return new Promise((resolve, reject) => {
      form.submit({ ...this._getHeaders(), path: '/upload' }, (err, res) => {
        if (err) reject(err);

        let data = '';
        res.on('data', chunk => {
          data += chunk;
          if (onChunk) onChunk({ stage: 'upload', chunk });
        });

        res.on('end', () => {
          const result = JSON.parse(data);
          resolve(result.videoId);
        });
      });
    });
  }

  async _transcribeWithStream(videoId, onChunk) {
    // Implement streaming transcription if needed
    const result = await this.transcribe(videoId);
    if (onChunk) onChunk({ stage: 'transcribe', result });
    return result;
  }

  async _analyzeWithStream(videoId, options, onChunk) {
    const result = await this.analyze(videoId, options);
    if (onChunk) onChunk({ stage: 'analyze', result });
    return result;
  }

  async _cutWithStream(videoId, options, onChunk) {
    const result = await this.cut(videoId, options);
    if (onChunk) onChunk({ stage: 'cut', result });
    return result;
  }

  _getHeaders() {
    return {
      'x-api-key': this.apiKey,
      host: new URL(this.serverUrl).host
    };
  }
}

// ─── Usage Examples ───

async function example1_BasicPipeline() {
  const client = new ProcessingClient('http://localhost:4000', 'your-api-key');

  try {
    // Process a video
    const result = await client.processVideo('./videos/sample.mp4', {
      clipCount: 5,
      captionStyle: 'hormozi',
      quality: 'high',
      context: {
        industry: 'fitness',
        audience: 'Gen Z',
        voice: 'energetic'
      }
    });

    console.log(`✅ Generated ${result.clips.length} clips!`);
    result.clips.forEach(clip => {
      console.log(`  📹 ${clip.filename} (${(clip.size / 1024 / 1024).toFixed(1)}MB)`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example2_DownloadAllClips() {
  const client = new ProcessingClient('http://localhost:4000', 'your-api-key');

  try {
    const files = await client.downloadAllClips('video-id-123', './output');
    console.log(`✅ Downloaded ${files.length} clips to ./output`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example3_ProgressTracking() {
  const client = new ProcessingClient('http://localhost:4000', 'your-api-key');

  const onProgress = (progress) => {
    console.log(`${progress.stage}: ${progress.success ? '✅' : '⏳'}`);
  };

  try {
    const result = await client.processVideo(
      './videos/sample.mp4',
      { clipCount: 5 },
      onProgress
    );

    console.log('✅ All done!', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function example4_HealthCheck() {
  const client = new ProcessingClient('http://localhost:4000', 'your-api-key');

  try {
    const health = await client.health();
    console.log('Server status:', health.environment);
  } catch (error) {
    console.error('❌ Server down:', error.message);
  }
}

// Export for use in main app
module.exports = ProcessingClient;

// Uncomment to run examples:
// example1_BasicPipeline();
