'use client'

import { useCallback, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface UploadSectionProps {
  onFileUpload: (file: File) => void
  onBack: () => void
}

export default function UploadSection({ onFileUpload, onBack }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (selectedFile) {
      onFileUpload(selectedFile)
    }
  }, [selectedFile, onFileUpload])

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-20"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-heading text-3xl md:text-4xl font-bold text-center mb-2"
      >
        {preview ? 'Ready to Read Your Aura' : 'Upload Your Selfie'}
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 text-center mb-8"
      >
        {preview ? 'Tap "Read My Aura" to begin' : 'We\'ll read your energy and reveal your aura'}
      </motion.p>

      {/* Upload Zone / Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        {preview ? (
          /* Preview Mode */
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2 border-purple-500/50">
              <img 
                src={preview} 
                alt="Your selfie" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />
            </div>

            <div className="flex gap-4 w-full max-w-xs">
              <button
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                className="flex-1 py-3 px-6 rounded-2xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
              >
                Change
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Read My Aura ✨
              </button>
            </div>
          </div>
        ) : (
          /* Upload Mode */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative flex flex-col items-center justify-center w-full h-80 
              rounded-3xl border-2 border-dashed cursor-pointer
              transition-all duration-300 overflow-hidden
              ${isDragging 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-700 hover:border-purple-500/50 bg-white/5'
              }
            `}
          >
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-4 p-6">
              <motion.div
                animate={{ 
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1 
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </motion.div>

              <div className="text-center">
                <p className="text-white font-medium mb-1">
                  {isDragging ? 'Drop it like it\'s hot ✨' : 'Tap to take or choose a selfie'}
                </p>
                <p className="text-gray-500 text-sm">or drag & drop on desktop</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Any image
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private & secure
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-500 text-sm">
          💡 Tip: Use a clear, well-lit photo for the best reading
        </p>
      </motion.div>
    </section>
  )
}
