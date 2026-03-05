'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  overallScore: number;
  onSubscribe: () => void;
}

export default function Paywall({ overallScore, onSubscribe }: Props) {
  const [unlocking, setUnlocking] = useState(false);

  const handleSubscribe = () => {
    setUnlocking(true);
    localStorage.setItem('aura_subscribed', 'true');
    setTimeout(() => {
      onSubscribe();
    }, 600);
  };

  const handleRestore = () => {
    localStorage.setItem('aura_subscribed', 'true');
    onSubscribe();
  };

  const benefits = [
    'Unlimited face & aura scans',
    'Full feature breakdown with scores',
    'Country-by-country attractiveness ratings',
    'Rare badge collection',
    'Personalized glow-up tips with product recommendations',
    'Shareable results card',
    'New daily aura readings',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-5 py-10"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Blurred score teaser */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center glass rounded-3xl p-8 w-full relative overflow-hidden">
            <p className="text-gray-400 text-sm tracking-widest uppercase mb-3">Your Score</p>
            <div className="relative select-none" style={{ filter: 'blur(12px)' }}>
              <span className="font-heading text-7xl font-black bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                {overallScore}
              </span>
              <span className="text-gray-500 text-2xl font-heading">/10</span>
            </div>
            <p className="text-gray-500 text-xs mt-3">Your analysis is ready</p>
          </div>
        </motion.div>

        {/* Unlock header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="font-heading font-bold text-2xl text-white mb-1">
            Unlock Your Full Analysis ✦
          </h2>
          <p className="text-gray-500 text-sm">See your complete breakdown</p>
        </motion.div>

        {/* Pricing card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-3xl p-6 border border-purple-500/20"
        >
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-heading font-black text-4xl text-white">$4.99</span>
              <span className="text-gray-400 text-sm">/week</span>
            </div>
            <p className="text-gray-500 text-xs mt-1">Cancel anytime</p>
          </div>

          <div className="space-y-2.5 mb-6">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-2.5">
                <span className="text-purple-400 text-sm mt-0.5 shrink-0">✦</span>
                <span className="text-gray-300 text-sm">{b}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={unlocking}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 font-heading font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {unlocking ? 'Premium unlocked! 🎉' : 'Start Free Trial'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-3">
            3-day free trial, then $4.99/week
          </p>
        </motion.div>

        {/* Restore */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleRestore}
            className="text-gray-600 text-xs hover:text-gray-400 transition-colors underline underline-offset-2"
          >
            Restore Purchase
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
