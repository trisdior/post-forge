'use client'

import { motion } from 'framer-motion'

interface LandingSectionProps {
  onStart: () => void
}

export default function LandingSection({ onStart }: LandingSectionProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
        className="mb-8"
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-30 blur-xl animate-pulse-slow" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-40 blur-lg animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
          
          {/* Main orb */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 via-violet-500 to-cyan-500 animate-spin-slow" />
          <div className="absolute inset-6 rounded-full bg-aura-dark/80 backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl md:text-4xl">✨</span>
          </div>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4"
      >
        <span className="gradient-text">Discover Your Aura</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl text-gray-400 text-center max-w-md mb-8"
      >
        Upload a selfie and let AI reveal your energy, vibe, and cosmic personality.
      </motion.p>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="group relative px-8 py-4 rounded-full font-heading font-semibold text-lg overflow-hidden"
      >
        {/* Button gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-600 transition-all duration-300 group-hover:opacity-90" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 shimmer" />
        
        {/* Button text */}
        <span className="relative z-10 flex items-center gap-2">
          Check My Aura
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </motion.button>

      {/* Social proof / fun stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="flex -space-x-2">
            {['🟣', '🔵', '🟡', '🟢', '🔴'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border-2 border-aura-dark">
                <span className="text-xs">{emoji}</span>
              </div>
            ))}
          </div>
          <span>12,847 auras discovered today</span>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-gray-600 text-sm flex flex-col items-center gap-2"
        >
          <span>What&apos;s your color?</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
