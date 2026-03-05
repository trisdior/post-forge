'use client';

import { BusinessData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TrovvaTabProps {
  data: BusinessData;
}

const ideas = [
  { title: 'AI Employees (Task → Function)', status: 'Ready' },
  { title: 'The 3-Month AI Business Blueprint', status: 'Ready' },
  { title: 'Revenue Automation Stacks', status: 'Ready' },
  { title: 'Content as a Lead Generation Engine', status: 'Ready' },
  { title: 'The Creator Economy Playbook', status: 'Ready' },
];

export default function TrovvaTab({ data }: TrovvaTabProps) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const launchDate = new Date('2026-03-01');
    const now = new Date();
    const diff = launchDate.getTime() - now.getTime();
    setDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-4xl">💡</span>
            <span className="bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent ml-3">
              Trovva AI
            </span>
          </h1>
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan"></span>
            <span className="text-neon-cyan font-bold">Pre-Launch</span>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-cyan/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Twitter Followers</div>
            <div className="text-4xl font-bold text-neon-cyan">{data.trovva.followers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: 5,000</div>
          </motion.div>
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-green/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Monthly Revenue</div>
            <div className="text-4xl font-bold text-neon-green">${data.trovva.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: $5k/mo</div>
          </motion.div>
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-orange/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Newsletter Subscribers</div>
            <div className="text-4xl font-bold text-neon-orange">0</div>
            <div className="text-xs text-gray-500 mt-2">Goal: 100</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Launch Countdown & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countdown */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-neon-cyan/20 to-neon-blue/10 backdrop-blur-glass border border-neon-cyan/30 rounded-2xl p-8 shadow-glass"
        >
          <h2 className="text-2xl font-bold mb-6 text-neon-cyan flex items-center gap-3">
            <span>⏱️</span> Launch Countdown
          </h2>
          <motion.div 
            className="text-center py-8"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl font-bold text-neon-cyan mb-2">{daysLeft}</div>
            <div className="text-gray-400">days until launch</div>
            <div className="text-sm text-neon-cyan mt-4 font-mono">Monday, March 1, 2026</div>
          </motion.div>
        </motion.div>

        {/* Ideas Extracted */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>📚</span>
            <span className="text-neon-green">Ideas Status</span>
          </h2>
          <div className="space-y-3">
            <motion.div 
              className="flex items-center justify-between p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl"
              whileHover={{ x: 8 }}
            >
              <span className="text-gray-100 font-medium">Ideas Extracted</span>
              <span className="text-2xl font-bold text-neon-green">15/15</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-between p-4 bg-neon-orange/10 border border-neon-orange/30 rounded-xl"
              whileHover={{ x: 8 }}
            >
              <span className="text-gray-100 font-medium">Week 1 Ready</span>
              <span className="text-2xl font-bold text-neon-orange">5/5</span>
            </motion.div>
            <motion.div 
              className="flex items-center justify-between p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl"
              whileHover={{ x: 8 }}
            >
              <span className="text-gray-100 font-medium">Selected</span>
              <span className="text-2xl font-bold text-neon-cyan">5/15</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bars */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span>📈</span>
          <span className="text-neon-green">Growth Targets</span>
        </h2>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-100">Follower Target</span>
              <span className="text-neon-cyan font-bold">{data.trovva.followers.toLocaleString()} / 5,000</span>
            </div>
            <ProgressBar current={data.trovva.followers} target={5000} color="cyan" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-100">Revenue Target</span>
              <span className="text-neon-green font-bold">${data.trovva.revenue.toLocaleString()} / $5,000</span>
            </div>
            <ProgressBar current={data.trovva.revenue} target={5000} color="green" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-100">Newsletter Target</span>
              <span className="text-neon-orange font-bold">0 / 100</span>
            </div>
            <ProgressBar current={0} target={100} color="orange" />
          </motion.div>
        </div>
      </motion.div>

      {/* Week 1 Ideas */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🎬</span>
          <span className="text-neon-green">Week 1 Content Ideas</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-4 bg-dark-800/50 border border-glass rounded-xl hover:border-neon-green/50 hover:bg-dark-700/50 transition-all cursor-pointer group"
              whileHover={{ y: -3 }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-gray-100 font-medium group-hover:text-neon-green transition-colors">
                  {idea.title}
                </p>
                <span className="px-2 py-1 rounded text-xs bg-neon-green/20 text-neon-green font-bold whitespace-nowrap">
                  {idea.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
