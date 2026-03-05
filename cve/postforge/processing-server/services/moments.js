/**
 * Viral Moments Service
 * Uses Claude API to identify hook-worthy segments from transcript
 */

const axios = require('axios');

class MomentsService {
  /**
   * Analyze transcript and find viral moments
   * Returns array of {start, end, hook, confidence, type}
   */
  static async findViralMoments(transcript, segments = [], options = {}) {
    const {
      clipCount = 5,                     // How many clips to find
      minDuration = 15,                  // Min seconds per clip
      maxDuration = 120,                 // Max seconds per clip
      context = {}                       // Business context (industry, audience, etc.)
    } = options;

    if (!transcript || !transcript.trim()) {
      throw new Error('Empty transcript');
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
      throw new Error('No API key configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)');
    }

    // Build the analysis prompt
    const prompt = this.buildAnalysisPrompt(
      transcript,
      segments,
      clipCount,
      minDuration,
      maxDuration,
      context
    );

    try {
      const response = await this.callClaudeAPI(prompt);
      const moments = this.parseViralMoments(response, segments);
      return moments;
    } catch (error) {
      throw new Error(`Viral moment detection failed: ${error.message}`);
    }
  }

  /**
   * Build the Claude prompt for moment detection
   */
  static buildAnalysisPrompt(transcript, segments, clipCount, minDur, maxDur, context) {
    const businessContext = `
BUSINESS CONTEXT:
- Industry: ${context.industry || 'General'}
- Target Audience: ${context.audience || 'General'}
- Brand Voice: ${context.voice || 'Professional'}
- Key Message: ${context.keyMessage || 'N/A'}
`.trim();

    const transctiptWithTimings = this.formatTranscriptWithTimings(transcript, segments);

    return `You are a viral video strategist and content expert. Analyze this transcript and find the ${clipCount} most hook-worthy segments that would perform best on TikTok, Instagram Reels, and YouTube Shorts.

${businessContext}

VIDEO TRANSCRIPT:
${transctiptWithTimings}

REQUIREMENTS:
1. Find exactly ${clipCount} viral moments
2. Each clip must be between ${minDur} and ${maxDur} seconds
3. The first 2-3 seconds MUST contain a hook (question, bold claim, surprising stat, visual reveal)
4. Each moment should be distinct and non-overlapping
5. Prioritize content that:
   - Stops the scroll immediately
   - Tells a complete story or makes a point
   - Has pattern breaks or surprising reversals
   - Creates curiosity/desire to learn more
   - Matches the brand voice and audience

RESPOND IN JSON FORMAT (no markdown, just raw JSON):
{
  "moments": [
    {
      "clipIndex": 1,
      "startTime": "0:05",
      "endTime": "0:45",
      "startSeconds": 5,
      "endSeconds": 45,
      "hook": "Opening hook line that stops the scroll",
      "fullCaption": "The full text caption for this clip (can be multiple sentences)",
      "type": "hook|story|advice|pattern-break|surprise|social-proof",
      "confidence": 0.95,
      "reasoning": "Why this moment will go viral"
    },
    ...more moments...
  ]
}

Return ONLY the JSON, no explanation.`;
  }

  /**
   * Format transcript with timings for Claude to reference
   */
  static formatTranscriptWithTimings(fullTranscript, segments) {
    if (segments && segments.length > 0) {
      return segments
        .map(seg => {
          const time = this.formatTime(seg.start);
          return `[${time}] ${seg.text}`;
        })
        .join('\n');
    }
    return fullTranscript;
  }

  /**
   * Call Claude API (Anthropic)
   */
  static async callClaudeAPI(prompt) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.data?.content?.[0]?.text) {
        return response.data.content[0].text;
      }

      throw new Error('Invalid API response structure');
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limited by Claude API - try again in a few seconds');
      }
      throw error;
    }
  }

  /**
   * Parse Claude's JSON response into moment objects
   */
  static parseViralMoments(responseText, segments = []) {
    try {
      // Extract JSON from response (Claude might add extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const data = JSON.parse(jsonMatch[0]);
      if (!data.moments || !Array.isArray(data.moments)) {
        throw new Error('Invalid response structure');
      }

      // Enrich moments with segment data
      return data.moments.map(moment => {
        const startSec = this.timeToSeconds(moment.startTime || moment.startSeconds);
        const endSec = this.timeToSeconds(moment.endTime || moment.endSeconds);

        // Find matching segments for this moment
        const relevantSegments = segments.filter(seg =>
          seg.start >= startSec && seg.end <= endSec
        );

        return {
          ...moment,
          startSeconds: startSec,
          endSeconds: endSec,
          duration: endSec - startSec,
          segmentCount: relevantSegments.length,
          confidence: moment.confidence || 0.8
        };
      });
    } catch (error) {
      throw new Error(`Failed to parse viral moments: ${error.message}`);
    }
  }

  /**
   * Time string conversion helpers
   */
  static timeToSeconds(timeStr) {
    if (typeof timeStr === 'number') return timeStr;
    if (!timeStr) return 0;

    const parts = String(timeStr).split(':').map(x => parseInt(x) || 0);
    
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else {
      return parts[0];
    }
  }

  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Fallback: Simple keyword-based moment detection (if API fails)
   * Looks for keywords that indicate viral moments
   */
  static async findMomentsFallback(transcript, segments = [], clipCount = 5) {
    const viralKeywords = [
      'wait',
      'actually',
      'here\s+is',
      'biggest mistake',
      'most important',
      'you\s+need',
      'never',
      'always',
      'shocking',
      'unbelievable',
      'plot twist',
      'but then',
      'turned out',
      'secret',
      'hack',
      'trick',
      'simple'
    ];

    const moments = [];
    const pattern = new RegExp(`\\b(${viralKeywords.join('|')})\\b`, 'gi');

    segments.forEach((seg, idx) => {
      if (pattern.test(seg.text)) {
        const startIdx = Math.max(0, idx - 1);
        const endIdx = Math.min(segments.length - 1, idx + 3);

        const moment = {
          startSeconds: segments[startIdx].start,
          endSeconds: segments[endIdx].end,
          hook: seg.text.substring(0, 50) + '...',
          fullCaption: segments
            .slice(startIdx, endIdx + 1)
            .map(s => s.text)
            .join(' '),
          type: 'keyword-detected',
          confidence: 0.6
        };

        moments.push(moment);
      }
    });

    // Sort by confidence and return top N
    return moments.sort((a, b) => b.confidence - a.confidence).slice(0, clipCount);
  }
}

module.exports = MomentsService;
