require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
const upload = multer({ storage: multer.memoryStorage() });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const AURA_COLORS = [
  { name: 'Violet Flame', color: '#8b5cf6', energy: 'Transcendent' },
  { name: 'Crystal Azure', color: '#06b6d4', energy: 'Intuitive' },
  { name: 'Solar Gold', color: '#f59e0b', energy: 'Radiant' },
  { name: 'Rose Quartz', color: '#ec4899', energy: 'Nurturing' },
  { name: 'Emerald Pulse', color: '#10b981', energy: 'Harmonizing' },
  { name: 'Phoenix Red', color: '#ef4444', energy: 'Dynamic' },
  { name: 'Amber Blaze', color: '#f97316', energy: 'Creative' },
  { name: 'Celestial Blue', color: '#3b82f6', energy: 'Sovereign' },
];

const ARCHETYPES = [
  'The Visionary', 'The Sovereign', 'The Mystic', 'The Alchemist',
  'The Healer', 'The Warrior', 'The Muse', 'The Oracle',
];

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const roastMode = req.body.roastMode === 'true';
    
    // Convert buffer to base64
    const base64 = req.file.buffer.toString('base64');
    
    console.log('📸 Analyzing image:', req.file.originalname, 'Size:', req.file.size, 'bytes');

    // Detect media type from file or mimetype
    let mediaType = req.file.mimetype;
    if (!mediaType || !mediaType.startsWith('image/')) {
      // Fallback based on extension
      const ext = req.file.originalname.toLowerCase().split('.').pop();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      mediaType = mimeTypes[ext] || 'image/jpeg';
    }
    console.log('📷 Media type:', mediaType);

    // Call Claude Vision
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: `You are an expert facial analyst. Analyze this person's face with BRUTAL HONESTY. Be specific about what you see.

Return ONLY valid JSON (no markdown, no extra text):

{
  "observation": "age range (teens/20s/30s/etc), ethnicity/coloring hint, face shape (round/oval/square/long), distinctive features, overall first impression",
  "jawline": <5.0-10.0>,
  "symmetry": <5.0-10.0>,
  "eyes": <5.0-10.0>,
  "skinClarity": <5.0-10.0>,
  "boneStructure": <5.0-10.0>,
  "harmony": <5.0-10.0>,
  "celebrityMatch": "specific celebrity with detailed reason (compare jawline, cheekbones, eye shape, nose, face shape)",
  "auraColor": "vibe/color - can be unique, not limited to presets",
  "description": "2-3 sentence personalized aura reading based on what you actually see"
}

CRITICAL SCORING GUIDELINES:
- 5.0-5.9: Below average (soft/undefined, noticeable flaws)
- 6.0-6.9: Average (decent but unremarkable, normal variation)
- 7.0-7.9: Above average (good definition, solid structure, noticeable positives)
- 8.0-8.9: Excellent (very attractive, strong features, rare quality)
- 9.0-10.0: Exceptional (standout beauty, extremely rare)

JAWLINE: How sharp/defined/angular is it? Soft = lower, chiseled = higher
SYMMETRY: Perfect match = 10, noticeable differences = lower
EYES: Striking clarity? Good shape? Draw attention? Size/spacing matter
SKIN CLARITY: Blemishes? Texture? Glow? Evenness of tone?
BONE STRUCTURE: Cheekbones prominent? Forehead structure? Overall proportions well-balanced?
HARMONY: Do all features work together cohesively or feel disjointed?

Be brutally honest. If someone is average, they're 6-6.5, not inflated to 7+. If they're soft-featured and rounded, score accordingly, don't artificially boost. Find a celebrity who ACTUALLY looks similar, not a default.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response from Claude');
    }

    console.log('✅ Claude responded');

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not find JSON in response:', content.text.substring(0, 500));
      throw new Error('Could not parse JSON from Claude response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('📊 Analysis parsed:', {
      jawline: analysis.jawline,
      symmetry: analysis.symmetry,
      celebrityMatch: analysis.celebrityMatch,
    });

    // Calculate overall score and tier
    const scores = [
      analysis.jawline,
      analysis.symmetry,
      analysis.eyes,
      analysis.skinClarity,
      analysis.boneStructure,
      analysis.harmony,
    ];
    const overall = Math.round((scores.reduce((a, b) => a + b) / scores.length) * 10) / 10;
    const tier = overall >= 8.5 ? 'Elite' : overall >= 7.5 ? 'Above Average' : overall >= 6.5 ? 'Average' : 'Rising';

    // Extract match percentage from feature scores
    const percentMatch = Math.floor(((overall / 10) * 30) + 55); // 55-85% range based on scores

    // Pick aura color based on overall score
    const colorIdx = Math.floor(overall % AURA_COLORS.length);
    const auraData = AURA_COLORS[colorIdx];

    // Pick archetype
    const archIdx = Math.floor((analysis.jawline + analysis.symmetry) % ARCHETYPES.length);
    const archetype = ARCHETYPES[archIdx];

    return res.json({
      aura: {
        color: auraData.color,
        name: auraData.name,
        description: analysis.description,
        energy: auraData.energy,
      },
      face: {
        overall,
        tier,
        features: {
          jawline: analysis.jawline,
          symmetry: analysis.symmetry,
          eyes: analysis.eyes,
          skinClarity: analysis.skinClarity,
          boneStructure: analysis.boneStructure,
          harmony: analysis.harmony,
        },
      },
      observation: analysis.observation,
      personality: { archetype, traits: [] },
      celebrityMatch: {
        name: analysis.celebrityMatch,
        matchPercent: percentMatch,
      },
      shareCard: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        tagline: 'Your aura is verified.',
      },
      badges: [{ name: 'Real Analysis', icon: '✨', rarity: 'rare' }],
      rizzScore: {
        score: overall,
        level: overall >= 8 ? 'High' : overall >= 7 ? 'Good' : 'Building',
        description: analysis.description,
      },
      vibeSong: { title: 'Your Vibe', artist: 'You', emoji: '🎵' },
      roastMode: false,
    });
  } catch (error) {
    console.error('❌ Analysis error:', error.message || error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`✅ Aura API running on http://localhost:${PORT}`);
});
