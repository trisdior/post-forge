'use client';

import { motion } from 'framer-motion';
import { useRef, useCallback, useEffect, useState } from 'react';
import { AuraAnalysis } from '@/lib/types';
import { playRevealSound, setMuted } from '@/lib/sound';
import ShareCard from './ShareCard';

interface Props {
  analysis: AuraAnalysis;
  imageUrl: string;
  onReset: () => void;
  isPro?: boolean;
}

function ScoreBar({ label, score, delay, roast }: { label: string; score: number; delay: number; roast?: string }) {
  const pct = (score / 10) * 100;
  const color = score >= 8.5 ? 'from-emerald-400 to-cyan-400' : score >= 7 ? 'from-purple-400 to-pink-400' : 'from-amber-400 to-orange-400';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm w-28 shrink-0">{label}</span>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} score-bar-fill`}
            style={{ '--bar-width': `${pct}%`, '--bar-delay': `${delay}s` } as React.CSSProperties}
          />
        </div>
        <span className="text-white font-heading font-bold text-sm w-8 text-right">{score}</span>
      </div>
      {roast && (
        <p className="text-orange-400/80 text-xs mt-1 ml-[7.5rem] italic">{roast}</p>
      )}
    </motion.div>
  );
}

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target * 10) / 10;
      setCurrent(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCurrent(target);
        setDone(true);
      }
    };
    requestAnimationFrame(tick);
  }, [target]);

  return (
    <div className="relative">
      <motion.span
        className="font-heading text-7xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
        animate={done ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {current.toFixed(1)}
      </motion.span>
      <span className="text-gray-500 text-2xl font-heading">/10</span>
      {done && target > 8.0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -inset-8 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}20 0%, transparent 70%)` }}
        />
      )}
    </div>
  );
}

function ConfettiEffect() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][Math.floor(Math.random() * 6)],
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: '-5%', width: p.size, height: p.size, background: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: '120vh', opacity: 0, rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

function RizzGauge({ score, level }: { score: number; level: string }) {
  const pct = (score / 10) * 100;
  const gaugeColor = score >= 9 ? '#ef4444' : score >= 7 ? '#f59e0b' : score >= 5 ? '#8b5cf6' : '#6b7280';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-20 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
          <motion.path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251"
            initial={{ strokeDashoffset: 251 }}
            animate={{ strokeDashoffset: 251 - (pct / 100) * 251 }}
            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="font-heading text-2xl font-black text-white">{score}</span>
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="px-4 py-1 rounded-full text-sm font-heading font-bold"
        style={{ background: `${gaugeColor}25`, color: gaugeColor, border: `1px solid ${gaugeColor}40` }}
      >
        {level}
      </motion.span>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl glass-strong text-white text-sm font-medium shadow-xl"
    >
      {message}
    </motion.div>
  );
}

const badgeGlow: Record<string, string> = {
  legendary: 'shadow-[0_0_20px_rgba(251,191,36,0.5)] border-amber-400/60 bg-gradient-to-br from-amber-900/30 to-yellow-900/20',
  rare: 'shadow-[0_0_20px_rgba(168,85,247,0.5)] border-purple-400/60 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/20',
  uncommon: 'shadow-[0_0_20px_rgba(59,130,246,0.4)] border-blue-400/60 bg-gradient-to-br from-blue-900/30 to-cyan-900/20',
  common: 'shadow-[0_0_12px_rgba(156,163,175,0.3)] border-gray-400/40 bg-gradient-to-br from-gray-800/30 to-gray-900/20',
};

const rarityLabel: Record<string, string> = {
  legendary: 'text-amber-400',
  rare: 'text-purple-400',
  uncommon: 'text-blue-400',
  common: 'text-gray-400',
};

const featureKeyMap: Record<string, string> = {
  'Jawline': 'jawline',
  'Symmetry': 'symmetry',
  'Eyes': 'eyes',
  'Skin Clarity': 'skinClarity',
  'Bone Structure': 'boneStructure',
  'Harmony': 'harmony',
};

export default function Results({ analysis, imageUrl, onReset }: Props) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [mute, setMute] = useState(false);
  const [toast, setToast] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    playRevealSound();
    if (analysis.face.overall > 8.0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [analysis.face.overall]);

  const toggleMute = () => {
    const next = !mute;
    setMute(next);
    setMuted(next);
  };

  const handleDownload = useCallback(async () => {
    if (!shareRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(shareRef.current, { backgroundColor: '#050508', scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = 'aura-check-results.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    if (!shareRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(shareRef.current, { backgroundColor: '#050508', scale: 2, useCORS: true });
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share) {
        try {
          await navigator.share({ files: [new File([blob], 'aura-check.png', { type: 'image/png' })], title: 'My Aura Check Results' });
          return;
        } catch {}
      }
      const link = document.createElement('a');
      link.download = 'aura-check-results.png';
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  }, []);

  const handleChallenge = useCallback(async () => {
    const text = `I got ${analysis.face.overall}/10 on Aura Check 👀 Think you can beat me? auracheck.app`;
    try {
      await navigator.clipboard.writeText(text);
      setToast('Link copied! Send it 💬');
    } catch {
      setToast('Couldn\'t copy — try again!');
    }
  }, [analysis.face.overall]);

  const { aura, face, personality, glowUpTips, countryScores, badges, celebrityMatch, rizzScore, flags, vibeSong, roastMode } = analysis;

  const featureEntries: [string, number][] = [
    ['Jawline', face.features.jawline],
    ['Symmetry', face.features.symmetry],
    ['Eyes', face.features.eyes],
    ['Skin Clarity', face.features.skinClarity],
    ['Bone Structure', face.features.boneStructure],
    ['Harmony', face.features.harmony],
  ];

  const tierColors: Record<string, string> = {
    'Elite': 'from-amber-300 to-yellow-500',
    'Above Average': 'from-purple-400 to-pink-400',
    'Average': 'from-blue-400 to-cyan-400',
    'Rising': 'from-emerald-400 to-teal-400',
  };

  const bestCountry = countryScores.reduce((a, b) => a.score > b.score ? a : b, countryScores[0]);
  const sectionDelay = (i: number) => 0.2 + i * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen pb-20 relative ${face.overall > 9.0 ? 'animate-shake' : ''}`}
    >
      {showConfetti && <ConfettiEffect />}

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full glass flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
        title={mute ? 'Unmute' : 'Mute'}
      >
        {mute ? '🔇' : '🔊'}
      </button>

      <div className="max-w-lg mx-auto px-5 pt-8 space-y-6">
        {/* Header Score — Animated */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center glass rounded-3xl p-8 w-full relative overflow-hidden">
            {/* Aura color flash on reveal */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 2, delay: 2 }}
              style={{ background: `radial-gradient(circle, ${aura.color} 0%, transparent 70%)` }}
            />
            <p className="text-gray-400 text-sm tracking-widest uppercase mb-3">
              {roastMode ? '🔥 Roast Score' : 'Overall Score'}
            </p>
            <AnimatedScore target={face.overall} color={aura.color} />
            <div className={`mt-3 px-5 py-1.5 rounded-full bg-gradient-to-r ${tierColors[face.tier] || tierColors['Average']} text-black font-heading font-bold text-sm`}>
              {face.tier}
            </div>
          </div>
        </motion.div>

        {/* Celebrity Match */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(1) }}
          className="glass rounded-3xl p-6 text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${aura.color}40, transparent)` }}
          />
          <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">Celebrity Look-Alike</p>
          <p className="text-3xl mb-2">👀</p>
          <p className="font-heading font-bold text-xl text-white mb-1">
            You look <span style={{ color: aura.color }}>{celebrityMatch.matchPercent}%</span> like
          </p>
          <p className="font-heading font-black text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {celebrityMatch.name}
          </p>
        </motion.div>

        {/* Rizz Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(2) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-4 text-center">
            {roastMode ? '🔥 Rizz Check' : '✨ Rizz Score'}
          </h3>
          <RizzGauge score={rizzScore.score} level={rizzScore.level} />
          <p className="text-gray-300 text-sm text-center mt-4 leading-relaxed italic">
            &ldquo;{rizzScore.description}&rdquo;
          </p>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionDelay(3) }}
          >
            <h3 className="font-heading font-bold text-lg mb-3 text-center">Rare Badges</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
              {badges.map((badge) => (
                <motion.div
                  key={badge.name}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: sectionDelay(3) + 0.1 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${badgeGlow[badge.rarity]}`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className="text-white text-sm font-heading font-bold leading-tight">{badge.name}</p>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${rarityLabel[badge.rarity]}`}>{badge.rarity}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Aura Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(4) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: aura.color, boxShadow: `0 0 12px ${aura.color}` }} />
            Your Aura
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${aura.color}20`, boxShadow: `0 0 30px ${aura.color}30` }}
            >
              ✦
            </div>
            <div>
              <p className="font-heading font-bold text-lg" style={{ color: aura.color }}>{aura.name}</p>
              <p className="text-gray-400 text-sm">{aura.energy} Energy</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{aura.description}</p>
        </motion.div>

        {/* Face Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(5) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-5">Face Analysis</h3>
          <div className="space-y-3">
            {featureEntries.map(([label, score], i) => (
              <ScoreBar
                key={label}
                label={label}
                score={score}
                delay={sectionDelay(5) + 0.1 + i * 0.1}
                roast={roastMode && face.featureRoasts ? face.featureRoasts[featureKeyMap[label]] : undefined}
              />
            ))}
          </div>
        </motion.div>

        {/* Vibe Song */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(6) }}
          className="glass rounded-3xl p-5 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-green-500/20">
            {vibeSong.emoji.split('').slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Your Vibe Song</p>
            <p className="font-heading font-bold text-white text-sm truncate">{vibeSong.title}</p>
            <p className="text-gray-400 text-xs truncate">{vibeSong.artist}</p>
          </div>
          <div className="text-2xl shrink-0">{vibeSong.emoji}</div>
        </motion.div>

        {/* Green / Red Flags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(7) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-4">Your Flag Report</h3>
          <div className="space-y-3 mb-4">
            {flags.green.map((g, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-400 shrink-0">🟢</span>
                <p className="text-gray-300 text-sm">{g}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {flags.red.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-400 shrink-0">🔴</span>
                <p className="text-gray-300 text-sm">{r}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Country Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(8) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-2">Attractiveness by Country</h3>
          <p className="text-gray-500 text-xs mb-4">Based on regional beauty standards</p>
          <div className="grid grid-cols-2 gap-2.5">
            {countryScores.map((cs) => {
              const isBest = cs === bestCountry;
              return (
                <motion.div
                  key={cs.country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: sectionDelay(8) + 0.1 }}
                  className={`relative rounded-2xl p-3.5 text-center border transition-all ${
                    isBest
                      ? 'border-amber-400/50 bg-gradient-to-br from-amber-900/20 to-orange-900/10 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                      : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      🔥 Best Match
                    </span>
                  )}
                  <span className="text-2xl">{cs.flag}</span>
                  <p className="text-gray-300 text-xs mt-1 font-medium">{cs.country}</p>
                  <p className={`font-heading font-black text-xl mt-0.5 ${isBest ? 'text-amber-300' : 'text-white'}`}>{cs.score}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Personality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(9) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-3">
            {roastMode ? '🔥 Personality Roast' : 'Personality Archetype'}
          </h3>
          <p className="text-2xl font-heading font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {personality.archetype}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {personality.traits.map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                {t}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">Best with: <span className="text-purple-300">{personality.compatibility}</span></p>
        </motion.div>

        {/* Glow Up Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(10) }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="font-heading font-bold text-lg mb-4">
            {roastMode ? '🔥 Roast Tips' : '✨ Glow Up Tips'}
          </h3>
          <div className="space-y-3">
            {glowUpTips.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className={`${roastMode ? 'text-orange-400' : 'text-purple-400'} font-bold text-sm mt-0.5 shrink-0`}>{i + 1}.</span>
                <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shareable Card (hidden, rendered for capture) */}
        <div className="overflow-hidden" style={{ height: 0 }}>
          <div ref={shareRef}>
            <ShareCard analysis={analysis} imageUrl={imageUrl} />
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(11) }}
          className="flex gap-3 pt-2"
        >
          <button
            onClick={onReset}
            className="flex-1 py-4 rounded-2xl glass font-heading font-semibold text-gray-300 hover:bg-white/[0.08] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 font-heading font-semibold hover:opacity-90 transition-opacity"
          >
            Share ✦
          </button>
        </motion.div>

        {/* Challenge a Friend */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionDelay(12) }}
          onClick={handleChallenge}
          className="w-full py-4 rounded-2xl glass-strong font-heading font-semibold text-white hover:bg-white/[0.08] transition-colors border border-purple-500/20"
        >
          Challenge a Friend 👀
        </motion.button>

        {/* Save as image */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sectionDelay(13) }}
          onClick={handleDownload}
          className="w-full text-center text-gray-500 text-sm pb-4 hover:text-gray-300 transition-colors"
        >
          Save as image
        </motion.button>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sectionDelay(14) }}
          className="text-center text-gray-600 text-xs pb-8"
        >
          Made with ✦ by Aura Check — auracheck.app
        </motion.p>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </motion.div>
  );
}
