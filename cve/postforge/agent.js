/**
 * PostForge Agent System
 * Each user gets a persistent AI marketing agent with memory
 */

const { Redis } = require('@upstash/redis');

var redis = null;
function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    });
  }
  return redis;
}

// ─── Agent Memory ───

async function getAgentMemory(email) {
  var db = getRedis();
  var raw = await db.get('agent:' + email);
  if (!raw) {
    return {
      email: email,
      business: {},
      contentHistory: [],
      performanceData: {},
      preferences: {},
      learnings: [],
      strategy: {},
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalPostsGenerated: 0,
      weekNumber: 0
    };
  }
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function saveAgentMemory(email, memory) {
  var db = getRedis();
  memory.lastActive = new Date().toISOString();
  await db.set('agent:' + email, JSON.stringify(memory));
}

// ─── Business Profile (Agent learns this) ───

async function updateBusinessProfile(email, profileData) {
  var memory = await getAgentMemory(email);
  memory.business = Object.assign(memory.business || {}, profileData);
  await saveAgentMemory(email, memory);
  return memory.business;
}

// ─── Content History (Agent remembers what it created) ───

async function logContent(email, posts, platform) {
  var memory = await getAgentMemory(email);
  if (!memory.contentHistory) memory.contentHistory = [];
  
  var entry = {
    date: new Date().toISOString(),
    platform: platform,
    posts: posts.map(function(p) {
      return {
        type: p.type,
        contentPreview: (p.content || '').substring(0, 150),
        platform: p.platform || platform,
        bestTime: p.best_time
      };
    }),
    count: posts.length
  };
  
  memory.contentHistory.unshift(entry);
  // Keep last 100 entries
  if (memory.contentHistory.length > 100) memory.contentHistory = memory.contentHistory.slice(0, 100);
  memory.totalPostsGenerated += posts.length;
  
  await saveAgentMemory(email, memory);
}

// ─── Agent Learning (What works for this business) ───

async function addLearning(email, learning) {
  var memory = await getAgentMemory(email);
  if (!memory.learnings) memory.learnings = [];
  
  memory.learnings.unshift({
    date: new Date().toISOString(),
    insight: learning
  });
  
  if (memory.learnings.length > 50) memory.learnings = memory.learnings.slice(0, 50);
  await saveAgentMemory(email, memory);
}

// ─── Content Queue (Agent's pending posts) ───

async function getQueue(email) {
  var db = getRedis();
  var raw = await db.get('queue:' + email);
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function addToQueue(email, posts) {
  var queue = await getQueue(email);
  posts.forEach(function(p) {
    queue.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      platform: p.platform,
      type: p.type,
      content: p.content,
      image: p.image_suggestion || '',
      scheduledTime: p.scheduledTime || null,
      bestTime: p.best_time || '',
      status: 'pending', // pending -> approved -> posted
      createdAt: new Date().toISOString()
    });
  });
  var db = getRedis();
  await db.set('queue:' + email, JSON.stringify(queue));
  return queue;
}

async function updateQueueItem(email, postId, updates) {
  var queue = await getQueue(email);
  var found = false;
  queue = queue.map(function(p) {
    if (p.id === postId) {
      found = true;
      return Object.assign(p, updates);
    }
    return p;
  });
  if (found) {
    var db = getRedis();
    await db.set('queue:' + email, JSON.stringify(queue));
  }
  return { success: found, queue: queue };
}

async function removeFromQueue(email, postId) {
  var queue = await getQueue(email);
  queue = queue.filter(function(p) { return p.id !== postId; });
  var db = getRedis();
  await db.set('queue:' + email, JSON.stringify(queue));
  return queue;
}

// ─── Weekly Strategy Report ───

function buildStrategyContext(memory) {
  var biz = memory.business || {};
  var history = memory.contentHistory || [];
  var learnings = memory.learnings || [];
  
  var context = '';
  context += 'BUSINESS: ' + (biz.name || 'Unknown') + '\n';
  context += 'INDUSTRY: ' + (biz.industry || 'Unknown') + '\n';
  context += 'SERVICES: ' + (biz.services || 'Unknown') + '\n';
  context += 'LOCATION: ' + (biz.location || 'Unknown') + '\n';
  context += 'VOICE: ' + (biz.voice || 'professional') + '\n';
  context += 'TOTAL POSTS CREATED: ' + (memory.totalPostsGenerated || 0) + '\n';
  
  if (history.length > 0) {
    context += '\nRECENT CONTENT (last 10 batches):\n';
    history.slice(0, 10).forEach(function(h) {
      context += '- ' + h.date.split('T')[0] + ': ' + h.count + ' posts for ' + h.platform + '\n';
      if (h.posts && h.posts[0]) {
        context += '  Types: ' + h.posts.map(function(p) { return p.type; }).join(', ') + '\n';
      }
    });
  }
  
  if (learnings.length > 0) {
    context += '\nAGENT LEARNINGS:\n';
    learnings.slice(0, 10).forEach(function(l) {
      context += '- ' + l.insight + '\n';
    });
  }
  
  if (biz.goal) context += '\nPRIMARY GOAL: ' + biz.goal + '\n';
  if (biz.competitors) context += 'COMPETITORS: ' + biz.competitors + '\n';
  if (biz.targetAudience) context += 'TARGET AUDIENCE: ' + biz.targetAudience + '\n';
  
  return context;
}

// ─── Agent Generate (Context-aware content generation) ───

function buildAgentPrompt(memory, platform, count, specialInstructions) {
  var context = buildStrategyContext(memory);
  var biz = memory.business || {};
  
  var now = new Date();
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  
  // Check what types we've done recently to avoid repetition
  var recentTypes = {};
  (memory.contentHistory || []).slice(0, 3).forEach(function(h) {
    (h.posts || []).forEach(function(p) {
      recentTypes[p.type] = (recentTypes[p.type] || 0) + 1;
    });
  });
  
  var avoidTypes = Object.keys(recentTypes).filter(function(t) { return recentTypes[t] >= 3; });

  return `You are this business's personal AI marketing agent. You KNOW this business. You've been working with them. You remember their past content and what works.

TODAY: ${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}

YOUR CLIENT'S BUSINESS PROFILE:
${context}

${avoidTypes.length ? 'AVOID these content types (overused recently): ' + avoidTypes.join(', ') : ''}
${specialInstructions ? 'SPECIAL INSTRUCTIONS FROM CLIENT: ' + specialInstructions : ''}

PLATFORM: ${platform}
POSTS NEEDED: ${count}

You are NOT a generic content generator. You are THIS business's dedicated marketing agent. You know their voice, their style, their location, their audience. Every post should feel like it was written by someone who deeply understands ${biz.name || 'this business'}.

RULES:
- Reference specific details about their business (services, location, past work)
- NEVER repeat content themes from recent history
- Vary content types: tips, showcases, engagement, testimonials, promos
- Sound HUMAN — contractions, personality, natural language
- First line of every post MUST stop the scroll
- Be specific to ${biz.location || 'their area'} — local references, neighborhoods, weather, culture
- Current season awareness: it's ${months[now.getMonth()]} — reference seasonal needs

PLATFORM-SPECIFIC:
${platform === 'instagram' ? '- Visual storytelling, line breaks, 15-25 hashtags, strong hook, 3-5 emojis naturally placed' : ''}
${platform === 'facebook' ? '- Conversational, community-focused, 2-4 hashtags, CTA, story-driven' : ''}
${platform === 'twitter' ? '- UNDER 280 CHARS. Punchy, witty, 1-2 hashtags max' : ''}
${platform === 'linkedin' ? '- Professional storytelling, vulnerability, lessons learned, 3-5 hashtags' : ''}
${platform === 'tiktok' ? '- Hook in first 3 words, ultra-casual, trending language, 3-5 hashtags' : ''}

OUTPUT (strict JSON array):
[
  {
    "id": 1,
    "platform": "${platform}",
    "type": "tip|showcase|engagement|testimonial|promo",
    "content": "Full post text with emojis and hashtags",
    "image_suggestion": "Ultra-specific image description for AI generation or photographer",
    "best_time": "e.g. Tuesday 6:30 PM"
  }
]

Return ONLY the JSON array.`;
}

module.exports = {
  getAgentMemory,
  saveAgentMemory,
  updateBusinessProfile,
  logContent,
  addLearning,
  getQueue,
  addToQueue,
  updateQueueItem,
  removeFromQueue,
  buildAgentPrompt,
  buildStrategyContext
};
