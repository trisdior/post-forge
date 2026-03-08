#!/usr/bin/env node
/**
 * PostForge AI — Backend Server
 * AI-powered social media content for small businesses
 * Uses Claude (Anthropic) for generation
 * Christopher Valencia Enterprises
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const app = express();
const PORT = 3004;

// Load env files
[path.join(__dirname, '.env.local'), path.join(__dirname, '..', '..', '.env')].forEach(function(envPath) {
  try {
    var envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(function(line) {
      if (line.startsWith('#') || !line.trim()) return;
      var eq = line.indexOf('=');
      if (eq > 0) {
        var key = line.substring(0, eq).trim();
        var val = line.substring(eq + 1).trim().replace(/^"|"$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  } catch(e) {}
});

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-3-haiku-20240307';

var auth = require('./auth');
var agent = require('./agent');
var clipEngine = require('./clip-engine');
var integrations = require('./integrations');

app.use(express.json());
app.use(express.static(__dirname));

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

const DATA_DIR = path.join(__dirname, 'data');
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch { return fallback; }
}
function writeJSON(file, data) {
  ensureDataDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── Claude API Call ───
function callClaude(prompt, maxTokens) {
  maxTokens = maxTokens || 4000;
  return new Promise(function(resolve, reject) {
    var postData = JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    var options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    var req = https.request(options, function(res) {
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try {
          var data = JSON.parse(body);
          if (data.content && data.content[0]) {
            resolve(data.content[0].text);
          } else {
            reject(new Error('Bad response: ' + body.substring(0, 200)));
          }
        } catch(e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, function() { req.destroy(); reject(new Error('Timeout')); });
    req.write(postData);
    req.end();
  });
}

// ─── Generate Content with Claude ───
async function generateWithClaude(businessName, businessType, location, platform, count, brandVoice) {
  count = count || 5;
  brandVoice = brandVoice || 'professional but approachable';

  var now = new Date();
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var currentMonth = months[now.getMonth()];
  var currentDay = days[now.getDay()];
  var currentYear = now.getFullYear();

  var prompt = `You are the world's best social media ghostwriter. You've managed accounts for brands doing $10M+/year. You know what stops the scroll, what gets saves, and what converts followers into customers.

You are writing for a REAL small business owner. Not a corporation. Not a faceless brand. A HUMAN who wakes up, goes to work, and cares deeply about what they do.

TODAY IS: ${currentDay}, ${currentMonth} ${now.getDate()}, ${currentYear}

BUSINESS PROFILE:
- Name: ${businessName}
- Services: ${businessType}
- Location: ${location || 'not specified'}
- Platform: ${platform}
- Voice: ${brandVoice}
- Posts needed: ${count}

═══════════════════════════════════
THE RULES THAT MAKE CONTENT INSANE
═══════════════════════════════════

1. HOOK OR DIE
The first line decides everything. If someone can scroll past your first line without feeling SOMETHING (curiosity, shock, recognition, desire), the post is dead.

Great hooks:
- Pattern interrupts: "I lost $12,000 on a job last year. Here's what I learned."
- Specificity: "The exact 3-step process we use for every kitchen demo"
- Controversy: "90% of contractors won't tell you this about permits"
- Relatability: "POV: The client says 'while you're at it, can you also...'"
- Numbers: "We've done 47 kitchens in ${location || 'this city'}. This one hit different."

Bad hooks (BANNED):
- "Are you looking for..." / "Looking for a..."
- "In today's fast-paced world..."
- "Thinking about renovating?"
- "We are proud to..." / "We're excited to..."
- "Here at [business name]..."
- Any hook that could apply to literally any business

2. WRITE LIKE A HUMAN, NOT A BRAND
- Use "I" and "we" naturally
- Use contractions (don't, won't, can't, we're)
- Include small imperfections — real people say "honestly" and "ngl"
- Reference SPECIFIC details: exact neighborhoods in ${location || 'the area'}, street names, local weather, local culture
- Sound like you're texting a friend who asked about your work, not writing a press release
- Vary sentence length. Short punches. Then a longer, flowing thought that draws the reader in and makes them feel something.

3. PLATFORM DNA — EACH PLATFORM IS A DIFFERENT LANGUAGE
${platform === 'instagram' ? `INSTAGRAM MASTERY:
- First line is EVERYTHING. Make it a scroll-stopper.
- Use line breaks between paragraphs (this is critical)
- 15-25 hashtags at the end, mix of popular (500K+ posts), medium (50K-500K), and niche (<50K)
- Carousel-worthy content: numbered lists, step-by-step, before/after
- Write like a creator, not a business. Personal stories > promotional.
- CTAs that feel natural: "Save this for later" > "Contact us today"
- 3-5 emojis, placed naturally, never clustered` : ''}
${platform === 'facebook' ? `FACEBOOK MASTERY:
- Longer, story-driven posts perform best (150-300 words)
- Ask questions that get comments (engagement = reach)
- Tag the location, reference the community
- 2-4 hashtags max, mixed into the post naturally
- Share a personal story or lesson, then connect to your service
- CTA should feel like a friend suggesting something, not a sales pitch
- 2-4 emojis, warm tone` : ''}
${platform === 'twitter' ? `X/TWITTER MASTERY:
- UNDER 280 CHARACTERS. This is non-negotiable.
- Be witty, insightful, or provocative
- Hot takes and opinions get engagement
- Thread-worthy ideas condensed into single punches
- 1-2 hashtags max, only if they add value
- No fluff. Every word earns its place.
- Tweets that make people quote-tweet > tweets that get likes` : ''}
${platform === 'linkedin' ? `LINKEDIN MASTERY:
- Professional storytelling. Share a real experience, extract a lesson.
- "I" stories with vulnerability perform 3x better
- Line breaks between every 1-2 sentences (LinkedIn algorithm rewards this)
- 3-5 hashtags at the end
- End with a question to drive comments
- Avoid corporate jargon. Write like a smart human, not a press release.
- 2-3 emojis max, professional ones only` : ''}
${platform === 'tiktok' ? `TIKTOK MASTERY:
- First 3 words = the hook. "POV:", "Nobody talks about", "The reason why"
- Write as a video script / caption combo
- Ultra-casual language. Gen Z / millennial energy.
- 3-5 hashtags, mix trending + niche
- Address the viewer: "you", "your"
- Controversy and hot takes DOMINATE
- 2-4 emojis, trendy ones` : ''}

4. CONTENT MIX (distribute across the ${count} posts):
- 30% VALUE/TIPS: Teach something specific. Not generic advice — insider knowledge.
- 20% SHOWCASE: Show your work with a story behind it. Not "here's a photo" — "here's WHY this matters."
- 20% ENGAGEMENT: Questions, polls, hot takes, "this or that" — content that begs for comments.
- 15% SOCIAL PROOF: Client wins, reviews, transformations — let results speak.
- 15% PROMOTIONAL: Seasonal offers, limited spots, urgency — but make it feel like an FYI, not a sales pitch.

5. TIME-AWARENESS
It's ${currentMonth} ${currentYear}. Reference:
- Current season and what that means for this industry
- Upcoming holidays or events
- Weather patterns for ${location || 'the area'}
- Seasonal needs customers have RIGHT NOW

6. IMAGE SUGGESTIONS MUST BE SPECIFIC
NOT: "Photo of kitchen" 
YES: "Close-up of freshly installed white quartz countertop catching morning light, with a steaming coffee mug placed on it. Shot from a low angle to emphasize the stone's veining. Warm, editorial style."

The image suggestion should be so specific that a photographer could recreate it exactly, or an AI image generator could nail it first try.

OUTPUT FORMAT (strict JSON array):
[
  {
    "id": 1,
    "platform": "${platform}",
    "type": "tip|showcase|engagement|testimonial|promo",
    "content": "The full post text exactly as it should be posted. Include emojis and hashtags in position.",
    "image_suggestion": "Ultra-specific, creative image description that could be given to an AI image generator or photographer",
    "best_time": "e.g. 'Tuesday 6:30 PM' or 'Saturday 10 AM' — be specific to day AND time"
  }
]

Return ONLY the JSON array. No commentary. No markdown. Just the raw JSON.`;

  var response = await callClaude(prompt);

  // Parse JSON from response
  var jsonMatch = response.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch(e) {
      console.error('[CLAUDE] JSON parse error:', e.message);
    }
  }

  // Fallback: return raw text as single post
  return [{ id: 1, type: 'general', content: response, image_suggestion: 'Business photo', best_time: 'Weekday morning' }];
}

// ─── Industry Presets ───
var INDUSTRY_PRESETS = {
  contractor: {
    hashtags: '#Construction #Renovation #Contractor #HomeImprovement #Remodel',
    contentMix: 'Before/after transformations, project spotlights, material tips, client testimonials, seasonal maintenance reminders, safety tips',
    audience: 'Homeowners aged 30-65 considering home improvements',
    voice: 'Knowledgeable, trustworthy, hardworking'
  },
  realtor: {
    hashtags: '#RealEstate #HomeBuying #Realtor #JustListed #OpenHouse',
    contentMix: 'New listings, market updates, home buying tips, neighborhood spotlights, client success stories, staging tips',
    audience: 'Home buyers, sellers, and investors aged 25-55',
    voice: 'Friendly, knowledgeable, local expert'
  },
  restaurant: {
    hashtags: '#FoodPorn #Restaurant #LocalEats #FoodLovers #Foodie',
    contentMix: 'Menu highlights, behind the scenes kitchen shots, staff spotlights, special offers, seasonal menu updates, customer reviews',
    audience: 'Local food lovers aged 21-50',
    voice: 'Warm, inviting, passionate about food'
  },
  salon: {
    hashtags: '#Hair #Beauty #Salon #HairTransformation #Stylist',
    contentMix: 'Before/after transformations, trend alerts, product recommendations, client reveals, styling tips, appointment availability',
    audience: 'Women aged 18-55 interested in hair and beauty',
    voice: 'Trendy, confident, glamorous but approachable'
  },
  fitness: {
    hashtags: '#Fitness #PersonalTrainer #Gym #Workout #FitnessMotivation',
    contentMix: 'Workout tips, client transformations, exercise demos, nutrition advice, motivation posts, class schedules',
    audience: 'Health-conscious adults aged 20-45',
    voice: 'Motivating, energetic, supportive'
  },
  auto: {
    hashtags: '#AutoRepair #CarMaintenance #Mechanic #Cars #AutoShop',
    contentMix: 'Maintenance tips, repair spotlights, seasonal car care, diagnostic explanations, customer reviews, under-the-hood education',
    audience: 'Car owners aged 25-60',
    voice: 'Straight-talking, trustworthy, knowledgeable'
  },
  photographer: {
    hashtags: '#Photography #Portrait #PhotoOfTheDay #Photographer',
    contentMix: 'Portfolio showcases, behind-the-scenes, editing tips, client sessions, gear talk, booking availability',
    audience: 'People needing professional photos (weddings, families, headshots)',
    voice: 'Creative, artistic, warm'
  },
  lawyer: {
    hashtags: '#Law #Attorney #LegalAdvice #Lawyer #LegalTips',
    contentMix: 'Legal tips, myth-busting, case study insights (anonymized), rights education, community involvement, firm news',
    audience: 'Adults needing legal guidance aged 25-65',
    voice: 'Authoritative, clear, approachable'
  },
  dentist: {
    hashtags: '#Dentist #DentalCare #Smile #OralHealth #DentalTips',
    contentMix: 'Oral hygiene tips, smile transformations, team introductions, patient reviews, myth-busting, office tour',
    audience: 'Families and adults needing dental care',
    voice: 'Friendly, reassuring, professional'
  },
  ecommerce: {
    hashtags: '#SmallBusiness #ShopSmall #Handmade #NewArrivals',
    contentMix: 'Product showcases, behind-the-scenes, customer photos, sales/promos, packaging reveals, founder story',
    audience: 'Online shoppers interested in your niche',
    voice: 'Authentic, passionate, community-focused'
  }
};

app.get('/api/industries', function(req, res) {
  res.json(Object.keys(INDUSTRY_PRESETS));
});

app.get('/api/industry/:type', function(req, res) {
  var preset = INDUSTRY_PRESETS[req.params.type];
  if (preset) res.json(preset);
  else res.status(404).json({ error: 'Industry not found' });
});

// ─── Auth Routes ───

app.post('/api/signup', async function(req, res) {
  try {
    var result = await auth.signup(req.body.email, req.body.password, req.body.businessName);
    console.log('[AUTH] Signup: ' + (req.body.email || 'no email') + ' → ' + (result.success ? 'OK' : result.error));
    res.json(result);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/login', async function(req, res) {
  try {
    var result = await auth.login(req.body.email, req.body.password);
    console.log('[AUTH] Login: ' + (req.body.email || 'no email') + ' → ' + (result.success ? 'OK' : result.error));
    res.json(result);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/me', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    res.json(user);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/usage', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var check = await auth.checkLimit(token);
    res.json(check);
  } catch(e) { res.status(500).json({ error: 'Server error' }); }
});

// ─── API Routes ───

// Generate posts (Claude-powered)
app.post('/api/generate', async function(req, res) {
  try {
    var body = req.body;
    var businessName = body.businessName || 'My Business';
    var businessType = body.businessType || 'home services';
    var location = body.location || '';
    var platform = body.platform || 'instagram';
    var count = Math.min(body.count || 3, 5); // cap at 5 per request for speed
    var brandVoice = body.brandVoice || 'professional but approachable';

    // Check auth + usage limits
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (token) {
      var check = await auth.checkLimit(token);
      if (!check.allowed) {
        return res.status(403).json({ success: false, error: check.reason, usage: check });
      }
    }

    console.log('[GENERATE] ' + businessName + ' | ' + platform + ' | ' + count + ' posts');

    var posts = await generateWithClaude(businessName, businessType, location, platform, count, brandVoice);

    // Add dates to posts
    var now = new Date();
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    posts.forEach(function(post, i) {
      var d = new Date(now);
      d.setDate(d.getDate() + i);
      post.date = d.toISOString().split('T')[0];
      post.day = days[d.getDay()];
      post.platform = platform;
      post.status = 'draft';
    });

    // Generate photos if requested
    if (body.withPhotos) {
      for (var i = 0; i < posts.length; i++) {
        var suggestion = posts[i].image_suggestion || posts[i].type + ' photo for ' + businessName;
        // Use pollinations.ai free API for AI image generation
        var encodedPrompt = encodeURIComponent('Professional social media photo: ' + suggestion + '. High quality, modern, clean.');
        posts[i].image_url = 'https://image.pollinations.ai/prompt/' + encodedPrompt + '?width=1080&height=1080&nologo=true';
      }
    }

    // Log generation (skip on read-only filesystem like Vercel)
    try {
      var log = readJSON('generated.json', []);
      log.push({
        businessName: businessName,
        businessType: businessType,
        platform: platform,
        count: posts.length,
        model: MODEL,
        timestamp: new Date().toISOString()
      });
      writeJSON('generated.json', log);
    } catch(e) {}

    // Track usage
    if (token) {
      await auth.trackUsage(token, posts.length);
      // Feed the agent — log content to memory
      try {
        var user = await auth.getUser(token);
        if (user && user.email) {
          await agent.logContent(user.email, posts, platform);
          // Auto-learn business profile from generation requests
          if (businessName !== 'My Business') {
            await agent.updateBusinessProfile(user.email, {
              name: businessName,
              services: businessType,
              location: location
            });
          }
        }
      } catch(ae) { console.error('[AGENT LOG]', ae.message); }
    }

    res.json({
      success: true,
      business: businessName,
      platform: platform,
      model: MODEL,
      posts: posts,
      generated_at: new Date().toISOString()
    });
  } catch(err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Quick demo (3 posts, lighter call)
app.post('/api/demo', async function(req, res) {
  try {
    var body = req.body;
    var posts = await generateWithClaude(
      body.businessName || 'My Business',
      body.businessType || 'home services',
      body.location || '',
      body.platform || 'instagram',
      3,
      'professional but approachable'
    );
    res.json({ success: true, posts: posts });
  } catch(err) {
    console.error('[DEMO ERROR]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Waitlist
app.post('/api/waitlist', function(req, res) {
  try {
    var waitlist = readJSON('waitlist.json', []);
    waitlist.push({
      email: req.body.email,
      business: req.body.business,
      plan: req.body.plan || 'free',
      timestamp: new Date().toISOString()
    });
    writeJSON('waitlist.json', waitlist);
    console.log('[WAITLIST] ' + req.body.email + ' (' + (req.body.business || 'no biz') + ')');
    res.json({ success: true, position: waitlist.length });
  } catch(e) { res.json({ success: true }); }
});

app.get('/api/stats', function(req, res) {
  try {
    var waitlist = readJSON('waitlist.json', []);
    var generated = readJSON('generated.json', []);
    res.json({
      waitlist: waitlist.length,
      generations: generated.length,
      total_posts: generated.reduce(function(s, g) { return s + (g.count || 0); }, 0),
      model: MODEL
    });
  } catch(e) { res.json({ waitlist: 0, generations: 0, total_posts: 0, model: MODEL }); }
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/app', function(req, res) {
  res.sendFile(path.join(__dirname, 'app.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ─── Integration Routes ───

app.get('/api/connections', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    var { Redis } = require('@upstash/redis');
    var redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    var connections = await integrations.getConnections(redis, user.email);
    // Return connected status without tokens
    var safe = {};
    Object.keys(connections).forEach(function(k) {
      safe[k] = { connected: true, connectedAt: connections[k].connected };
    });
    res.json(safe);
  } catch(e) { res.json({}); }
});

app.post('/api/schedule', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    var { Redis } = require('@upstash/redis');
    var redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    var post = await integrations.schedulePost(redis, user.email, {
      content: req.body.content,
      platform: req.body.platform,
      scheduledFor: req.body.scheduledFor,
      imageUrl: req.body.imageUrl || null
    });
    res.json({ success: true, post: post });
  } catch(e) { res.status(500).json({ error: 'Failed to schedule' }); }
});

app.get('/api/scheduled', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    var { Redis } = require('@upstash/redis');
    var redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
    var posts = await integrations.getScheduledPosts(redis, user.email);
    res.json(posts);
  } catch(e) { res.json([]); }
});

// ─── Content Repurposing ───
app.post('/api/repurpose', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (token) {
      var check = await auth.checkLimit(token);
      if (!check.allowed) return res.status(403).json({ success: false, error: check.reason });
    }

    var body = req.body;
    var sourceContent = body.content || '';
    var sourcePlatform = body.sourcePlatform || 'blog';
    var targetPlatforms = body.targetPlatforms || ['instagram', 'facebook', 'twitter', 'linkedin'];

    if (!sourceContent) return res.status(400).json({ error: 'Content required' });

    var prompt = `You are PostForge, a content repurposing AI. Take this ${sourcePlatform} content and create platform-specific versions for each target platform.

ORIGINAL CONTENT (from ${sourcePlatform}):
${sourceContent.substring(0, 3000)}

TARGET PLATFORMS: ${targetPlatforms.join(', ')}

For each platform, create a unique post that:
- Matches the platform's culture and format
- Instagram: visual storytelling, line breaks, 15-25 hashtags, hook first line
- Facebook: conversational, community-focused, 2-4 hashtags, CTA
- Twitter/X: under 280 chars, punchy, 1-3 hashtags
- LinkedIn: professional storytelling, lessons learned, 3-5 hashtags
- TikTok: hook in first 3 words, casual, 3-5 hashtags

OUTPUT FORMAT (strict JSON array):
[
  {
    "platform": "platform_name",
    "content": "The repurposed post text",
    "image_suggestion": "Image idea for this post",
    "character_count": 123
  }
]

Return ONLY the JSON array.`;

    var text = await callClaude(prompt, 3000);
    text = text.trim();
    var jsonMatch = text.match(/\[[\s\S]*\]/);
    var posts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    if (token) await auth.trackUsage(token, posts.length);

    res.json({ success: true, posts: posts, source: sourcePlatform, targets: targetPlatforms });
  } catch(err) {
    console.error('[REPURPOSE] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Hashtag Research ───
app.post('/api/hashtags', async function(req, res) {
  try {
    var body = req.body;
    var industry = body.industry || 'business';
    var location = body.location || '';
    var topic = body.topic || '';

    var prompt = `Generate 30 highly effective hashtags for a ${industry} business${location ? ' in ' + location : ''}.${topic ? ' Topic: ' + topic : ''}

Split into 3 categories:
1. HIGH REACH (10 hashtags): Popular hashtags with millions of posts - broad exposure
2. MEDIUM COMPETITION (10 hashtags): Niche but active hashtags - good engagement
3. LOW COMPETITION (10 hashtags): Specific/local hashtags - easy to rank

OUTPUT FORMAT (strict JSON):
{
  "high_reach": ["#hashtag1", "#hashtag2"],
  "medium": ["#hashtag1", "#hashtag2"],
  "low_competition": ["#hashtag1", "#hashtag2"],
  "recommended_set": ["#top15picks"]
}

Return ONLY JSON.`;

    var text = await callClaude(prompt, 1500);
    text = text.trim();
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    var hashtags = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json({ success: true, hashtags: hashtags });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Competitor Analysis ───
app.post('/api/analyze-competitor', async function(req, res) {
  try {
    var body = req.body;
    var competitorName = body.competitor || '';
    var industry = body.industry || '';
    var yourBusiness = body.yourBusiness || '';

    var prompt = `Analyze this competitor's likely social media strategy and give actionable advice:

COMPETITOR: ${competitorName}
INDUSTRY: ${industry}
YOUR BUSINESS: ${yourBusiness}

Provide:
1. What they likely post about (content pillars)
2. Their probable posting frequency
3. Weaknesses you can exploit
4. 5 specific post ideas that would outperform them
5. Hashtags they probably use vs what YOU should use

OUTPUT FORMAT (strict JSON):
{
  "content_pillars": ["pillar1", "pillar2"],
  "posting_frequency": "description",
  "weaknesses": ["weakness1", "weakness2"],
  "post_ideas": [{"idea": "description", "platform": "best_platform", "why": "reason"}],
  "their_hashtags": ["#tag1"],
  "your_hashtags": ["#tag1"],
  "strategy_summary": "One paragraph summary"
}

Return ONLY JSON.`;

    var text = await callClaude(prompt, 2000);
    text = text.trim();
    var jsonMatch = text.match(/\{[\s\S]*\}/);
    var analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    res.json({ success: true, analysis: analysis });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/platforms', function(req, res) {
  var platforms = {};
  Object.keys(integrations.PLATFORMS).forEach(function(k) {
    var p = integrations.PLATFORMS[k];
    platforms[k] = { name: p.name, scopes: p.scopes };
  });
  res.json(platforms);
});

app.get('/agent', function(req, res) {
  res.sendFile(__dirname + '/agent-dashboard.html');
});

app.get('/calendar', function(req, res) {
  res.sendFile(path.join(__dirname, 'calendar.html'));
});

app.get('/analytics', function(req, res) {
  res.sendFile(path.join(__dirname, 'analytics.html'));
});

app.get('/autopilot', function(req, res) {
  res.sendFile(path.join(__dirname, 'autopilot.html'));
});

app.get('/repurpose', function(req, res) {
  res.sendFile(path.join(__dirname, 'repurpose.html'));
});

app.get('/clips', function(req, res) {
  res.sendFile(path.join(__dirname, 'clips.html'));
});

app.get('/settings', function(req, res) {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/landing', function(req, res) {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// ─── Onboarding ───
app.get('/onboarding', function(req, res) {
  res.sendFile(path.join(__dirname, 'onboarding.html'));
});

app.post('/api/onboarding', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    var userData = await auth.getUser(token);
    if (!userData) return res.status(401).json({ error: 'Invalid token' });
    
    var body = req.body;
    userData.onboarding = {
      industry: body.industry || '',
      name: body.name || '',
      location: body.location || '',
      services: body.services || '',
      platforms: body.platforms || [],
      goal: body.goal || '',
      frequency: body.frequency || 'daily',
      completedAt: new Date().toISOString()
    };
    if (body.name) userData.businessName = body.name;
    await auth.saveUser(token, userData);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Admin Dashboard ───
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/stats', async function(req, res) {
  var adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'postforge2026') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    var users = await auth.getAllUsers();
    var totalUsers = users.length;
    var totalPosts = 0;
    var proUsers = 0;
    var usersWhoGenerated = 0;
    var recentUsers = [];
    
    users.forEach(function(u) {
      var posts = (u.usage && u.usage.posts_generated) || 0;
      totalPosts += posts;
      if (posts > 0) usersWhoGenerated++;
      if (u.plan === 'pro') proUsers++;
      recentUsers.push({
        email: u.email || 'unknown',
        plan: u.plan || 'free',
        posts: posts,
        created: u.created || new Date().toISOString()
      });
    });
    
    recentUsers.sort(function(a,b) { return new Date(b.created) - new Date(a.created); });
    recentUsers = recentUsers.slice(0, 20);
    
    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers,
        totalPosts: totalPosts,
        proUsers: proUsers,
        usersWhoGenerated: usersWhoGenerated,
        mrr: proUsers * 9,
        activeToday: usersWhoGenerated,
        recentUsers: recentUsers,
        apiCallsToday: totalPosts,
        avgResponseTime: 2400
      }
    });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ─── Share Preview (viral loop) ───
app.get('/share/:id', function(req, res) {
  res.send(`<!DOCTYPE html><html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta property="og:title" content="Check out this post I made with PostForge">
<meta property="og:description" content="AI-powered social media content that sounds human. Try it free.">
<meta property="og:image" content="https://postforge-nu.vercel.app/og-image.png">
<meta property="og:url" content="https://postforge-nu.vercel.app/share/${req.params.id}">
<meta name="twitter:card" content="summary_large_image">
<title>PostForge — AI Content</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#f0f0f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.card{max-width:500px;background:#16161f;border:1px solid #1e1e2e;border-radius:20px;padding:32px;text-align:center}
h1{font-size:24px;font-weight:900;margin-bottom:8px}p{color:#8888a0;font-size:14px;margin-bottom:24px}
.btn{display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;font-size:15px;font-weight:700;text-decoration:none;transition:all 0.3s}
.btn:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(124,58,237,0.4)}
</style></head><body>
<div class="card"><h1>Made with PostForge ⚡</h1><p>AI-powered content that sounds like you wrote it. Not like a robot.</p><a class="btn" href="/">Try PostForge Free →</a></div>
</body></html>`);
});

// ─── AGENT SYSTEM ───

// Get agent status + memory
app.get('/api/agent', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var memory = await agent.getAgentMemory(user.email);
    var queue = await agent.getQueue(user.email);
    
    res.json({
      success: true,
      agent: {
        business: memory.business,
        totalPosts: memory.totalPostsGenerated,
        queueSize: queue.length,
        pendingApproval: queue.filter(function(p) { return p.status === 'pending'; }).length,
        approved: queue.filter(function(p) { return p.status === 'approved'; }).length,
        lastActive: memory.lastActive,
        weekNumber: memory.weekNumber,
        learnings: (memory.learnings || []).slice(0, 5),
        recentContent: (memory.contentHistory || []).slice(0, 5)
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Update agent's business knowledge
app.post('/api/agent/teach', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var body = req.body;
    var profile = await agent.updateBusinessProfile(user.email, {
      name: body.name || undefined,
      industry: body.industry || undefined,
      services: body.services || undefined,
      location: body.location || undefined,
      voice: body.voice || undefined,
      goal: body.goal || undefined,
      competitors: body.competitors || undefined,
      targetAudience: body.targetAudience || undefined,
      uniqueValue: body.uniqueValue || undefined,
      pastWork: body.pastWork || undefined
    });
    
    res.json({ success: true, business: profile });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Agent generates content (context-aware)
app.post('/api/agent/generate', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var check = await auth.checkLimit(token);
    if (!check.allowed) return res.status(403).json({ error: check.reason });
    
    var body = req.body;
    var memory = await agent.getAgentMemory(user.email);
    
    // If business profile is empty, use request data to populate it
    if (!memory.business.name && body.businessName) {
      await agent.updateBusinessProfile(user.email, {
        name: body.businessName,
        services: body.businessType,
        location: body.location,
        industry: body.industry
      });
      memory = await agent.getAgentMemory(user.email);
    }
    
    var platform = body.platform || 'instagram';
    var count = Math.min(body.count || 5, 7);
    
    var prompt = agent.buildAgentPrompt(memory, platform, count, body.specialInstructions || '');
    var response = await callClaude(prompt, 4000);
    
    var jsonMatch = response.match(/\[[\s\S]*\]/);
    var posts = [];
    if (jsonMatch) {
      try { posts = JSON.parse(jsonMatch[0]); } catch(e) {
        posts = [{ id: 1, type: 'general', content: response, platform: platform, image_suggestion: '', best_time: '' }];
      }
    }
    
    // Log to agent memory
    await agent.logContent(user.email, posts, platform);
    await auth.trackUsage(token, posts.length);
    
    // Auto-add to queue
    if (body.addToQueue) {
      await agent.addToQueue(user.email, posts);
    }
    
    res.json({ success: true, posts: posts, platform: platform, agentMemory: { totalPosts: memory.totalPostsGenerated + posts.length } });
  } catch(e) {
    console.error('[AGENT GENERATE] Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Get agent's content queue
app.get('/api/agent/queue', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var queue = await agent.getQueue(user.email);
    res.json({ success: true, queue: queue });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Approve/reject queue items
app.post('/api/agent/queue/:id/approve', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var result = await agent.updateQueueItem(user.email, req.params.id, { status: 'approved', approvedAt: new Date().toISOString() });
    res.json({ success: result.success });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agent/queue/:id/reject', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var queue = await agent.removeFromQueue(user.email, req.params.id);
    res.json({ success: true, remaining: queue.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Agent weekly strategy report
app.get('/api/agent/report', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var memory = await agent.getAgentMemory(user.email);
    var context = agent.buildStrategyContext(memory);
    
    var prompt = `You are this business's AI marketing agent. Generate a weekly strategy report.

${context}

Create a brief, actionable weekly report with:
1. Content performance summary (what types worked best based on the content mix)
2. Top 3 recommendations for next week
3. Trending topics in their industry to capitalize on
4. One bold content idea they haven't tried yet

OUTPUT FORMAT (strict JSON):
{
  "summary": "One paragraph overview of this week",
  "topPerforming": "What content type is likely performing best and why",
  "recommendations": ["rec1", "rec2", "rec3"],
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "boldIdea": {"title": "Idea name", "description": "What to do and why it would work"},
  "nextWeekPlan": "Brief plan for next week's content strategy"
}

Return ONLY JSON.`;

    var response = await callClaude(prompt, 2000);
    var jsonMatch = response.match(/\{[\s\S]*\}/);
    var report = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    res.json({ success: true, report: report, business: memory.business });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Teach agent from feedback
app.post('/api/agent/feedback', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var body = req.body;
    if (body.learning) {
      await agent.addLearning(user.email, body.learning);
    }
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CLIP ENGINE API ───

var PROCESSING_SERVER = process.env.PROCESSING_SERVER_URL || 'http://localhost:4000';
var PROCESSING_KEY = process.env.PROCESSING_API_KEY || 'pf-process-key-change-me';

// Analyze video transcript and find viral moments
app.post('/api/clips/analyze', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    var check = await auth.checkLimit(token);
    if (!check.allowed) return res.status(403).json({ error: check.reason });
    
    var body = req.body;
    var transcript = body.transcript;
    if (!transcript || transcript.length < 50) {
      return res.status(400).json({ error: 'Transcript too short. Upload a video first.' });
    }
    
    var result = await clipEngine.processVideo(
      user.email,
      body.videoId || 'manual',
      transcript,
      {
        clipCount: Math.min(body.clipCount || 3, 5),
        captionStyle: body.captionStyle || 'hormozi',
        platforms: body.platforms || ['tiktok', 'instagram', 'youtube']
      },
      callClaude
    );
    
    if (result.success) {
      await auth.trackUsage(token, result.totalClips);
    }
    
    res.json(result);
  } catch(e) {
    console.error('[CLIPS ANALYZE]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Proxy upload to processing server
app.post('/api/clips/upload', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    // Forward to processing server
    // The client should upload directly to the processing server for large files
    // This endpoint provides the upload URL and auth
    res.json({
      success: true,
      uploadUrl: PROCESSING_SERVER + '/upload',
      apiKey: PROCESSING_KEY,
      maxSize: '500MB',
      supportedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Get transcription from processing server
app.post('/api/clips/transcribe', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    var videoId = req.body.videoId;
    if (!videoId) return res.status(400).json({ error: 'videoId required' });
    
    // Call processing server
    var response = await fetch(PROCESSING_SERVER + '/transcribe/' + videoId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PROCESSING_KEY },
      body: JSON.stringify({ model: 'base' })
    });
    
    var data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: 'Processing server unavailable. Is it running?' });
  }
});

// Process clips (cut + caption) on processing server
app.post('/api/clips/process', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    var body = req.body;
    
    var response = await fetch(PROCESSING_SERVER + '/process/' + body.videoId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': PROCESSING_KEY },
      body: JSON.stringify({
        clips: body.clips,
        commands: body.commands,
        captionStyle: body.captionStyle || 'hormozi'
      })
    });
    
    var data = await response.json();
    
    // Add clips to agent queue if requested
    if (data.success && body.addToQueue && data.results) {
      var posts = data.results.filter(function(r) { return r.success; }).map(function(r, i) {
        var clip = (body.clips || [])[i] || {};
        return {
          platform: 'tiktok',
          type: clip.content_type || 'clip',
          content: (clip.captions && clip.captions.tiktok) || clip.hook || 'Video clip',
          image_suggestion: 'Video clip ' + (i + 1),
          best_time: clip.best_time || '',
          videoClip: true,
          clipUrl: PROCESSING_SERVER + '/clip/' + body.videoId + '/' + i + '?key=' + PROCESSING_KEY
        };
      });
      await agent.addToQueue(user.email, posts);
    }
    
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: 'Processing server unavailable' });
  }
});

// Get available caption styles
app.get('/api/clips/styles', function(req, res) {
  res.json({
    styles: [
      { id: 'hormozi', name: 'Hormozi Bold', description: 'Large centered text, key words highlighted, all caps. The viral standard.', preview: 'BOLD · CENTERED · YELLOW HIGHLIGHTS' },
      { id: 'minimal', name: 'Clean Minimal', description: 'Subtle white text at the bottom. Professional and clean.', preview: 'Clean white text, bottom positioned' },
      { id: 'karaoke', name: 'Word Highlight', description: 'Words light up as spoken. Keeps viewers reading along.', preview: 'Word-by-word color highlight' },
      { id: 'bold', name: 'Impact', description: 'Massive text, 2-3 words per frame. Maximum scroll-stop.', preview: 'HUGE · IMPACT · TEXT' }
    ]
  });
});

// Agent analytics data
app.get('/api/agent/analytics', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    var memory = await agent.getAgentMemory(user.email);
    var queue = await agent.getQueue(user.email);
    var history = memory.contentHistory || [];
    
    // Build analytics from real data
    var platformBreakdown = {};
    var typeBreakdown = {};
    var dailyCounts = {};
    
    history.forEach(function(h) {
      var day = (h.date || '').split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + (h.count || 0);
      (h.posts || []).forEach(function(p) {
        var plat = p.platform || h.platform || 'unknown';
        platformBreakdown[plat] = (platformBreakdown[plat] || 0) + 1;
        typeBreakdown[p.type || 'general'] = (typeBreakdown[p.type || 'general'] || 0) + 1;
      });
    });
    
    res.json({
      success: true,
      analytics: {
        totalPosts: memory.totalPostsGenerated || 0,
        queueSize: queue.length,
        pendingApproval: queue.filter(function(q) { return q.status === 'pending'; }).length,
        approved: queue.filter(function(q) { return q.status === 'approved'; }).length,
        platformBreakdown: platformBreakdown,
        typeBreakdown: typeBreakdown,
        dailyCounts: dailyCounts,
        recentHistory: history.slice(0, 20),
        learnings: (memory.learnings || []).length,
        businessProfile: memory.business || {}
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── STRIPE PAYMENTS ───

var PLANS = {
  growth: { name: 'Growth', price: 1900, postsPerMonth: 50, platforms: 5 },
  pro: { name: 'Pro', price: 4900, postsPerMonth: 150, platforms: 5 },
  business: { name: 'Business', price: 9900, postsPerMonth: 500, platforms: 5 }
};

// Create checkout session
app.post('/api/checkout', async function(req, res) {
  try {
    var stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(503).json({ error: 'Payments not configured yet. Coming soon!' });
    
    var stripe = require('stripe')(stripeKey);
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    var plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });
    
    var session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'PostForge ' + plan.name, description: plan.postsPerMonth + ' AI posts/month across ' + plan.platforms + ' platforms' },
          unit_amount: plan.price,
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      mode: 'subscription',
      success_url: (process.env.BASE_URL || 'https://postforge-nu.vercel.app') + '/agent?checkout=success',
      cancel_url: (process.env.BASE_URL || 'https://postforge-nu.vercel.app') + '/agent?checkout=cancelled',
      client_reference_id: user.email,
      metadata: { plan: req.body.plan, email: user.email }
    });
    
    res.json({ success: true, url: session.url });
  } catch(e) {
    console.error('[STRIPE]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Stripe webhook
app.post('/api/webhook/stripe', async function(req, res) {
  try {
    var stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(200).send('OK');
    
    var event = req.body;
    
    if (event.type === 'checkout.session.completed') {
      var session = event.data.object;
      var email = session.client_reference_id || (session.metadata && session.metadata.email);
      var plan = session.metadata && session.metadata.plan;
      
      if (email && plan) {
        // Update user plan in Redis
        var db = require('@upstash/redis').Redis.fromEnv ? require('@upstash/redis').Redis.fromEnv() : null;
        if (db) {
          await db.set('plan:' + email, JSON.stringify({
            plan: plan,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            activatedAt: new Date().toISOString()
          }));
        }
        console.log('[STRIPE] Activated ' + plan + ' for ' + email);
      }
    }
    
    res.status(200).send('OK');
  } catch(e) {
    console.error('[WEBHOOK]', e.message);
    res.status(200).send('OK');
  }
});

// Get user's plan
app.get('/api/plan', async function(req, res) {
  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    var user = await auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Login required' });
    
    var db = getRedis();
    var raw = await db.get('plan:' + user.email);
    if (!raw) return res.json({ plan: 'free', postsPerMonth: 10, platforms: 1 });
    
    var planData = typeof raw === 'string' ? JSON.parse(raw) : raw;
    var limits = PLANS[planData.plan] || { postsPerMonth: 5, platforms: 1 };
    
    res.json({
      plan: planData.plan,
      postsPerMonth: limits.postsPerMonth,
      platforms: limits.platforms,
      activatedAt: planData.activatedAt
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Helper for Stripe routes to get Redis
function getRedis() {
  var Redis = require('@upstash/redis').Redis;
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  });
}

// ─── Initialize Social Media API Routes ───
try {
  var setupSocialRoutes = require('./api/routes');
  var redis = getRedis();
  setupSocialRoutes(app, redis);
} catch(e) {
  console.warn('[SOCIAL] Failed to initialize social routes:', e.message);
}

// ─── Initialize API Key Management ───
try {
  var apiKeyAuth = require('./middleware/apiKeyAuth');
  var rateLimitApi = require('./middleware/rateLimitApi');
  
  // Add API key auth and rate limiting middleware for all /api/v1/* routes
  app.use(apiKeyAuth);
  app.use(rateLimitApi);
  
  // Setup API key routes
  var setupKeyRoutes = require('./api/keys');
  setupKeyRoutes(app);
  
  console.log('[API] API Key management initialized');
} catch(e) {
  console.warn('[API] Failed to initialize API key management:', e.message);
}

// Serve API Keys dashboard
app.get('/api-keys', function(req, res) {
  res.sendFile(path.join(__dirname, 'api-keys.html'));
});

app.get('/favicon.svg', function(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.get('/terms', function(req, res) {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/privacy', function(req, res) {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.listen(PORT, function() {
  var ip = getLocalIP();
  console.log('');
  console.log('==================================================');
  console.log('  PostForge AI — Live');
  console.log('  Powered by Claude (' + MODEL + ')');
  console.log('  Christopher Valencia Enterprises');
  console.log('==================================================');
  console.log('  Desktop: http://localhost:' + PORT);
  console.log('  Phone:   http://' + ip + ':' + PORT);
  console.log('  API Key: ' + (ANTHROPIC_KEY ? 'loaded' : 'MISSING'));
  console.log('==================================================');
});
