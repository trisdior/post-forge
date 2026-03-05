'use client';

import { motion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';

interface Props {
  onImageSelected: (file: File) => void;
}

export default function Upload({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-heading text-2xl sm:text-3xl font-bold text-center mb-2"
      >
        Upload Your Selfie
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 text-center mb-8"
      >
        Front-facing, good lighting works best
      </motion.p>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-sm aspect-square rounded-3xl glass cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
          isDragging ? 'border-purple-400 bg-purple-500/10 scale-105' : 'hover:border-purple-500/30 hover:bg-white/[0.03]'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
            <path d="M12 16V8m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 16.5v2a2.5 2.5 0 002.5 2.5h13a2.5 2.5 0 002.5-2.5v-2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-medium">Tap to upload</p>
          <p className="text-gray-500 text-sm mt-1">or drag & drop</p>
        </div>
      </motion.div>

      {/* Camera button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'user';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
        className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/[0.08] transition-colors text-gray-300"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        Take a selfie
      </motion.button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </motion.div>
  );
}
