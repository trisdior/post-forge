/**
 * FFmpeg Service
 * Handles video cutting, encoding, caption overlay, and export
 */

const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class FFmpegService {
  /**
   * Extract audio from video at 16kHz mono (for Whisper)
   */
  static async extractAudio(inputPath, outputPath) {
    const cmd = `ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 -y "${outputPath}"`;
    try {
      await this.runCommand(cmd, 60000); // 1 min timeout
      return outputPath;
    } catch (error) {
      throw new Error(`Audio extraction failed: ${error.message}`);
    }
  }

  /**
   * Get video metadata (duration, resolution, codec)
   */
  static async getMetadata(videoPath) {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=duration,width,height,codec_name,bit_rate,r_frame_rate -show_entries format=duration -of json "${videoPath}"`;
    try {
      const { stdout } = await execPromise(cmd);
      const data = JSON.parse(stdout);
      
      const stream = data.streams && data.streams[0];
      const format = data.format || {};
      
      return {
        duration: parseFloat(format.duration) || 0,
        width: stream?.width || 0,
        height: stream?.height || 0,
        codec: stream?.codec_name || 'unknown',
        bitrate: stream?.bit_rate || 0,
        fps: this.parseFPS(stream?.r_frame_rate)
      };
    } catch (error) {
      throw new Error(`Metadata extraction failed: ${error.message}`);
    }
  }

  /**
   * Cut a clip from video with optional caption overlay
   * Returns path to output MP4
   */
  static async cutClip(inputPath, outputPath, options = {}) {
    const {
      startTime = 0,      // seconds
      duration = 10,      // seconds
      width = 1080,
      height = 1920,
      captionText = '',   // optional burned-in caption
      captionStyle = 'hormozi',
      preset = 'medium'   // fast, medium, slow
    } = options;

    // Validate times
    const start = Math.max(0, startTime);
    const dur = Math.max(0.5, duration);

    let filterComplex = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;

    // Add caption if provided
    if (captionText && captionText.trim()) {
      const styledCaption = this.getStyledCaption(captionText, captionStyle, width, height);
      filterComplex += `,${styledCaption}`;
    }

    const cmd = [
      'ffmpeg',
      '-ss', start.toString(),
      '-i', inputPath,
      '-t', dur.toString(),
      '-vf', filterComplex,
      '-c:v', 'libx264',
      '-preset', preset,
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputPath
    ];

    try {
      await this.runCommand(cmd.join(' '), 120000); // 2 min timeout
      return outputPath;
    } catch (error) {
      throw new Error(`Clip cutting failed: ${error.message}`);
    }
  }

  /**
   * Generate FFmpeg drawtext filter for caption styling
   */
  static getStyledCaption(text, style = 'hormozi', width = 1080, height = 1920) {
    // Escape special chars for FFmpeg
    const escaped = text.replace(/'/g, "\\'").replace(/\"/g, '\\"').replace(/:/g, '\\:');

    switch (style) {
      case 'hormozi':
        // Bold white text, bottom center, thick outline
        return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${escaped}':fontsize=${Math.floor(width / 15)}:fontcolor=white:x=(w-text_w)/2:y=h-${Math.floor(height * 0.15)}:borderw=4:bordercolor=black:line_spacing=10`;

      case 'minimal':
        // Clean sans-serif, subtle
        return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='${escaped}':fontsize=${Math.floor(width / 18)}:fontcolor=white:x=(w-text_w)/2:y=h-${Math.floor(height * 0.2)}:borderw=2:bordercolor=black@0.5`;

      case 'karaoke':
        // Yellow text with shadow effect
        return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${escaped}':fontsize=${Math.floor(width / 16)}:fontcolor=yellow:x=(w-text_w)/2:y=h-${Math.floor(height * 0.15)}:shadowx=3:shadowy=3:shadowcolor=black:line_spacing=10`;

      case 'impact':
        // Large serif with strong outline
        return `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf:text='${escaped}':fontsize=${Math.floor(width / 12)}:fontcolor=white:x=(w-text_w)/2:y=h-${Math.floor(height * 0.18)}:borderw=5:bordercolor=black:line_spacing=12`;

      default:
        return `drawtext=text='${escaped}':fontsize=${Math.floor(width / 15)}:fontcolor=white:x=(w-text_w)/2:y=h-${Math.floor(height * 0.15)}`;
    }
  }

  /**
   * Run FFmpeg command with timeout and error handling
   */
  static async runCommand(cmd, timeoutMs = 120000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`FFmpeg timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      exec(cmd, (error, stdout, stderr) => {
        clearTimeout(timeout);
        if (error) {
          reject(new Error(`FFmpeg error: ${stderr || error.message}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Parse FPS from r_frame_rate (e.g., "30000/1001" → 29.97)
   */
  static parseFPS(rFrameRate) {
    if (!rFrameRate) return 30;
    const parts = rFrameRate.split('/');
    if (parts.length === 2) {
      return parseInt(parts[0]) / parseInt(parts[1]);
    }
    return parseInt(rFrameRate) || 30;
  }

  /**
   * Validate video file is processable
   */
  static async validateVideo(videoPath) {
    if (!fs.existsSync(videoPath)) {
      throw new Error('Video file not found');
    }

    const stats = fs.statSync(videoPath);
    if (stats.size > 1024 * 1024 * 1024) { // 1GB
      throw new Error('Video file too large (max 1GB)');
    }

    try {
      const metadata = await this.getMetadata(videoPath);
      if (metadata.duration < 2) {
        throw new Error('Video too short (min 2 seconds)');
      }
      return metadata;
    } catch (error) {
      throw new Error(`Invalid video file: ${error.message}`);
    }
  }
}

module.exports = FFmpegService;
