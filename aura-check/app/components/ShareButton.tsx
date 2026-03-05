'use client'

import { useState, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShareButtonProps {
  cardRef: RefObject<HTMLDivElement>
  auraColor: string
}

export default function ShareButton({ cardRef, auraColor }: ShareButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleShare = async () => {
    if (!cardRef.current) return

    setIsDownloading(true)

    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
        logging: false,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `my-aura-${auraColor}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleShare()
      return
    }

    try {
      await navigator.share({
        title: 'My Aura Reading ✨',
        text: `I just discovered my aura! Check yours at auracheck.app`,
        url: window.location.href,
      })
    } catch (error) {
      // User cancelled or share failed, fall back to download
      if ((error as Error).name !== 'AbortError') {
        handleShare()
      }
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleShare}
        disabled={isDownloading}
        className="relative w-full py-4 rounded-full font-heading font-semibold text-lg overflow-hidden group"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-600" />
        
        {/* Shimmer */}
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isDownloading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Your Aura Card
            </>
          )}
        </span>
      </motion.button>

      {/* Share via native share button (mobile) */}
      {'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="w-full py-3 rounded-full border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:border-purple-400/50 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      )}

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 flex items-center gap-2 z-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Aura card saved! ✨
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
