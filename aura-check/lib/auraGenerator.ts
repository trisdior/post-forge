// Aura colors with their gradients and meanings
export const AURA_COLORS = {
  purple: {
    name: 'Violet',
    gradient: 'from-purple-600 via-violet-500 to-purple-400',
    bgGradient: 'bg-gradient-to-br from-purple-600 via-violet-500 to-purple-400',
    hex: '#8b5cf6',
    meaning: 'Intuition & Spiritual Wisdom',
    description: 'You possess a deep connection to the unseen realms. Your intuition is your superpower.',
    glow: 'aura-glow-purple',
  },
  cyan: {
    name: 'Cyan',
    gradient: 'from-cyan-400 via-teal-500 to-cyan-600',
    bgGradient: 'bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600',
    hex: '#06b6d4',
    meaning: 'Calm & Communication',
    description: 'Your energy flows like water — adaptable, clear, and deeply healing to others.',
    glow: 'aura-glow-cyan',
  },
  gold: {
    name: 'Gold',
    gradient: 'from-yellow-400 via-amber-500 to-orange-400',
    bgGradient: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-400',
    hex: '#f59e0b',
    meaning: 'Wisdom & Abundance',
    description: 'You radiate success energy. Your presence inspires confidence in everyone around you.',
    glow: 'aura-glow-gold',
  },
  pink: {
    name: 'Rose',
    gradient: 'from-pink-400 via-rose-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600',
    hex: '#ec4899',
    meaning: 'Love & Compassion',
    description: 'Your heart chakra blazes bright. You love deeply and attract love effortlessly.',
    glow: 'aura-glow-pink',
  },
  blue: {
    name: 'Sapphire',
    gradient: 'from-blue-400 via-blue-500 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500',
    hex: '#3b82f6',
    meaning: 'Peace & Truth',
    description: 'You bring tranquility wherever you go. People trust you instinctively.',
    glow: 'aura-glow-blue',
  },
  green: {
    name: 'Emerald',
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    bgGradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
    hex: '#10b981',
    meaning: 'Healing & Growth',
    description: 'Nature flows through you. You have the rare gift of helping others bloom.',
    glow: 'aura-glow-green',
  },
  red: {
    name: 'Ruby',
    gradient: 'from-red-400 via-red-500 to-rose-600',
    bgGradient: 'bg-gradient-to-br from-red-400 via-red-500 to-rose-600',
    hex: '#ef4444',
    meaning: 'Passion & Power',
    description: 'Fire lives in your soul. Your passion ignites movements and inspires action.',
    glow: 'aura-glow-red',
  },
  orange: {
    name: 'Amber',
    gradient: 'from-orange-400 via-orange-500 to-red-400',
    bgGradient: 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-400',
    hex: '#f97316',
    meaning: 'Creativity & Joy',
    description: 'Pure creative fire! You see possibilities where others see limits.',
    glow: 'aura-glow-orange',
  },
  white: {
    name: 'Pearl',
    gradient: 'from-slate-100 via-white to-slate-200',
    bgGradient: 'bg-gradient-to-br from-slate-100 via-white to-slate-200',
    hex: '#ffffff',
    meaning: 'Purity & Enlightenment',
    description: 'Rare and transcendent. You carry an old soul energy that few possess.',
    glow: 'aura-glow-white',
  },
}

// 24 unique personality types
export const PERSONALITY_TYPES = [
  {
    name: 'The Visionary',
    tagline: 'You see futures others can\'t imagine yet.',
    strengths: ['Future-thinking', 'Innovation', 'Inspiring others', 'Big picture focus'],
  },
  {
    name: 'The Healer',
    tagline: 'Your presence alone makes others feel whole.',
    strengths: ['Emotional intelligence', 'Nurturing energy', 'Patience', 'Deep empathy'],
  },
  {
    name: 'The Catalyst',
    tagline: 'You spark transformation wherever you go.',
    strengths: ['Change-making', 'Bold action', 'Resilience', 'Fearlessness'],
  },
  {
    name: 'The Sage',
    tagline: 'Ancient wisdom flows through your modern soul.',
    strengths: ['Deep knowledge', 'Thoughtful advice', 'Patience', 'Inner peace'],
  },
  {
    name: 'The Creator',
    tagline: 'You turn nothing into something magical.',
    strengths: ['Artistic vision', 'Original thinking', 'Flow states', 'Beauty creation'],
  },
  {
    name: 'The Warrior',
    tagline: 'You fight for what matters with unwavering spirit.',
    strengths: ['Courage', 'Determination', 'Protection of others', 'Inner strength'],
  },
  {
    name: 'The Mystic',
    tagline: 'The universe whispers secrets only you can hear.',
    strengths: ['Intuition', 'Spiritual depth', 'Reading energy', 'Dream interpretation'],
  },
  {
    name: 'The Luminary',
    tagline: 'Your light guides others through darkness.',
    strengths: ['Natural leadership', 'Charisma', 'Optimism', 'Inspiring hope'],
  },
  {
    name: 'The Alchemist',
    tagline: 'You transform pain into power, obstacles into gold.',
    strengths: ['Transformation', 'Problem-solving', 'Adaptability', 'Wisdom from struggle'],
  },
  {
    name: 'The Empath',
    tagline: 'You feel the world deeper than anyone knows.',
    strengths: ['Emotional depth', 'Understanding others', 'Authentic connection', 'Sensitivity'],
  },
  {
    name: 'The Maverick',
    tagline: 'Rules exist for others. You exist to rewrite them.',
    strengths: ['Independence', 'Innovation', 'Challenging norms', 'Authentic living'],
  },
  {
    name: 'The Guardian',
    tagline: 'You are the shield that protects what matters.',
    strengths: ['Loyalty', 'Protective instincts', 'Reliability', 'Quiet strength'],
  },
  {
    name: 'The Oracle',
    tagline: 'Truth reveals itself to you before others see it.',
    strengths: ['Foresight', 'Pattern recognition', 'Honest insight', 'Wisdom sharing'],
  },
  {
    name: 'The Phoenix',
    tagline: 'You rise from every fall more powerful than before.',
    strengths: ['Resilience', 'Transformation', 'Rising from adversity', 'Rebirth energy'],
  },
  {
    name: 'The Harmonizer',
    tagline: 'You bring balance to chaos and peace to conflict.',
    strengths: ['Peacemaking', 'Diplomacy', 'Finding middle ground', 'Calming presence'],
  },
  {
    name: 'The Enchanter',
    tagline: 'Your energy captivates and mesmerizes effortlessly.',
    strengths: ['Magnetic presence', 'Storytelling', 'Charm', 'Creating magic'],
  },
  {
    name: 'The Pioneer',
    tagline: 'You go first so others know the way is safe.',
    strengths: ['Trailblazing', 'Risk-taking', 'Adventure spirit', 'Opening doors'],
  },
  {
    name: 'The Dreamer',
    tagline: 'Your imagination builds worlds yet to exist.',
    strengths: ['Vivid imagination', 'Hope creation', 'Idealism', 'Possibility thinking'],
  },
  {
    name: 'The Anchor',
    tagline: 'In any storm, you are the steady ground.',
    strengths: ['Stability', 'Groundedness', 'Dependability', 'Calm under pressure'],
  },
  {
    name: 'The Seeker',
    tagline: 'Your soul hungers for truths others never question.',
    strengths: ['Curiosity', 'Deep questioning', 'Knowledge pursuit', 'Open-mindedness'],
  },
  {
    name: 'The Nurturer',
    tagline: 'Growth happens wherever your attention lands.',
    strengths: ['Caring nature', 'Patience', 'Helping others grow', 'Gentle guidance'],
  },
  {
    name: 'The Wildfire',
    tagline: 'Your passion burns bright enough to light up rooms.',
    strengths: ['Intense energy', 'Passionate living', 'Enthusiasm', 'Energizing others'],
  },
  {
    name: 'The Weaver',
    tagline: 'You see the threads that connect all things.',
    strengths: ['Connection-making', 'Seeing relationships', 'Community building', 'Pattern seeing'],
  },
  {
    name: 'The Starlight',
    tagline: 'Even in darkness, you never stop shining.',
    strengths: ['Persistent hope', 'Quiet radiance', 'Inner light', 'Inspiring without trying'],
  },
]

// Mystical vibes (one-liners)
export const VIBE_SENTENCES = [
  'Your energy enters rooms before you do.',
  'People feel safe in your presence without knowing why.',
  'You carry ancient wisdom in a modern soul.',
  'Your vibe is that friend everyone needs but few deserve.',
  'Chaos calms when you decide to show up.',
  'You\'re the plot twist everyone needed.',
  'Main character energy, but make it humble.',
  'Your silence speaks louder than most people\'s words.',
  'You\'re proof that magic still exists.',
  'The universe literally shows off when making you.',
  'You make hard things look effortless.',
  'People remember exactly how you made them feel.',
  'You\'re the calm in everyone\'s storm.',
  'Your energy is a whole vibe check in itself.',
  'You don\'t chase; things flow to you.',
  'Your presence is a gift you don\'t even know you\'re giving.',
  'You make ordinary moments feel meaningful.',
  'Something about you just hits different.',
  'You\'re the reason people believe in good energy.',
  'Your vibe is \'rare but worth the wait.\'',
]

// Compatibility mapping
export const COMPATIBILITY: Record<string, string[]> = {
  purple: ['gold', 'white', 'cyan'],
  cyan: ['purple', 'green', 'blue'],
  gold: ['purple', 'orange', 'red'],
  pink: ['green', 'blue', 'white'],
  blue: ['pink', 'cyan', 'green'],
  green: ['pink', 'cyan', 'blue'],
  red: ['gold', 'orange', 'purple'],
  orange: ['gold', 'red', 'cyan'],
  white: ['purple', 'pink', 'gold'],
}

// Simple hash function
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Seeded random number generator
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = Math.sin(s) * 10000
    return s - Math.floor(s)
  }
}

export interface AuraReading {
  auraColor: keyof typeof AURA_COLORS
  auraData: typeof AURA_COLORS[keyof typeof AURA_COLORS]
  personality: typeof PERSONALITY_TYPES[number]
  vibeSentence: string
  energyLevels: {
    creativity: number
    confidence: number
    intuition: number
    passion: number
    wisdom: number
    calm: number
  }
  compatibleWith: string[]
}

export function generateAuraReading(filename: string, timestamp?: number): AuraReading {
  // Create a deterministic seed from filename + optional timestamp
  const seed = hashString(filename + (timestamp ? timestamp.toString() : ''))
  const random = seededRandom(seed)

  // Pick aura color
  const colorKeys = Object.keys(AURA_COLORS) as (keyof typeof AURA_COLORS)[]
  const auraColor = colorKeys[Math.floor(random() * colorKeys.length)]
  const auraData = AURA_COLORS[auraColor]

  // Pick personality type
  const personality = PERSONALITY_TYPES[Math.floor(random() * PERSONALITY_TYPES.length)]

  // Pick vibe sentence
  const vibeSentence = VIBE_SENTENCES[Math.floor(random() * VIBE_SENTENCES.length)]

  // Generate energy levels (40-95% range, feels realistic)
  const generateEnergy = () => Math.floor(random() * 55) + 40
  const energyLevels = {
    creativity: generateEnergy(),
    confidence: generateEnergy(),
    intuition: generateEnergy(),
    passion: generateEnergy(),
    wisdom: generateEnergy(),
    calm: generateEnergy(),
  }

  // Get compatible colors
  const compatibleWith = COMPATIBILITY[auraColor] || ['purple', 'gold']

  return {
    auraColor,
    auraData,
    personality,
    vibeSentence,
    energyLevels,
    compatibleWith,
  }
}
