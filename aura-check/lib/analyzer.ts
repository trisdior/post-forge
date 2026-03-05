import { AuraAnalysis } from './types';

function hashBuffer(buffer: ArrayBuffer): number {
  const view = new Uint8Array(buffer);
  let hash = 5381;
  const step = Math.max(1, Math.floor(view.length / 2000));
  for (let i = 0; i < view.length; i += step) {
    hash = ((hash << 5) + hash + view[i]) & 0x7fffffff;
  }
  return hash;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const AURAS = [
  { color: '#8b5cf6', name: 'Violet Flame', energy: 'Transcendent',
    hype: 'You radiate transformation and spiritual awareness. People sense depth in you before you even speak.',
    roast: 'You think you\'re deep but you\'re more like a puddle with good lighting. Your "spiritual awareness" is just zoning out.' },
  { color: '#06b6d4', name: 'Crystal Azure', energy: 'Intuitive',
    hype: 'Your energy is calm, clear, and deeply intuitive. You see through people effortlessly.',
    roast: 'You "see through people" because you stare too long. Your calm energy is actually just buffering.' },
  { color: '#f59e0b', name: 'Solar Gold', energy: 'Radiant',
    hype: 'You carry main character energy. Warm, magnetic, impossible to ignore.',
    roast: 'You carry "main character energy" — unfortunately it\'s a background character who thinks they\'re the lead.' },
  { color: '#ec4899', name: 'Rose Quartz', energy: 'Nurturing',
    hype: 'Your presence heals. People feel safe around you and open up without knowing why.',
    roast: 'People open up to you because you give off "I won\'t judge you" energy. Spoiler: you definitely judge them.' },
  { color: '#10b981', name: 'Emerald Pulse', energy: 'Harmonizing',
    hype: 'Grounded and powerful. You bring balance to chaos and growth to stagnation.',
    roast: 'You bring "balance to chaos" by being the most boring person in the room. Someone has to be the control group.' },
  { color: '#ef4444', name: 'Phoenix Red', energy: 'Dynamic',
    hype: 'Raw passion and fearless energy. You inspire action and demand attention.',
    roast: 'You "demand attention" the way a car alarm does — loud, persistent, and everyone wishes you\'d stop.' },
  { color: '#f97316', name: 'Amber Blaze', energy: 'Creative',
    hype: 'Creative fire runs through you. Your ideas light up rooms and your energy is contagious.',
    roast: 'Your ideas "light up rooms" — mostly because people\'s eyes widen in disbelief at what you just suggested.' },
  { color: '#3b82f6', name: 'Celestial Blue', energy: 'Sovereign',
    hype: 'You carry wisdom beyond your years. Calm authority that others naturally follow.',
    roast: 'You carry "wisdom beyond your years" — it\'s called anxiety. Others follow you because you always know where the exit is.' },
];

const ARCHETYPES = [
  { archetype: 'The Visionary', traits: ['Creative', 'Forward-thinking', 'Magnetic', 'Unconventional'], compatibility: 'Healers & Rebels' },
  { archetype: 'The Sovereign', traits: ['Confident', 'Protective', 'Decisive', 'Natural leader'], compatibility: 'Visionaries & Mystics' },
  { archetype: 'The Mystic', traits: ['Intuitive', 'Deep', 'Empathic', 'Enigmatic'], compatibility: 'Sovereigns & Alchemists' },
  { archetype: 'The Alchemist', traits: ['Transformative', 'Adaptive', 'Intellectual', 'Strategic'], compatibility: 'Mystics & Visionaries' },
  { archetype: 'The Healer', traits: ['Compassionate', 'Patient', 'Grounding', 'Selfless'], compatibility: 'Warriors & Visionaries' },
  { archetype: 'The Warrior', traits: ['Driven', 'Fearless', 'Disciplined', 'Loyal'], compatibility: 'Healers & Sovereigns' },
  { archetype: 'The Muse', traits: ['Inspiring', 'Expressive', 'Sensual', 'Free-spirited'], compatibility: 'Alchemists & Warriors' },
  { archetype: 'The Oracle', traits: ['Perceptive', 'Wise', 'Calm', 'Prophetic'], compatibility: 'Muses & Healers' },
];

const PERSONALITY_ROASTS: Record<string, { archetype: string; traits: string[]; compatibility: string }> = {
  'The Visionary': { archetype: 'The Overthinker', traits: ['Delusional', 'Chronically online', 'Thinks they\'re unique', 'Pinterest board personality'], compatibility: 'Other overthinkers & their therapists' },
  'The Sovereign': { archetype: 'The Control Freak', traits: ['Bossy', 'Micromanager', 'Reply guy energy', 'Group project dictator'], compatibility: 'People who can\'t say no' },
  'The Mystic': { archetype: 'The Vague Texter', traits: ['Cryptic', 'Emotionally unavailable', 'Posts sunsets unironically', 'Has a crystal collection'], compatibility: 'Anyone who enjoys guessing games' },
  'The Alchemist': { archetype: 'The Schemer', traits: ['Manipulative in a cute way', 'Chess not checkers energy', 'Trust issues', 'Has a burner account'], compatibility: 'Other schemers & true crime fans' },
  'The Healer': { archetype: 'The Doormat', traits: ['People-pleaser', 'Can\'t say no', 'Emotional sponge', 'Apologizes for existing'], compatibility: 'Emotional vampires who love them' },
  'The Warrior': { archetype: 'The Try-Hard', traits: ['Gym selfie poster', 'Competitive about everything', '5am alarm bragger', 'Protein shake personality'], compatibility: 'Other gym rats & pre-workout' },
  'The Muse': { archetype: 'The Main Character', traits: ['Chronically posts stories', 'Changes aesthetic monthly', 'Has dated everyone', 'Speaks in song lyrics'], compatibility: 'Anyone with a ring light' },
  'The Oracle': { archetype: 'The Know-It-All', traits: ['Actually says "well actually"', 'Unsolicited advice giver', 'Wikipedia energy', 'Ruins movie endings'], compatibility: 'People who enjoy being corrected' },
};

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
  'The algorithm had to take a break after this one.',
  'Someone had to be average. Thank you for your service.',
  'The energy doesn\'t lie. And today it chose violence.',
  'Certified aura: it\'s giving participation trophy.',
  'Face + aura = room for improvement. A LOT of room.',
];

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
];

const CELEBRITIES = [
  'Chris Hemsworth', 'Timothée Chalamet', 'Bad Bunny', 'Idris Elba', 'Jungkook',
  'Ryan Gosling', 'Michael B. Jordan', 'Henry Cavill', 'Dev Patel', 'Oscar Isaac',
  'Pedro Pascal', 'Harry Styles', 'Zayn Malik', 'Tom Holland', 'Keanu Reeves',
  'Zendaya', 'Margot Robbie', 'Rihanna', 'Jennie Kim', 'Ana de Armas',
  'Lupita Nyong\'o', 'Sydney Sweeney', 'Priyanka Chopra', 'Bella Hadid', 'Dua Lipa',
  'Taylor Swift', 'Halle Bailey', 'Anya Taylor-Joy', 'Jenna Ortega', 'Lisa Manobal',
  'Florence Pugh', 'Jacob Elordi', 'Sabrina Carpenter', 'Ice Spice',
];

const RIZZ_DESCRIPTIONS_HYPE: Record<string, string[]> = {
  'NPC': ['You\'re the quiet type. Mystery is your weapon — use it.', 'You\'re a sleeper build. When you finally lock in, it\'s over.'],
  'Side Character': ['You\'re the best friend everyone falls for after the breakup.', 'Low-key rizz. You grow on people like a favorite song.'],
  'Main Character': ['Your eyes do the talking. You don\'t need pickup lines — people come to you.', 'Natural magnetism. You walk in and the room recalibrates.'],
  'Protagonist': ['Dangerous levels of charisma. You make people nervous in the best way.', 'Your energy is a cheat code. People orbit you without realizing it.'],
  'Final Boss': ['Generational rizz. Scientists should study you.', 'You don\'t flirt. You just exist and people fall. It\'s actually unfair.'],
};

const RIZZ_DESCRIPTIONS_ROAST: Record<string, string[]> = {
  'NPC': ['Your rizz is on airplane mode. Permanently.', 'You have the charisma of a loading screen.'],
  'Side Character': ['You\'re the friend they call when everyone else is busy.', 'Your rizz peaks at "hey" and immediately flatlines.'],
  'Main Character': ['Main character energy but it\'s a documentary about paint drying.', 'You think you have rizz but your DMs tell a different story.'],
  'Protagonist': ['Your rizz works... on people with low standards.', 'Decent rizz but you definitely rehearse conversations in the shower.'],
  'Final Boss': ['Final boss of what? The friend zone?', 'Okay fine, you have rizz. Don\'t let it go to your head. Too late.'],
};

const GREEN_FLAGS = [
  'Remembers your coffee order ☕',
  'Actually texts back within minutes 📱',
  'Gives the best hugs — full commitment 🤗',
  'Makes playlists for people they care about 🎵',
  'Hypes up their friends\' selfies genuinely 💪',
  'Shows up on time. Every time. ⏰',
  'Asks "did you get home safe?" without being asked 🏠',
  'Shares food without being asked 🍕',
  'Puts their phone down when you\'re talking 👀',
  'Actually listens and remembers small details 🧠',
  'Laughs at your jokes even when they\'re mid 😂',
  'Defends you when you\'re not in the room 🛡️',
];

const RED_FLAGS = [
  'Overthinks at 3am about a text from 2019 🌙',
  'Has too many playlists for too many moods 🎧',
  'Screenshots conversations "just in case" 📸',
  'Says "I\'m fine" when absolutely not fine 🙃',
  'Goes ghost for 3 days then sends a meme like nothing happened 👻',
  'Has 47 open Chrome tabs right now 💻',
  'Types "lol" with a completely straight face 😐',
  'Takes 400 selfies to post one 📷',
  'Stalks their own profile from a finsta 🕵️',
  'Has a notes app full of unhinged thoughts 📝',
  'Says "no drama" but is always in drama 🎭',
  'Reads your message and responds 3 hours later with "sorry just saw this" ⏳',
];

const VIBE_SONGS = [
  { title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars', emoji: '💀🌹' },
  { title: 'Espresso', artist: 'Sabrina Carpenter', emoji: '☕✨' },
  { title: 'HUMBLE.', artist: 'Kendrick Lamar', emoji: '🔥👑' },
  { title: 'Blinding Lights', artist: 'The Weeknd', emoji: '🌃💜' },
  { title: 'Snooze', artist: 'SZA', emoji: '😴💕' },
  { title: 'Cruel Summer', artist: 'Taylor Swift', emoji: '☀️🔪' },
  { title: 'Levitating', artist: 'Dua Lipa', emoji: '🪐💫' },
  { title: 'Kiss Me More', artist: 'Doja Cat ft. SZA', emoji: '💋🦋' },
  { title: 'As It Was', artist: 'Harry Styles', emoji: '🪞🌈' },
  { title: 'APT.', artist: 'ROSÉ & Bruno Mars', emoji: '🏠🎶' },
  { title: 'Pink + White', artist: 'Frank Ocean', emoji: '🌸🤍' },
  { title: 'MONTERO', artist: 'Lil Nas X', emoji: '😈🦄' },
  { title: 'Good Days', artist: 'SZA', emoji: '🌻☀️' },
  { title: 'Redbone', artist: 'Childish Gambino', emoji: '🌙🎸' },
  { title: 'vampire', artist: 'Olivia Rodrigo', emoji: '🧛‍♀️🩸' },
  { title: 'SICKO MODE', artist: 'Travis Scott', emoji: '🌵🔥' },
  { title: 'drivers license', artist: 'Olivia Rodrigo', emoji: '🚗💔' },
  { title: 'Watermelon Sugar', artist: 'Harry Styles', emoji: '🍉💦' },
  { title: 'STAY', artist: 'The Kid LAROI & Justin Bieber', emoji: '🥺💫' },
  { title: 'Heat Waves', artist: 'Glass Animals', emoji: '🌊🔥' },
  { title: 'luther', artist: 'Kendrick Lamar ft. SZA', emoji: '👑🌹' },
  { title: 'birds of a feather', artist: 'Billie Eilish', emoji: '🪶💚' },
];

const FEATURE_TIPS: Record<string, string[]> = {
  jawline: [
    'Mewing (proper tongue posture) can subtly sharpen your jawline over time. Keep your tongue pressed against the roof of your mouth.',
    'Chew mastic gum 20 min/day to build masseter muscles — it visibly defines your lower third.',
    'Lean out to 12-15% body fat to reveal your jawline. The structure is there — strip the layer hiding it.',
    'Fix your posture. Forward head posture literally softens your jawline. Chin tucked, neck straight.',
  ],
  symmetry: [
    'Sleep on your back — side sleeping compresses one side of your face nightly and can create asymmetry over time.',
    'Chew food evenly on both sides. Most people favor one side, which overdevelops that masseter.',
    'Facial massage along your lymph nodes reduces puffiness and evens out your features. 5 min before bed.',
    'Get your eyebrows professionally shaped to match. Symmetrical brows are the easiest hack for a balanced face.',
  ],
  eyes: [
    'Get 8 hours of quality sleep. Dark circles and puffiness are killing your eye score — nothing fixes this faster.',
    'Use a caffeine eye cream mornings to de-puff and tighten the under-eye area instantly.',
    'Blue light glasses if you\'re on screens all day. Reduces strain lines and keeps your eyes bright.',
    'Try castor oil on your lashes at night — thicker lashes frame your eyes and make them pop.',
  ],
  skinClarity: [
    'Start double cleansing at night — oil cleanser first, then gentle foam. Your skin clarity could jump 2 points.',
    'Add vitamin C serum every morning. It fades dark spots, brightens tone, and gives you that natural glow.',
    'SPF 50 daily, rain or shine. Sun damage is the #1 thing aging your face card. Non-negotiable.',
    'Try retinol 2-3x per week at night. It accelerates cell turnover — the gold standard for clear skin.',
    'Drink 3L of water daily and cut dairy for 30 days. Watch your skin transform.',
    'Cold showers tighten pores and boost circulation. 2 minutes at the end of your shower — your skin will glow.',
  ],
  boneStructure: [
    'Strength training boosts testosterone and collagen, both of which enhance facial structure over time.',
    'Lose excess body fat to reveal your bone structure. Your cheekbones and jaw are hiding under soft tissue.',
    'Derma rolling (0.5mm) boosts collagen production and tightens skin around your bone structure.',
    'Contouring with skincare — use a matte bronzer along your cheekbones and jawline for an instant structural boost in photos.',
  ],
  harmony: [
    'Wear colors that complement your aura color — color harmony on your body amplifies facial harmony.',
    'Find a hairstyle that balances your face shape. Round face? Add height. Long face? Add width. Ask a stylist.',
    'Practice holding eye contact 3 seconds longer than comfortable. Confidence makes every feature work together.',
    'Grooming consistency is everything. Clean brows, clear skin, trimmed facial hair — harmony is in the details.',
  ],
};

const ROAST_TIPS = [
  'Have you considered becoming a mysterious mask-wearing vigilante? Just a thought. 🦇',
  'Good news: personality goes a long way. You\'re gonna need it to go a VERY long way.',
  'Try standing further from the camera. Like, way further. Another zip code should work.',
  'Your glow-up tip is called "good lighting and a prayer." 🙏',
  'Consider investing in a really, really good personality. Like, award-winning.',
  'The best angle for your face? The one where people can see your sense of humor instead.',
  'Step 1: Grow a beard. Step 2: Grow a bigger beard. Step 3: Witness protection program.',
  'Your face has character! And by character, I mean it looks like a character select screen someone randomized.',
  'Sunglasses. Big ones. Trust the process. 🕶️',
  'Have you tried turning your face off and on again?',
];

const FEATURE_ROASTS: Record<string, string[]> = {
  jawline: [
    'Your jawline said "maybe next lifetime" 💀',
    'Jawline status: still loading...',
    'Your jaw is giving "participation trophy"',
    'The jawline is there in spirit ✨',
  ],
  symmetry: [
    'Your symmetry suggests your face is in a long-distance relationship with itself 📏',
    'Left side and right side haven\'t spoken since the divorce',
    'Your face has creative differences with the mirror',
    'Symmetry? Your face said "I\'ll do my own thing, thanks"',
  ],
  eyes: [
    'Your eyes are... open. That\'s about all we can confirm 👀',
    'Eye contact with you is a survival challenge',
    'Your eyes said "we showed up, that\'s enough"',
    'The windows to your soul need a deep clean',
  ],
  skinClarity: [
    'Your skin is going through a character arc right now 🧴',
    'Skin clarity: currently in its villain era',
    'Your pores are visible from the ISS',
    'Your skin\'s idea of clarity is "it\'s complicated"',
  ],
  boneStructure: [
    'Bone structure? More like bone suggestion 🦴',
    'Your bones are there, just shy about it',
    'Bone structure said "I\'ll sit this one out"',
    'The structure is abstract art at best',
  ],
  harmony: [
    'Your features are all talented soloists who refuse to form a band 🎵',
    'Facial harmony? Your face is more of a free jazz situation',
    'Your features each showed up to a different party',
    'The harmony is giving "group project where nobody communicates"',
  ],
};

const featureKeys = ['jawline', 'symmetry', 'eyes', 'skinClarity', 'boneStructure', 'harmony'] as const;

export async function analyzeImage(imageData: ArrayBuffer, roastMode: boolean = false, fileName: string = 'photo.jpg'): Promise<AuraAnalysis> {
  try {
    // Convert ArrayBuffer to Blob to FormData (preserves original image format)
    const blob = new Blob([imageData], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('image', blob, fileName);
    formData.append('roastMode', roastMode ? 'true' : 'false');

    // Call the local Aura API endpoint
    const response = await fetch('http://localhost:3003/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Merge with the same structure as before for compatibility
    return {
      ...result,
      glowUpTips: [
        'Get 8 hours of quality sleep — your look is already strong, rest keeps it fresh.',
        'Hydrate consistently. Clear skin is glowing skin.',
        'Confidence is your secret weapon. Own your presence.',
        'Find a skincare routine that works for you and stick with it.',
      ],
      flags: {
        green: [
          'You have presence that people notice 🧲',
          'Your energy is magnetic ✨',
          'People are drawn to you naturally 💫',
        ],
        red: [
          'You might overthink your appearance 🤔',
          'Comparison is your worst enemy 🪞',
        ],
      },
      countryScores: [
        { country: 'USA', flag: '🇺🇸', score: 8.2 },
        { country: 'Italy', flag: '🇮🇹', score: 8.0 },
        { country: 'South Korea', flag: '🇰🇷', score: 8.3 },
      ],
    };
  } catch (error) {
    console.error('API call failed:', error);
    // Fallback to fake analysis if API fails
    return fallbackAnalysis(roastMode);
  }
}

function fallbackAnalysis(roastMode: boolean): AuraAnalysis {
  const hash = Math.random();
  const auraIdx = Math.floor(hash * AURAS.length);
  const archIdx = Math.floor(hash * ARCHETYPES.length);
  const auraData = AURAS[auraIdx];

  const features = {
    jawline: 7.5,
    symmetry: 7.8,
    eyes: 8.0,
    skinClarity: 7.2,
    boneStructure: 7.6,
    harmony: 7.9,
  };

  const vals = Object.values(features);
  const overall = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  const tier = overall >= 8.5 ? 'Elite' : overall >= 7.5 ? 'Above Average' : overall >= 6.5 ? 'Average' : 'Rising';

  return {
    aura: {
      color: auraData.color,
      name: auraData.name,
      description: 'Your aura is unique and captivating.',
      energy: auraData.energy,
    },
    face: { overall, tier, features },
    personality: ARCHETYPES[archIdx],
    glowUpTips: [
      'Get 8 hours of quality sleep — your look is already strong, rest keeps it fresh.',
      'Hydrate consistently. Clear skin is glowing skin.',
    ],
    shareCard: {
      gradient: GRADIENTS[0],
      tagline: (roastMode ? ROAST_TAGLINES : TAGLINES)[0],
    },
    countryScores: [
      { country: 'USA', flag: '🇺🇸', score: 8.2 },
      { country: 'Italy', flag: '🇮🇹', score: 8.0 },
    ],
    badges: [
      { name: 'Verified Aura', icon: '✨', rarity: 'rare' },
    ],
    celebrityMatch: { name: CELEBRITIES[0], matchPercent: 75 },
    rizzScore: { score: 7.5, level: 'Main Character', description: 'Your energy is magnetic. People notice.' },
    flags: { green: ['You have presence ✨'], red: ['Keep it humble 🎭'] },
    vibeSong: VIBE_SONGS[0],
    roastMode,
  };
}
