const fs = require('fs');
const f = 'C:\\Users\\trisd\\clawd\\second-brain-app\\data\\ideas.json';
const ideas = JSON.parse(fs.readFileSync(f));
const now = new Date().toISOString();

ideas.push(
  {
    id: 31,
    title: 'Renovation Calculator — Lead Gen Tool',
    category: 'valencia',
    content: 'Free web tool: homeowner enters project details, gets instant cost estimate, Valencia captures the lead. Step-by-step form with cost breakdown. Double duty: lead gen for Valencia AND demo product for AI Agency.',
    status: 'in-progress',
    priority: 'high',
    tags: ['leadgen', 'tool', 'website', 'valencia', 'calculator'],
    createdAt: now,
    updatedAt: now
  },
  {
    id: 32,
    title: 'X Articles — 3 Ready to Publish',
    category: 'content',
    content: '3 monetized X Articles:\n1. "I\'m 20 and I Built AI Employees That Run My Business 24/7"\n2. "How to Build a Faceless YouTube Channel That Makes Money While You Sleep"\n3. "What It\'s Really Like to Own a Construction Company at 20"\nEach 2,000-3,500 words. Ready for X Premium.',
    status: 'in-progress',
    priority: 'high',
    tags: ['x', 'twitter', 'articles', 'content', 'monetization'],
    createdAt: now,
    updatedAt: now
  },
  {
    id: 33,
    title: 'Aura Check TikTok Marketing — Alexa Trigger',
    category: 'content',
    content: 'Say "Alexa" in TikTok video which triggers viewers\' Alexa devices in comments. Pair with "Alexa, what\'s my aura?" and cut to app results. Instant engagement + rage shares = millions of views.',
    status: 'planned',
    priority: 'high',
    tags: ['tiktok', 'marketing', 'viral', 'aura-check'],
    createdAt: now,
    updatedAt: now
  }
);

fs.writeFileSync(f, JSON.stringify(ideas, null, 2));
console.log('done - ' + ideas.length + ' ideas total');
