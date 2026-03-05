'use client'

import { motion } from 'framer-motion'

interface EnergyBarProps {
  label: string
  value: number
  color: string
  delay?: number
}

export default function EnergyBar({ label, value, color, delay = 0 }: EnergyBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 + delay, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <span className="text-sm text-white/70 w-10 text-right">{value}%</span>
    </div>
  )
}
