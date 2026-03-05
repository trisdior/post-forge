'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AnalyzingScreenProps {
  imageUrl: string | null
}

const loadingMessages = [
  'Reading your energy field...',
  'Detecting vibrational frequencies...',
  'Analyzing chakra alignment...',
  'Scanning emotional wavelengths...',
  'Interpreting your cosmic signature...',
  'Almost there...',
]

export default function AnalyzingScreen({ imageUrl }: AnalyzingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Main analyzing animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
        {/* Outer pulsing rings */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-purple-500/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ 
              scale: [1, 1.5, 2],
              opacity: [0.6, 0.3, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut'
            }}
          />
        ))}

        {/* Spinning gradient ring */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #06b6d4, #f59e0b, #ec4899, #8b5cf6)',
            padding: '3px',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full bg-aura-dark" />
        </motion.div>

        {/* Inner glow */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-xl" />

        {/* User image */}
        {imageUrl && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="absolute inset-12 rounded-full overflow-hidden border-2 border-white/10"
          >
            <img
              src={imageUrl}
              alt="Your photo"
              className="w-full h-full object-cover"
            />
            {/* Scan overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Floating particles around the image */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 140
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-purple-500"
              style={{
                left: '50%',
                top: '50%',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)'
              }}
              animate={{
                x: [
                  Math.cos(angle) * radius,
                  Math.cos(angle + 0.5) * radius,
                  Math.cos(angle) * radius
                ],
                y: [
                  Math.sin(angle) * radius,
                  Math.sin(angle + 0.5) * radius,
                  Math.sin(angle) * radius
                ],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          )
        })}
      </div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 gradient-text">
          Analyzing Your Aura
        </h2>
        
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-gray-400"
        >
          {loadingMessages[messageIndex]}
        </motion.p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </section>
  )
}
