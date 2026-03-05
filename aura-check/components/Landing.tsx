'use client';

import { motion } from 'framer-motion';

interface Props {
  onStart: () => void;
  roastMode: boolean;
  onToggleRoast: () => void;
}

export default function Landing({ onStart, roastMode, onToggleRoast }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, delay: 0.2 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30"
      >
        <span className="text-3xl">✦</span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-purple-400 text-sm font-medium tracking-[0.3em] uppercase mb-4"
      >
        Aura Check
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
      >
        <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
          Discover Your Aura.
        </span>
        <br />
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Analyze Your Face.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-gray-400 text-lg max-w-md mb-8"
      >
        AI-powered analysis of your facial features and energy signature. See what the universe sees.
      </motion.p>

      {/* Roast Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8"
      >
        <button
          onClick={onToggleRoast}
          className="relative flex items-center gap-3 px-5 py-3 rounded-2xl glass hover:bg-white/[0.06] transition-all group"
        >
          <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${roastMode ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${roastMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-gray-300">
            {roastMode ? '🔥 Roast Mode' : '✨ Hype Mode'}
          </span>
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="relative group px-10 py-4 rounded-2xl font-heading font-semibold text-lg overflow-hidden"
      >
        <div className={`absolute inset-0 rounded-2xl ${roastMode ? 'bg-gradient-to-r from-orange-600 via-red-500 to-pink-500' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500'}`} />
        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity ${roastMode ? 'bg-gradient-to-r from-orange-600 via-red-500 to-pink-500' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500'}`} />
        <span className="relative z-10">{roastMode ? 'Roast Me 🔥' : 'Check My Aura ✦'}</span>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8 text-gray-600 text-xs"
      >
        No photos stored · Instant results · 100% free
      </motion.p>
    </motion.div>
  );
}
