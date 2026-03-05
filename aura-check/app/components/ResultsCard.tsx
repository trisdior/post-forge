'use client'

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { AuraReading, AURA_COLORS } from '@/lib/auraGenerator'
import EnergyBar from './EnergyBar'
import ShareButton from './ShareButton'

interface ResultsCardProps {
  reading: AuraReading
  imageUrl: string | null
  onReset: () => void
}

export default function ResultsCard({ reading, imageUrl, onReset }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { auraData, personality, vibeSentence, energyLevels, compatibleWith, auraColor } = reading

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <section className="min-h-screen px-4 py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold gradient-text mb-2">
            Your Aura Revealed ✨
          </h1>
          <p className="text-gray-400 text-sm">Your unique energy signature</p>
        </motion.div>

        {/* Main Card - Screenshot ready */}
        <motion.div
          ref={cardRef}
          variants={itemVariants}
          className={`
            relative rounded-3xl overflow-hidden
            glass-strong ${auraData.glow}
          `}
          id="aura-card"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 ${auraData.bgGradient} opacity-20`} />
          
          {/* Content */}
          <div className="relative z-10 p-6 md:p-8">
            {/* Aura Color Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* User photo with aura glow */}
                {imageUrl && (
                  <div className={`relative w-16 h-16 rounded-full ${auraData.glow}`}>
                    <div className={`absolute inset-0 rounded-full ${auraData.bgGradient} opacity-60 blur-md`} />
                    <img
                      src={imageUrl}
                      alt="Your photo"
                      className="relative w-full h-full rounded-full object-cover border-2 border-white/20"
                    />
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Your Aura</p>
                  <h2 className={`font-heading text-2xl md:text-3xl font-bold bg-gradient-to-r ${auraData.gradient} bg-clip-text text-transparent`}>
                    {auraData.name}
                  </h2>
                </div>
              </div>
              
              {/* Aura orb */}
              <div className={`w-12 h-12 rounded-full ${auraData.bgGradient} animate-pulse-slow`} />
            </div>

            {/* Aura Meaning */}
            <div className="mb-6 p-4 rounded-2xl bg-white/5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{auraData.meaning}</p>
              <p className="text-white/90">{auraData.description}</p>
            </div>

            {/* Personality Type */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔮</span>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Personality Type</p>
              </div>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
                {personality.name}
              </h3>
              <p className="text-purple-300 italic">&ldquo;{personality.tagline}&rdquo;</p>
            </div>

            {/* Energy Levels */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Energy Levels</p>
              <div className="space-y-3">
                <EnergyBar label="Creativity" value={energyLevels.creativity} color="from-orange-500 to-yellow-500" delay={0} />
                <EnergyBar label="Confidence" value={energyLevels.confidence} color="from-red-500 to-orange-500" delay={0.1} />
                <EnergyBar label="Intuition" value={energyLevels.intuition} color="from-purple-500 to-pink-500" delay={0.2} />
                <EnergyBar label="Passion" value={energyLevels.passion} color="from-pink-500 to-red-500" delay={0.3} />
                <EnergyBar label="Wisdom" value={energyLevels.wisdom} color="from-yellow-500 to-amber-600" delay={0.4} />
                <EnergyBar label="Calm" value={energyLevels.calm} color="from-cyan-500 to-blue-500" delay={0.5} />
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Your Strengths</p>
              <div className="flex flex-wrap gap-2">
                {personality.strengths.map((strength, i) => (
                  <motion.span
                    key={strength}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/90 border border-white/10"
                  >
                    {strength}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Vibe Sentence */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Your Vibe ✨</p>
              <p className="text-lg text-white font-medium">
                {vibeSentence}
              </p>
            </div>

            {/* Compatibility */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Compatible Auras</p>
              <div className="flex gap-3">
                {compatibleWith.map((color) => {
                  const compatColor = AURA_COLORS[color as keyof typeof AURA_COLORS]
                  return (
                    <motion.div
                      key={color}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10"
                    >
                      <div className={`w-4 h-4 rounded-full ${compatColor.bgGradient}`} />
                      <span className="text-sm text-white/80">{compatColor.name}</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Watermark */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500">
                ✨ auracheck.app
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-col gap-3"
        >
          <ShareButton cardRef={cardRef} auraColor={auraColor} />
          
          <button
            onClick={onReset}
            className="w-full py-3 rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
          >
            Try Another Photo
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}
