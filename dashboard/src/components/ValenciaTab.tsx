'use client';

import { BusinessData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';

interface ValenciaTabProps {
  data: BusinessData;
}

export default function ValenciaTab({ data }: ValenciaTabProps) {
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

  const metrics = [
    { label: 'Contacts Made', current: 0, target: 25, icon: '📞' },
    { label: 'Doors Knocked', current: 0, target: 50, icon: '🚪' },
    { label: 'Posts Made', current: 0, target: 5, icon: '📝' },
    { label: 'Gym Sessions', current: 0, target: 6, icon: '💪' },
    { label: 'Estimates Sent', current: 0, target: 3, icon: '📄' },
  ];

  const milestones = [
    { date: 'Feb 28', goal: 'Get 1 consultation booked' },
    { date: 'Mar 7', goal: 'Close first client' },
    { date: 'Mar 14', goal: 'Deploy AI automation system' },
    { date: 'Mar 21', goal: 'Document case study' },
  ];

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
            <span className="text-4xl">🏗️</span>
            <span className="bg-gradient-to-r from-neon-orange to-neon-green bg-clip-text text-transparent ml-3">
              Valencia Construction
            </span>
          </h1>
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 bg-neon-orange/10 border border-neon-orange/30 rounded-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-orange"></span>
            <span className="text-neon-orange font-bold">In Progress</span>
          </motion.div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-orange/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Current Clients</div>
            <div className="text-4xl font-bold text-neon-orange">{data.valencia.clients}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: 10 clients by March</div>
          </motion.div>
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-green/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Monthly Revenue</div>
            <div className="text-4xl font-bold text-neon-green">${data.valencia.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: $15k/mo by year-end</div>
          </motion.div>
        </div>
      </motion.div>

      {/* 9-Day Plan Progress */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>📊</span>
          <span className="bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent">
            9-Day Plan Progress (Feb 20-28)
          </span>
        </h2>

        <div className="space-y-5">
          {metrics.map((metric, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{metric.icon}</span>
                <span className="font-semibold text-gray-100 flex-1">{metric.label}</span>
                <span className="text-neon-orange font-bold">{metric.current}/{metric.target}</span>
              </div>
              <ProgressBar current={metric.current} target={metric.target} color="orange" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Activity & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>🎯</span>
            <span className="text-neon-cyan">Next Milestones</span>
          </h3>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <motion.div 
                key={idx}
                className="flex items-start gap-4 p-4 bg-dark-800/30 border border-glass rounded-xl hover:bg-dark-700/50 transition-all"
                whileHover={{ x: 8 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="px-3 py-1 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs font-bold h-fit">
                  {m.date}
                </div>
                <div className="flex-1">
                  <p className="text-gray-100 font-medium">{m.goal}</p>
                </div>
                <span className="text-neon-cyan">→</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Daily Activity */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>📅</span>
            <span className="text-neon-green">Daily Activity</span>
          </h3>
          <div className="space-y-4">
            <motion.div 
              className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">Calls Made Today</div>
              <div className="text-3xl font-bold text-neon-green">0</div>
              <div className="text-xs text-gray-500 mt-2">Target: 3 calls/day</div>
            </motion.div>
            <motion.div 
              className="p-4 bg-neon-orange/10 border border-neon-orange/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">Posts This Week</div>
              <div className="text-3xl font-bold text-neon-orange">0</div>
              <div className="text-xs text-gray-500 mt-2">Target: 5 posts by Friday</div>
            </motion.div>
            <motion.div 
              className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">Gym Sessions</div>
              <div className="text-3xl font-bold text-neon-cyan">0</div>
              <div className="text-xs text-gray-500 mt-2">Target: 6 sessions by Sunday</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
