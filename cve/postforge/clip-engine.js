/**
 * PostForge Clip Engine
 * Upload raw video → Transcribe → Find viral moments → Cut → Caption → Queue
 * 
 * Dependencies (on processing server):
 * - ffmpeg (system install)
 * - whisper / whisper.cpp (for transcription)
 * 
 * For Vercel: this module handles the AI logic (moment detection, agent context)
 * The actual video processing happens on the processing server via API calls
 */

const agent = require('./agent');

// ─── Viral Moment Detection ───

function buildClipPrompt(transcript, agentMemory, options) {
  var biz = (agentMemory && agentMemory.business) || {};
  var learnings = (agentMemory && agentMemory.learnings) || [];
  var history = (agentMemory && agentMemory.contentHistory) || [];
  
  // Analyze what content types have performed for this business
  var typePerformance = {};
  history.forEach(function(h) {
    (h.posts || []).forEach(function(p) {
      typePerformance[p.type] = (typePerformance[p.type] || 0) + 1;
    });
  });
  
  var topTypes = Object.keys(typePerformance).sort(function(a, b) {
    return typePerformance[b] - typePerformance[a];
  }).slice(0, 3);

  return `You are a viral content strategist and video editor AI. You work for ${biz.name || 'a business'} in ${biz.location || 'the US'}.

BUSINESS CONTEXT:
- Industry: ${biz.industry || 'general'}
- Services: ${biz.services || 'various'}
- Target audience: ${biz.targetAudience || 'general consumers'}
- Brand voice: ${biz.voice || 'professional'}
${topTypes.length ? '- Content that works best for them: ' + topTypes.join(', ') : ''}
${learnings.length ? '- Agent learnings: ' + learnings.slice(0, 5).map(function(l) { return l.insight; }).join('; ') : ''}

VIDEO TRANSCRIPT (with timestamps):
${transcript}

TASK: Find the ${options.clipCount || 3} most viral-worthy segments from this transcript.

VIRAL CONTENT RULES:
1. HOOK IN FIRST 2 SECONDS — The opening line must stop the scroll. Questions, bold claims, surprising facts, or visual reveals.
2. EMOTIONAL ARC — Even in 30 seconds, there needs to be setup → tension → payoff.
3. COMPLETE THOUGHT — Each clip must make sense standalone. Don't cut mid-sentence or mid-thought.
4. OPTIMAL LENGTH — 15-45 seconds for TikTok/Reels, up to 60 seconds for YouTube Shorts.
5. SPECIFICITY WINS — "We saved this homeowner $12,000" beats "We save people money."
6. PATTERN INTERRUPT — Moments where something unexpected happens, a reveal, a transformation, a hot take.

WHAT GOES VIRAL FOR ${biz.industry || 'businesses'}:
- Before/after reveals
- "Nobody tells you this" insights
- Price breakdowns ("Here's what a $30K kitchen actually includes")
- Mistakes to avoid
- Process videos (satisfying work being done)
- Customer reactions
- Hot takes / controversial opinions about the industry

For each clip, provide:
1. Start and end timestamps
2. Why this segment will perform (specific reasoning)
3. A rewritten hook (the first line, optimized for scroll-stopping)
4. Suggested caption for each platform (TikTok, Instagram, YouTube)
5. Hashtags
6. Best posting time

OUTPUT (strict JSON array):
[
  {
    "clip_number": 1,
    "start_time": "0:42",
    "end_time": "1:15",
    "duration_seconds": 33,
    "original_text": "The exact words spoken in this segment",
    "hook": "Rewritten scroll-stopping first line",
    "why_viral": "Specific reasoning why this will perform",
    "captions": {
      "tiktok": "Caption optimized for TikTok with hashtags",
      "instagram": "Caption optimized for Instagram Reels",
      "youtube": "Title + description for YouTube Shorts"
    },
    "hashtags": ["tag1", "tag2", "tag3"],
    "content_type": "reveal|tip|story|reaction|process|hottake",
    "estimated_engagement": "high|medium",
    "best_time": "Tuesday 6:30 PM"
  }
]

Return ONLY the JSON array. Pick only genuinely viral-worthy moments. If the video only has 1-2 good moments, return fewer clips. Quality over quantity.`;
}

// ─── Caption Style Generator ───

function buildCaptionStylePrompt(transcript, style) {
  var styles = {
    hormozi: {
      name: 'Alex Hormozi',
      desc: 'Bold, centered, 3-4 words per line, key words highlighted in yellow, all caps for emphasis'
    },
    minimal: {
      name: 'Minimal',
      desc: 'Clean white text, bottom third, full sentences, subtle shadow'
    },
    karaoke: {
      name: 'Karaoke',
      desc: 'Word-by-word highlight as spoken, centered, white text with active word in color'
    },
    bold: {
      name: 'Bold Impact',
      desc: 'Large impact font, centered, 2-3 words max per frame, high contrast colors'
    }
  };

  var selected = styles[style] || styles.hormozi;

  return {
    style: selected.name,
    description: selected.desc,
    // These get passed to the processing server for FFmpeg caption rendering
    config: {
      hormozi: {
        fontFamily: 'Impact',
        fontSize: 72,
        fontColor: '#FFFFFF',
        highlightColor: '#FFD700',
        position: 'center',
        maxWordsPerLine: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backgroundPadding: 10,
        allCaps: true
      },
      minimal: {
        fontFamily: 'Inter',
        fontSize: 48,
        fontColor: '#FFFFFF',
        position: 'bottom',
        maxWordsPerLine: 10,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.8)'
      },
      karaoke: {
        fontFamily: 'Inter Bold',
        fontSize: 64,
        fontColor: '#FFFFFF',
        highlightColor: '#7C3AED',
        position: 'center',
        maxWordsPerLine: 5,
        wordByWord: true
      },
      bold: {
        fontFamily: 'Impact',
        fontSize: 96,
        fontColor: '#FFFFFF',
        position: 'center',
        maxWordsPerLine: 3,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backgroundPadding: 16
      }
    }[style || 'hormozi']
  };
}

// ─── Timestamp Parser ───

function parseTimestamp(ts) {
  // Handles "0:42", "1:15", "00:01:30", "42"
  if (!ts) return 0;
  ts = ts.toString().trim();
  var parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function formatTimestamp(seconds) {
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// ─── Processing Server API ───

// This generates the FFmpeg commands that the processing server will run
function generateFFmpegCommands(videoPath, clips, captionStyle, outputDir) {
  var commands = [];
  var style = buildCaptionStylePrompt(null, captionStyle);
  
  clips.forEach(function(clip, i) {
    var startSec = parseTimestamp(clip.start_time);
    var endSec = parseTimestamp(clip.end_time);
    var duration = endSec - startSec;
    var outputFile = outputDir + '/clip_' + (i + 1) + '.mp4';
    
    // Base cut + crop to 9:16 vertical
    var filterComplex = [];
    
    // Scale and crop to 9:16 (1080x1920)
    filterComplex.push("scale=1080:1920:force_original_aspect_ratio=increase");
    filterComplex.push("crop=1080:1920");
    
    // Add caption overlay using drawtext
    var cfg = style.config;
    if (cfg && clip.original_text) {
      // Break text into lines
      var words = clip.original_text.split(' ');
      var maxWords = cfg.maxWordsPerLine || 4;
      var lines = [];
      for (var w = 0; w < words.length; w += maxWords) {
        lines.push(words.slice(w, w + maxWords).join(' '));
      }
      
      // For simple drawtext caption (processing server can do fancier stuff)
      var captionText = cfg.allCaps ? lines.join('\\n').toUpperCase() : lines.join('\\n');
      var yPos = cfg.position === 'bottom' ? 'h-th-100' : '(h-th)/2';
      
      filterComplex.push(
        "drawtext=text='" + captionText.replace(/'/g, "\\'") + "'" +
        ":fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" +
        ":fontsize=" + (cfg.fontSize || 64) +
        ":fontcolor=" + (cfg.fontColor || '#FFFFFF') +
        ":x=(w-tw)/2:y=" + yPos +
        (cfg.shadow ? ":shadowcolor=" + (cfg.shadowColor || 'black') + ":shadowx=2:shadowy=2" : "") +
        (cfg.backgroundColor ? ":box=1:boxcolor=" + cfg.backgroundColor + ":boxborderw=" + (cfg.backgroundPadding || 10) : "")
      );
    }
    
    var cmd = {
      command: 'ffmpeg',
      args: [
        '-ss', startSec.toString(),
        '-i', videoPath,
        '-t', duration.toString(),
        '-vf', filterComplex.join(','),
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        outputFile
      ],
      outputFile: outputFile,
      clipIndex: i,
      duration: duration
    };
    
    commands.push(cmd);
  });
  
  return commands;
}

// ─── Whisper Transcription Config ───

function getWhisperConfig(videoPath) {
  return {
    // Extract audio first
    extractAudio: {
      command: 'ffmpeg',
      args: ['-i', videoPath, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', videoPath + '.wav']
    },
    // Run whisper
    transcribe: {
      command: 'whisper',
      args: [videoPath + '.wav', '--model', 'base', '--output_format', 'json', '--word_timestamps', 'True'],
      // Alternative: use whisper API
      apiEndpoint: '/api/transcribe',
      apiBody: { audio_path: videoPath + '.wav', model: 'base', word_timestamps: true }
    }
  };
}

// ─── Process Video (Main orchestrator) ───

async function processVideo(email, videoId, transcript, options, callAI) {
  options = options || {};
  
  // Get agent memory for personalized clip detection
  var memory = await agent.getAgentMemory(email);
  
  // Build the clip detection prompt
  var prompt = buildClipPrompt(transcript, memory, {
    clipCount: options.clipCount || 3,
    platforms: options.platforms || ['tiktok', 'instagram', 'youtube']
  });
  
  // Call AI (Claude or Grok) to find viral moments
  var response = await callAI(prompt, 4000);
  
  // Parse clips
  var jsonMatch = response.match(/\[[\s\S]*\]/);
  var clips = [];
  if (jsonMatch) {
    try { clips = JSON.parse(jsonMatch[0]); } catch(e) {
      console.error('[CLIP ENGINE] Parse error:', e.message);
      return { success: false, error: 'Failed to analyze video' };
    }
  }
  
  if (!clips.length) {
    return { success: false, error: 'No viral-worthy moments found in this video' };
  }
  
  // Generate FFmpeg commands for the processing server
  var commands = generateFFmpegCommands(
    '/tmp/uploads/' + videoId,
    clips,
    options.captionStyle || 'hormozi',
    '/tmp/clips/' + videoId
  );
  
  // Log to agent memory
  await agent.addLearning(email, 'Processed video with ' + clips.length + ' clips detected. Types: ' + clips.map(function(c) { return c.content_type; }).join(', '));
  
  return {
    success: true,
    videoId: videoId,
    clips: clips,
    commands: commands, // Send these to the processing server
    captionStyle: options.captionStyle || 'hormozi',
    totalClips: clips.length
  };
}

module.exports = {
  processVideo,
  buildClipPrompt,
  buildCaptionStylePrompt,
  generateFFmpegCommands,
  getWhisperConfig,
  parseTimestamp,
  formatTimestamp
};
