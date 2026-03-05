'use client';

import { BusinessData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface DashboardViewProps {
  data: BusinessData;
  daysToGoal?: number;
}

const neonTextColor: Record<string, string> = {
  'neon-green': 'text-neon-green',
  'neon-cyan': 'text-neon-cyan',
  'neon-orange': 'text-neon-orange',
  'neon-red': 'text-neon-red',
  'neon-pink': 'text-neon-pink',
  'neon-blue': 'text-neon-blue',
};

export default function DashboardView({ data, daysToGoal = 0 }: DashboardViewProps) {
  const [checklist, setChecklist] = useState([
    { task: 'Make 3 calls (Valencia)', completed: false },
    { task: 'Write Trovva content (5 ideas)', completed: false },
    { task: 'Spawn Delvrai agent', completed: false },
    { task: 'Publish first Trovva posts', completed: false },
    { task: 'Close first client', completed: false },
  ]);

  const toggleTask = (idx: number) => {
    const updated = [...checklist];
    updated[idx].completed = !updated[idx].completed;
    setChecklist(updated);
  };

  const percentage = Math.round((data.totalRevenue / data.targetMonthly) * 100);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
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
      {/* Revenue Tracker - Big Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass hover:shadow-neon-green/30 transition-all"
      >
        <motion.h2 
          className="text-3xl font-bold mb-8 flex items-center gap-3"
          whileHover={{ x: 5 }}
        >
          <span className="text-3xl">💰</span>
          <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            REVENUE TRACKER
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { name: 'Valencia Construction', revenue: data.valencia.revenue, status: data.valencia.status, color: 'neon-green' },
            { name: 'Trovva AI', revenue: data.trovva.revenue, status: data.trovva.status, color: 'neon-cyan' },
            { name: 'Delvrai', revenue: data.delvrai.revenue, status: data.delvrai.status, color: 'neon-orange' }
          ].map((vertical, i) => (
            <motion.div 
              key={i}
              className={`bg-dark-800/50 backdrop-blur-glass border border-glass rounded-xl p-6 hover:bg-dark-700/50 transition-all group cursor-pointer`}
              whileHover={{ y: -5, borderColor: 'rgba(0, 255, 65, 0.3)' }}
              variants={itemVariants}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-100 group-hover:text-neon-green transition-colors">{vertical.name}</h3>
                <span className={`text-2xl font-bold text-neon-${vertical.color === 'neon-green' ? 'green' : vertical.color === 'neon-cyan' ? 'cyan' : 'orange'}`}>
                  ${vertical.revenue.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-400">{vertical.status}</div>
              <div className="mt-4 pt-4 border-t border-glass text-xs text-neon-cyan">→ View Details</div>
            </motion.div>
          ))}
        </div>

        {/* Total Progress */}
        <motion.div 
          className="bg-dark-900/50 border border-neon-green/30 rounded-xl p-6"
          whileHover={{ borderColor: 'rgba(0, 255, 65, 0.5)' }}
        >
          <div className="flex justify-between items-baseline mb-4">
            <span className="font-bold text-lg text-gray-100">Monthly Total</span>
            <span className="text-4xl font-bold text-neon-green">${data.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Goal: <span className="text-neon-green font-bold">${data.targetMonthly.toLocaleString()}</span> • <span className="text-neon-orange">{percentage}%</span> Progress
          </div>
          <ProgressBar 
            current={data.totalRevenue} 
            target={data.targetMonthly}
            color="green"
          />
        </motion.div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Days to Goal', value: daysToGoal, icon: '⏱️', color: 'neon-red' },
          { label: 'Total Followers', value: data.totalFollowers, icon: '👥', color: 'neon-cyan' },
          { label: 'Monthly Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: '💎', color: 'neon-green' }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            className="bg-dark-800/40 backdrop-blur-glass border border-glass rounded-xl p-6 text-center hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-3xl mb-3">{metric.icon}</div>
            <div className="text-gray-400 text-sm mb-2">{metric.label}</div>
            <div className={`text-3xl font-bold ${neonTextColor[metric.color] || 'text-neon-green'}`}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* This Week's Checklist */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <motion.h2 
          className="text-2xl font-bold mb-6 flex items-center gap-3"
          whileHover={{ x: 5 }}
        >
          <span className="text-2xl">✅</span>
          <span className="bg-gradient-to-r from-neon-orange to-neon-red bg-clip-text text-transparent">
            THIS WEEK'S CHECKLIST
          </span>
        </motion.h2>

        <div className="space-y-3">
          {checklist.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/30 border border-glass hover:bg-dark-700/50 transition-all cursor-pointer group"
              onClick={() => toggleTask(idx)}
              whileHover={{ x: 8 }}
            >
              <motion.input 
                type="checkbox" 
                checked={item.completed}
                onChange={() => {}}
                className="w-6 h-6 rounded cursor-pointer accent-neon-green"
                whileHover={{ scale: 1.2 }}
              />
              <motion.span 
                className={`flex-1 font-medium transition-all ${
                  item.completed 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-100 group-hover:text-neon-green'
                }`}
                animate={item.completed ? { opacity: 0.5 } : { opacity: 1 }}
              >
                {item.task}
              </motion.span>
              <motion.div 
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.completed 
                    ? 'bg-neon-green/20 text-neon-green' 
                    : 'bg-gray-600/20 text-gray-400 group-hover:bg-neon-orange/20 group-hover:text-neon-orange'
                }`}
                animate={item.completed ? { scale: 1.05 } : { scale: 1 }}
              >
                {item.completed ? 'Done' : 'Pending'}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
