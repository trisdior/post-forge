'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TopNavProps {
  totalFollowers: number;
  totalRevenue: number;
  targetMonthly: number;
  daysToGoal: number;
}

export default function TopNav({ 
  totalFollowers, 
  totalRevenue, 
  targetMonthly,
  daysToGoal 
}: TopNavProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const percentage = Math.round((totalRevenue / targetMonthly) * 100);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-glass bg-dark-900/40 border-b border-glass shadow-glass"
    >
      <div className="px-8 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-8"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-2xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Mission Control
          </div>
          
          <div className="hidden lg:flex gap-6 text-xs">
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20 hover:bg-neon-cyan/10 transition-all"
              whileHover={{ borderColor: '#00d4ff' }}
            >
              <span className="text-gray-300">👥</span>
              <span className="text-gray-400">Followers:</span>
              <span className="text-neon-cyan font-bold">{totalFollowers.toLocaleString()}</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-green/5 border border-neon-green/20 hover:bg-neon-green/10 transition-all"
              whileHover={{ borderColor: '#00ff41' }}
            >
              <span className="text-gray-300">💰</span>
              <span className="text-gray-400">Revenue:</span>
              <span className="text-neon-green font-bold">${totalRevenue.toLocaleString()}/mo</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-orange/5 border border-neon-orange/20 hover:bg-neon-orange/10 transition-all"
              whileHover={{ borderColor: '#ff9500' }}
            >
              <span className="text-gray-300">🎯</span>
              <span className="text-gray-400">Progress:</span>
              <span className="text-neon-orange font-bold">{percentage}%</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-red/5 border border-neon-red/20 hover:bg-neon-red/10 transition-all"
              whileHover={{ borderColor: '#ff3333' }}
            >
              <span className="text-gray-300">⏱️</span>
              <span className="text-gray-400">Days:</span>
              <span className="text-neon-red font-bold">{daysToGoal}</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="text-right text-xs text-gray-400 px-4 py-2 rounded-lg bg-dark-800/50 border border-glass"
          whileHover={{ borderColor: 'rgba(0, 255, 65, 0.3)' }}
        >
          <div className="font-mono text-gray-300">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <div className="text-neon-green font-mono text-sm">{time}</div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
