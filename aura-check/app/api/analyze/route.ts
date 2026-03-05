import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalysisRequest {
  imageBase64: string;
  roastMode?: boolean;
}

const AURAS = [
  { color: '#8b5cf6', name: 'Violet Flame', energy: 'Transcendent' },
  { color: '#06b6d4', name: 'Crystal Azure', energy: 'Intuitive' },
  { color: '#f59e0b', name: 'Solar Gold', energy: 'Radiant' },
  { color: '#ec4899', name: 'Rose Quartz', energy: 'Nurturing' },
  { color: '#10b981', name: 'Emerald Pulse', energy: 'Harmonizing' },
  { color: '#ef4444', name: 'Phoenix Red', energy: 'Dynamic' },
  { color: '#f97316', name: 'Amber Blaze', energy: 'Creative' },
  { color: '#3b82f6', name: 'Celestial Blue', energy: 'Sovereign' },
];

const ARCHETYPES = [
  { archetype: 'The Visionary', traits: ['Creative', 'Forward-thinking', 'Magnetic', 'Unconventional'] },
  { archetype: 'The Sovereign', traits: ['Confident', 'Protective', 'Decisive', 'Natural leader'] },
  { archetype: 'The Mystic', traits: ['Intuitive', 'Deep', 'Empathic', 'Enigmatic'] },
  { archetype: 'The Alchemist', traits: ['Transformative', 'Adaptive', 'Intellectual', 'Strategic'] },
  { archetype: 'The Healer', traits: ['Compassionate', 'Patient', 'Grounding', 'Selfless'] },
  { archetype: 'The Warrior', traits: ['Driven', 'Fearless', 'Disciplined', 'Loyal'] },
  { archetype: 'The Muse', traits: ['Inspiring', 'Expressive', 'Sensual', 'Free-spirited'] },
  { archetype: 'The Oracle', traits: ['Perceptive', 'Wise', 'Calm', 'Prophetic'] },
];

const CELEBRITIES = [
  'Timothée Chalamet', 'Oscar Isaac', 'Idris Elba', 'Dev Patel', 'Jungkook',
  'Zayn Malik', 'Henry Cavill', 'Michael B. Jordan', 'Jacob Elordi', 'Pedro Pascal',
  'Tom Holland', 'Harry Styles', 'Ryan Gosling', 'Keanu Reeves', 'Rami Malek',
  'Timmy Turner', 'Cole Sprouse', 'Kit Harington', 'Ben Barnes', 'Paul Rudd',
  'Zendaya', 'Margot Robbie', 'Jennie Kim', 'Ana de Armas', 'Bella Hadid',
  'Lupita Nyong\'o', 'Sydney Sweeney', 'Priyanka Chopra', 'Dua Lipa', 'Scarlett Johansson',
  'Halle Bailey', 'Anya Taylor-Joy', 'Jenna Ortega', 'Lisa Manobal', 'Dua Lipa',
  'Florence Pugh', 'Sabrina Carpenter', 'Ice Spice', 'Ariana Grande', 'Billie Eilish',
  'Azealia Banks', 'Timothée Chalamet Clone #2', 'Rihanna', 'Gigi Hadid', 'Olivia Rodrigo',
  'Sza', 'Yara Shahidi', 'Tessa Thompson', 'Tracee Ellis Ross', 'Breestin Moore',
  'Mahershala Ali', 'Tobey Maguire', 'Leonardo DiCaprio', 'Jake Gyllenhaal', 'Bradley Cooper',
  'Christian Bale', 'Hugh Jackman', 'Tom Hardy', 'Michael Fassbender', 'Oscar Issac Clone',
  'Hailey Bieber', 'Kylie Jenner', 'Emily Ratajkowski', 'Lili Reinhart', 'Camila Cabello',
];

const TAGLINES = [
  'Built different. The aura proves it.',
  'Main character energy confirmed.',
  'Your face card never declines.',
  'The algorithm couldn\'t handle this.',
  'Certified aura: immaculate.',
  'Not everyone gets this reading.',
  'The energy doesn\'t lie.',
  'Face + aura = unmatched.',
];

const ROAST_TAGLINES = [
  'The aura tried its best. Bless its heart.',
  'NPC energy detected. Loading personality...',
  'Your face card got flagged for fraud.',
  'Someone had to be average. Thank you for your service.',
  'The energy doesn\'t lie. And today it chose violence.',
  'Certified aura: it\'s giving participation trophy.',
];

const VIBE_SONGS = [
  { title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', emoji: '💀🌹' },
  { title: 'Espresso', artist: 'Sabrina Carpenter', emoji: '☕✨' },
  { title: 'HUMBLE.', artist: 'Kendrick Lamar', emoji: '🔥👑' },
  { title: 'Blinding Lights', artist: 'The Weeknd', emoji: '🌃💜' },
  { title: 'Snooze', artist: 'SZA', emoji: '😴💕' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

function getRandomItem<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seed * arr.length) % arr.length];
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    let { imageBase64, roastMode = false } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    // Clean base64 if it has data: URL prefix
    if (imageBase64.startsWith('data:')) {
      imageBase64 = imageBase64.split(',')[1];
    }

    console.log('Image base64 length:', imageBase64.length);

    // Call Claude Vision to analyze the image
    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are an expert facial analyst. Study this photo carefully.

STEP 1 — OBSERVE (be brutally specific):
- Exact face shape (oval, round, square, heart, oblong, diamond)
- Jawline definition (weak/soft/defined/chiseled/angular)
- Eye shape, size, spacing, color if visible
- Nose shape and proportion to face
- Lip fullness and symmetry
- Cheekbone prominence
- Forehead proportion
- Skin texture and clarity (acne, scars, smoothness, glow)
- Hair style/color/texture
- Overall facial harmony — do features complement each other?
- Age range and gender presentation
- Ethnicity/background (be specific, this affects celebrity matching)
- What makes THIS face UNIQUE? What stands out?

STEP 2 — SCORE HONESTLY. Most people are average (6-7). Don't inflate. Use the FULL range:
- 4.0-5.5 = below average
- 5.5-6.5 = average
- 6.5-7.5 = above average  
- 7.5-8.5 = attractive
- 8.5-9.5 = very attractive
- 9.5-10.0 = model-tier (almost never give this)

Give DIFFERENT scores for each feature. A person can have a 9.0 jawline and 6.0 skin. Be real.

STEP 3 — Return JSON only (do NOT include any celebrity match — we handle that separately):
{
  "description_of_face": "<3-4 sentences describing what makes this specific face unique — mention their best feature and what stands out>",
  "faceShape": "<exact shape: oval, round, square, heart, oblong, diamond>",
  "jawlineType": "<exact type: weak, soft, defined, chiseled, angular>",
  "eyeShape": "<exact shape: almond, round, hooded, monolid, deep-set, upturned, downturned>",
  "ethnicity": "<specific: east-asian, south-asian, black, white, latino, middle-eastern, mixed, pacific-islander>",
  "gender": "<male, female, androgynous>",
  "jawline": <4.0-10.0>,
  "symmetry": <4.0-10.0>,
  "eyes": <4.0-10.0>,
  "skinClarity": <4.0-10.0>,
  "boneStructure": <4.0-10.0>,
  "harmony": <4.0-10.0>,
  "personality": "<one of: The Visionary, The Sovereign, The Mystic, The Alchemist, The Healer, The Warrior, The Muse, The Oracle — pick based on what their face COMMUNICATES, not random>",
  "auraName": "<one of: Violet Flame, Crystal Azure, Solar Gold, Rose Quartz, Emerald Pulse, Phoenix Red, Amber Blaze, Celestial Blue — match to their energy/vibe>",
  "description": "<2-3 sentence personalized aura reading that references SPECIFIC features you observed. Make the person feel SEEN, not like they got a fortune cookie.>"
}

Be honest. Be specific. People share results that feel PERSONAL, not generic.`,
            },
          ],
        },
      ],
    });

    // Extract the analysis from Claude's response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    console.log('Claude response:', content.text);

    // Parse Claude's JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Claude response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Parsed analysis:', JSON.stringify(analysis, null, 2));

    // CELEBRITY MATCHING — 100% code-based, Claude never picks
    const CELEB_PROFILES: Record<string, { gender: string; ethnicity: string[]; jawline: string[]; faceShape: string[] }> = {
      'Timothée Chalamet': { gender: 'male', ethnicity: ['white', 'mixed'], jawline: ['defined', 'angular'], faceShape: ['oblong', 'oval'] },
      'Oscar Isaac': { gender: 'male', ethnicity: ['latino', 'mixed', 'middle-eastern'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Idris Elba': { gender: 'male', ethnicity: ['black'], jawline: ['chiseled', 'defined'], faceShape: ['square', 'oval'] },
      'Dev Patel': { gender: 'male', ethnicity: ['south-asian'], jawline: ['defined', 'angular'], faceShape: ['oblong', 'oval'] },
      'Jungkook': { gender: 'male', ethnicity: ['east-asian'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
      'Zayn Malik': { gender: 'male', ethnicity: ['south-asian', 'mixed'], jawline: ['chiseled', 'angular'], faceShape: ['oval', 'diamond'] },
      'Henry Cavill': { gender: 'male', ethnicity: ['white'], jawline: ['chiseled', 'angular'], faceShape: ['square', 'oval'] },
      'Michael B. Jordan': { gender: 'male', ethnicity: ['black'], jawline: ['defined', 'chiseled'], faceShape: ['oval', 'round'] },
      'Jacob Elordi': { gender: 'male', ethnicity: ['white'], jawline: ['angular', 'chiseled'], faceShape: ['oblong', 'oval'] },
      'Pedro Pascal': { gender: 'male', ethnicity: ['latino'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
      'Tom Holland': { gender: 'male', ethnicity: ['white'], jawline: ['soft', 'weak'], faceShape: ['round', 'oval'] },
      'Harry Styles': { gender: 'male', ethnicity: ['white'], jawline: ['defined', 'soft'], faceShape: ['oval', 'heart'] },
      'Ryan Gosling': { gender: 'male', ethnicity: ['white'], jawline: ['defined', 'soft'], faceShape: ['oval', 'oblong'] },
      'Keanu Reeves': { gender: 'male', ethnicity: ['mixed', 'east-asian', 'white'], jawline: ['defined', 'soft'], faceShape: ['oblong', 'oval'] },
      'Rami Malek': { gender: 'male', ethnicity: ['middle-eastern', 'mixed'], jawline: ['defined', 'angular'], faceShape: ['oval', 'heart'] },
      'Kit Harington': { gender: 'male', ethnicity: ['white'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Ben Barnes': { gender: 'male', ethnicity: ['white'], jawline: ['defined', 'chiseled'], faceShape: ['oval', 'oblong'] },
      'Tom Hardy': { gender: 'male', ethnicity: ['white'], jawline: ['chiseled', 'angular'], faceShape: ['square', 'round'] },
      'Mahershala Ali': { gender: 'male', ethnicity: ['black'], jawline: ['defined', 'angular'], faceShape: ['oval', 'oblong'] },
      'Leonardo DiCaprio': { gender: 'male', ethnicity: ['white'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Jake Gyllenhaal': { gender: 'male', ethnicity: ['white'], jawline: ['defined', 'angular'], faceShape: ['oval', 'square'] },
      'Bradley Cooper': { gender: 'male', ethnicity: ['white'], jawline: ['defined', 'chiseled'], faceShape: ['oval', 'oblong'] },
      'Michael Fassbender': { gender: 'male', ethnicity: ['white', 'mixed'], jawline: ['angular', 'chiseled'], faceShape: ['oblong', 'oval'] },
      'Zendaya': { gender: 'female', ethnicity: ['mixed', 'black'], jawline: ['defined', 'soft'], faceShape: ['oval', 'heart'] },
      'Margot Robbie': { gender: 'female', ethnicity: ['white'], jawline: ['defined', 'soft'], faceShape: ['oval', 'heart'] },
      'Jennie Kim': { gender: 'female', ethnicity: ['east-asian'], jawline: ['soft', 'defined'], faceShape: ['oval', 'heart'] },
      'Ana de Armas': { gender: 'female', ethnicity: ['latino', 'white'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
      'Bella Hadid': { gender: 'female', ethnicity: ['mixed', 'middle-eastern'], jawline: ['angular', 'chiseled'], faceShape: ['oval', 'diamond'] },
      'Priyanka Chopra': { gender: 'female', ethnicity: ['south-asian'], jawline: ['defined', 'soft'], faceShape: ['oval', 'heart'] },
      'Dua Lipa': { gender: 'female', ethnicity: ['white', 'mixed'], jawline: ['defined', 'angular'], faceShape: ['oval', 'square'] },
      'Halle Bailey': { gender: 'female', ethnicity: ['black'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
      'Anya Taylor-Joy': { gender: 'female', ethnicity: ['white', 'mixed'], jawline: ['defined', 'angular'], faceShape: ['heart', 'diamond'] },
      'Jenna Ortega': { gender: 'female', ethnicity: ['latino', 'mixed'], jawline: ['soft', 'defined'], faceShape: ['oval', 'heart'] },
      'Lisa Manobal': { gender: 'female', ethnicity: ['east-asian'], jawline: ['soft', 'defined'], faceShape: ['oval', 'heart'] },
      'Sabrina Carpenter': { gender: 'female', ethnicity: ['white'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Ice Spice': { gender: 'female', ethnicity: ['mixed', 'black', 'latino'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Rihanna': { gender: 'female', ethnicity: ['black'], jawline: ['defined', 'angular'], faceShape: ['oval', 'diamond'] },
      'Sza': { gender: 'female', ethnicity: ['black', 'mixed'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
      'Lupita Nyong\'o': { gender: 'female', ethnicity: ['black'], jawline: ['defined', 'angular'], faceShape: ['oval', 'oblong'] },
      'Sydney Sweeney': { gender: 'female', ethnicity: ['white'], jawline: ['soft', 'defined'], faceShape: ['round', 'oval'] },
      'Florence Pugh': { gender: 'female', ethnicity: ['white'], jawline: ['soft', 'round'], faceShape: ['round', 'heart'] },
      'Olivia Rodrigo': { gender: 'female', ethnicity: ['mixed', 'latino', 'east-asian'], jawline: ['soft', 'defined'], faceShape: ['oval', 'round'] },
    };

    // Match celebrity based on facial features from Claude's analysis
    const faceShape = (analysis.faceShape || 'oval').toLowerCase();
    const jawlineType = (analysis.jawlineType || 'defined').toLowerCase();
    const ethnicity = (analysis.ethnicity || 'white').toLowerCase();
    const gender = (analysis.gender || 'male').toLowerCase();

    // Score each celebrity based on feature matches
    const celebScores = Object.entries(CELEB_PROFILES)
      .filter(([_, p]) => p.gender === gender || gender === 'androgynous')
      .map(([name, profile]) => {
        let score = 0;
        // Ethnicity match (most important — 3 points)
        if (profile.ethnicity.includes(ethnicity)) score += 3;
        // Jawline match (2 points)
        if (profile.jawline.includes(jawlineType)) score += 2;
        // Face shape match (2 points)
        if (profile.faceShape.includes(faceShape)) score += 2;
        return { name, score };
      })
      .sort((a, b) => b.score - a.score);

    // Get all top-scoring celebs (ties), then pick one deterministically using scores
    const topScore = celebScores[0]?.score || 0;
    const topCelebs = celebScores.filter(c => c.score === topScore);
    
    // Create a varied seed from ALL the individual scores
    const seedVal = Math.abs(
      analysis.jawline * 1000 + 
      analysis.symmetry * 100 + 
      analysis.eyes * 10 + 
      analysis.skinClarity * 7.3 + 
      analysis.boneStructure * 3.7 + 
      analysis.harmony * 1.9
    );
    const celebIdx = Math.floor(seedVal) % topCelebs.length;
    analysis.celebrityMatch = topCelebs[celebIdx]?.name || CELEBRITIES[Math.floor(seedVal) % CELEBRITIES.length];
    
    console.log('Feature-matched celebrity:', analysis.celebrityMatch, 
      `(shape:${faceShape}, jaw:${jawlineType}, eth:${ethnicity}, gender:${gender})`,
      `Top matches:`, topCelebs.slice(0, 5).map(c => `${c.name}(${c.score})`));

    // Find matching aura
    const aura = AURAS.find(a => a.name === analysis.auraName) || AURAS[0];
    const archetype = ARCHETYPES.find(a => a.archetype === analysis.personality) || ARCHETYPES[0];

    // Calculate overall score
    const scores = [
      analysis.jawline,
      analysis.symmetry,
      analysis.eyes,
      analysis.skinClarity,
      analysis.boneStructure,
      analysis.harmony,
    ];
    const overall = Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10;
    const tier = overall >= 8.5 ? 'Elite' : overall >= 7.5 ? 'Above Average' : overall >= 6.5 ? 'Average' : 'Rising';

    // Generate consistent selections based on overall score (for reproducibility)
    const seed = overall / 10;
    const celebMatch = analysis.celebrityMatch || getRandomItem(CELEBRITIES, seed);
    const tagline = getRandomItem(
      roastMode ? ROAST_TAGLINES : TAGLINES,
      seed + 0.1
    );
    const gradient = getRandomItem(GRADIENTS, seed + 0.2);
    const vibeSong = getRandomItem(VIBE_SONGS, seed + 0.3);
    // Calculate match percent based on similarity of features
    const matchPercent = Math.floor(((
      analysis.jawline +
      analysis.symmetry +
      analysis.eyes +
      analysis.skinClarity +
      analysis.boneStructure +
      analysis.harmony
    ) / 6 / 10) * 40) + 55; // Range 55-95%
    const rizzRaw = seed * 4.5 + 5.5;
    const rizzScore = Math.round(rizzRaw * 10) / 10;
    const rizzLevel = rizzScore >= 9.5 ? 'Final Boss' : rizzScore >= 8 ? 'Protagonist' : rizzScore >= 6 ? 'Main Character' : rizzScore >= 4 ? 'Side Character' : 'NPC';

    return NextResponse.json({
      aura: {
        color: aura.color,
        name: aura.name,
        description: analysis.description,
        energy: aura.energy,
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
      personality: archetype,
      shareCard: {
        gradient,
        tagline,
      },
      badges: [
        { name: 'Verified Aura', icon: '✨', rarity: 'rare' },
      ],
      celebrityMatch: {
        name: celebMatch,
        matchPercent: Math.min(95, matchPercent),
      },
      rizzScore: {
        score: rizzScore,
        level: rizzLevel,
        description: `Your energy is ${rizzLevel === 'NPC' ? 'still loading' : rizzLevel === 'Side Character' ? 'growing' : rizzLevel === 'Main Character' ? 'magnetic' : 'magnetic and magnetic'}. People notice.`,
      },
      vibeSong,
      roastMode,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
