'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const PHASES_HYPE = [
  'Detecting facial landmarks...',
  'Measuring golden ratio...',
  'Mapping bone structure...',
  'Reading energy wavelength...',
  'Analyzing aura frequency...',
  'Cross-referencing celebrity database...',
  'Calculating rizz potential...',
  'Scanning personality matrix...',
  'Measuring vibe compatibility...',
  'Generating your report...',
];

const PHASES_ROAST = [
  'Detecting facial landmarks...',
  'Measuring golden ratio... oof...',
  'Mapping bone structure...',
  'Reading energy wavelength...',
  'Cross-referencing celebrity database...',
  'Calculating rizz potential... this may take a while...',
  'Loading roast material... 🔥',
  'Consulting the burn unit...',
  'Preparing emotional damage...',
  'Generating your report...',
];

interface Props {
  roastMode?: boolean;
}

export default function Analyzing({ roastMode }: Props) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const PHASES = roastMode ? PHASES_ROAST : PHASES_HYPE;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % PHASES.length);
    }, 500);
    return () => clearInterval(interval);
  }, [PHASES.length]);

  useEffect(() => {
    const start = Date.now();
    const duration = 4800;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      {/* Face outline with scanning effect */}
      <div className="relative w-52 h-52 mb-8">
        {/* Pulsing border */}
        <motion.div
          className="absolute -inset-3 rounded-3xl border-2 border-purple-500/30"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Grid overlay */}
          {[40, 60, 80, 100, 120, 140, 160].map(x => (
            <line key={`v${x}`} x1={x} y1="30" x2={x} y2="170" stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
          ))}
          {[40, 60, 80, 100, 120, 140, 160].map(y => (
            <line key={`h${y}`} x1="30" y1={y} x2="170" y2={y} stroke="rgba(139,92,246,0.08)" strokeWidth="0.5" />
          ))}
          {/* Face outline */}
          <ellipse cx="100" cy="105" rx="55" ry="70" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" className="face-trace" />
          <ellipse cx="78" cy="88" rx="10" ry="6" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" className="face-trace" style={{ animationDelay: '0.5s' }} />
          <ellipse cx="122" cy="88" rx="10" ry="6" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1" className="face-trace" style={{ animationDelay: '0.5s' }} />
          <path d="M100 95 L95 115 L105 115" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" className="face-trace" style={{ animationDelay: '0.8s' }} />
          <path d="M85 128 Q100 138 115 128" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1" className="face-trace" style={{ animationDelay: '1s' }} />
          <line x1="45" y1="105" x2="55" y2="105" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" className="face-trace" style={{ animationDelay: '1.2s' }} />
          <line x1="145" y1="105" x2="155" y2="105" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" className="face-trace" style={{ animationDelay: '1.2s' }} />
          {/* Measurement lines */}
          <line x1="78" y1="75" x2="122" y2="75" stroke="rgba(6,182,212,0.3)" strokeWidth="0.5" strokeDasharray="3,3" className="face-trace" style={{ animationDelay: '1.5s' }} />
          <line x1="100" y1="38" x2="100" y2="170" stroke="rgba(6,182,212,0.15)" strokeWidth="0.5" strokeDasharray="3,3" className="face-trace" style={{ animationDelay: '1.8s' }} />
        </svg>

        {/* Scanning line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent scan-line" style={{ filter: 'blur(0.5px)' }} />

        {/* Corner brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-purple-500/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-purple-500/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-purple-500/50 rounded-br-lg" />
      </div>

      {/* Progress percentage */}
      <motion.p
        className="font-heading text-4xl font-black text-white mb-3"
        key={progress}
      >
        {progress}%
      </motion.p>

      {/* Progress bar */}
      <div className="w-64 h-1.5 rounded-full bg-white/10 mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase text */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-purple-300 font-medium text-center text-sm"
      >
        {PHASES[phase]}
      </motion.p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
