export interface AuraAnalysis {
  aura: {
    color: string;
    name: string;
    description: string;
    energy: string;
  };
  face: {
    overall: number;
    tier: string;
    features: {
      jawline: number;
      symmetry: number;
      eyes: number;
      skinClarity: number;
      boneStructure: number;
      harmony: number;
    };
    featureRoasts?: Record<string, string>;
  };
  personality: {
    archetype: string;
    traits: string[];
    compatibility: string;
  };
  glowUpTips: string[];
  shareCard: {
    gradient: string;
    tagline: string;
  };
  countryScores: { country: string; flag: string; score: number }[];
  badges: { name: string; icon: string; rarity: 'legendary' | 'rare' | 'uncommon' | 'common' }[];
  celebrityMatch: {
    name: string;
    matchPercent: number;
  };
  rizzScore: {
    score: number;
    level: string;
    description: string;
  };
  flags: {
    green: string[];
    red: string[];
  };
  vibeSong: {
    title: string;
    artist: string;
    emoji: string;
  };
  roastMode?: boolean;
}
