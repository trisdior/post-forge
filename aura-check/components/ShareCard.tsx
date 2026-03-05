'use client';

import { AuraAnalysis } from '@/lib/types';

interface Props {
  analysis: AuraAnalysis;
  imageUrl: string;
}

const badgeColors: Record<string, string> = {
  legendary: '#fbbf24',
  rare: '#a855f7',
  uncommon: '#3b82f6',
  common: '#9ca3af',
};

export default function ShareCard({ analysis }: Props) {
  const { aura, face, personality, shareCard, countryScores, badges, celebrityMatch, rizzScore, vibeSong } = analysis;
  const features = face.features;
  const bestCountry = countryScores.reduce((a, b) => a.score > b.score ? a : b, countryScores[0]);

  // 9:16 aspect ratio (1080x1920 scaled down to 360x640)
  return (
    <div
      className="text-white"
      style={{ width: 360, height: 640, background: '#0a0a0f', fontFamily: 'system-ui, -apple-system, sans-serif', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      {/* Top gradient accent */}
      <div>
        <div style={{ height: 4, borderRadius: 4, background: shareCard.gradient, marginBottom: 16 }} />

        {/* Title + Score */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', color: '#6b7280', textTransform: 'uppercase' as const, marginBottom: 4 }}>Aura Check</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 900 }}>{face.overall}</span>
            <span style={{ fontSize: 18, color: '#6b7280' }}>/10</span>
          </div>
          <span
            style={{ display: 'inline-block', marginTop: 6, padding: '3px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#000', background: aura.color }}
          >
            {face.tier}
          </span>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' as const }}>
            {badges.map((badge) => (
              <span
                key={badge.name}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, border: `1px solid ${badgeColors[badge.rarity]}60`, background: `${badgeColors[badge.rarity]}15`, color: badgeColors[badge.rarity] }}
              >
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        )}

        {/* Celebrity Match */}
        <div style={{ textAlign: 'center', padding: '8px 0', marginBottom: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>Celebrity Look-Alike</p>
          <p style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>
            <span style={{ color: aura.color }}>{celebrityMatch.matchPercent}%</span> {celebrityMatch.name}
          </p>
        </div>

        {/* Rizz + Vibe Song row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
            <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' as const }}>Rizz</p>
            <p style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>{rizzScore.score}</p>
            <p style={{ fontSize: 10, color: '#a855f7', fontWeight: 700 }}>{rizzScore.level}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
            <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' as const }}>Vibe Song</p>
            <p style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{vibeSong.emoji}</p>
            <p style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{vibeSong.title}</p>
            <p style={{ fontSize: 9, color: '#9ca3af' }}>{vibeSong.artist}</p>
          </div>
        </div>

        {/* Aura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: `${aura.color}25`, flexShrink: 0 }}>✦</div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 12, color: aura.color }}>{aura.name}</p>
            <p style={{ color: '#6b7280', fontSize: 10 }}>{aura.energy} Energy · {personality.archetype}</p>
          </div>
        </div>

        {/* Feature scores grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
          {([
            ['Jawline', features.jawline],
            ['Symmetry', features.symmetry],
            ['Eyes', features.eyes],
            ['Skin', features.skinClarity],
            ['Bone', features.boneStructure],
            ['Harmony', features.harmony],
          ] as [string, number][]).map(([label, score]) => (
            <div key={label} style={{ textAlign: 'center', padding: '6px 0', borderRadius: 10, background: 'rgba(255,255,255,0.04)' }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{score}</p>
              <p style={{ color: '#6b7280', fontSize: 9 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Best Country */}
        <div style={{ textAlign: 'center', padding: 8, borderRadius: 12, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 8 }}>
          <p style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>Best Match</p>
          <p style={{ fontSize: 14 }}>
            {bestCountry.flag} <span style={{ fontWeight: 700, color: '#fcd34d' }}>{bestCountry.score}</span>
            <span style={{ color: '#6b7280', fontSize: 11 }}> in {bestCountry.country}</span>
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div>
        {/* Tagline */}
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 11, fontStyle: 'italic', marginBottom: 12 }}>&ldquo;{shareCard.tagline}&rdquo;</p>

        {/* QR placeholder + watermark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#a855f7' }}>auracheck.app</p>
            <p style={{ fontSize: 9, color: '#4b5563' }}>✦ Discover your aura</p>
          </div>
          <div style={{ width: 50, height: 50, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, color: '#4b5563', textAlign: 'center' }}>
            Scan to<br />try
          </div>
        </div>
      </div>
    </div>
  );
}
