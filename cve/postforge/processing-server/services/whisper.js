/**
 * Whisper Transcription Service
 * Converts audio to SRT with word-level timestamps
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class WhisperService {
  /**
   * Transcribe audio file using Whisper
   * Returns structured transcript with segments and word-level timings
   */
  static async transcribe(audioPath, options = {}) {
    const {
      model = 'base',                    // tiny, base, small, medium, large
      outputDir = '/tmp/whisper-out',
      language = null,                   // auto-detect if null
      wordTimestamps = true
    } = options;

    // Validate model
    const validModels = ['tiny', 'base', 'small', 'medium', 'large'];
    if (!validModels.includes(model)) {
      throw new Error(`Invalid Whisper model: ${model}`);
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error('Audio file not found');
    }

    // Ensure output dir exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Build whisper command
    let cmd = `whisper "${audioPath}" --model ${model} --output_format json`;
    if (language) cmd += ` --language ${language}`;
    if (wordTimestamps) cmd += ' --word_level_timings';
    cmd += ` --output_dir "${outputDir}"`;

    try {
      // Run with timeout (varies by model size)
      const timeoutMs = model === 'large' ? 600000 : 300000; // 10min / 5min
      const { stdout, stderr } = await this.runCommand(cmd, timeoutMs);

      // Read generated JSON file
      const baseFileName = path.basename(audioPath, path.extname(audioPath));
      const jsonFile = path.join(outputDir, baseFileName + '.json');

      if (!fs.existsSync(jsonFile)) {
        throw new Error('Whisper did not produce output file');
      }

      const rawOutput = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

      // Parse and structure the output
      const transcript = this.parseTranscript(rawOutput);

      return {
        success: true,
        language: rawOutput.language,
        duration: rawOutput.duration || 0,
        text: transcript.fullText,
        segments: transcript.segments,
        words: transcript.words,
        srt: this.generateSRT(transcript.segments)
      };
    } catch (error) {
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Parse Whisper JSON output into structured format
   */
  static parseTranscript(whisperOutput) {
    const segments = whisperOutput.segments || [];
    const words = [];
    let fullText = '';

    segments.forEach((segment, segIdx) => {
      if (fullText && !fullText.endsWith(' ')) fullText += ' ';
      fullText += segment.text.trim();

      // Extract word-level timings if available
      if (segment.words) {
        segment.words.forEach(word => {
          words.push({
            text: word.word,
            start: word.start,
            end: word.end,
            segmentIndex: segIdx
          });
        });
      }
    });

    return {
      fullText: fullText.trim(),
      segments: segments.map(seg => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
        avg_logprob: seg.avg_logprob,
        compression_ratio: seg.compression_ratio,
        no_speech_prob: seg.no_speech_prob
      })),
      words
    };
  }

  /**
   * Generate SRT subtitle format from segments
   */
  static generateSRT(segments) {
    return segments
      .map((seg, idx) => {
        const startTime = this.secondsToSRTTime(seg.start);
        const endTime = this.secondsToSRTTime(seg.end);
        return `${idx + 1}\n${startTime} --> ${endTime}\n${seg.text}\n`;
      })
      .join('\n');
  }

  /**
   * Convert seconds to SRT timestamp format (HH:MM:SS,mmm)
   */
  static secondsToSRTTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    const pad = (n, size = 2) => String(n).padStart(size, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
  }

  /**
   * Run whisper with timeout and retry logic
   */
  static async runCommand(cmd, timeoutMs = 300000, retries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Whisper timeout after ${timeoutMs}ms`));
          }, timeoutMs);

          exec(cmd, (error, stdout, stderr) => {
            clearTimeout(timeout);
            if (error) {
              reject(new Error(stderr || error.message));
            } else {
              resolve({ stdout, stderr });
            }
          });
        });
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Search for speaker changes (voice characteristics)
   * Useful for identifying when different people are speaking
   */
  static findSpeakerChanges(segments) {
    const changes = [];
    let lastProb = null;

    segments.forEach((seg, idx) => {
      const prob = seg.no_speech_prob || 0;
      
      // If speech probability changes significantly, might be speaker change
      if (lastProb !== null && Math.abs(prob - lastProb) > 0.2) {
        changes.push({
          index: idx,
          time: seg.start,
          confidence: 1 - prob
        });
      }
      lastProb = prob;
    });

    return changes;
  }
}

module.exports = WhisperService;
