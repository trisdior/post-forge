'use client';

import { BusinessData } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';

interface DelvRaiTabProps {
  data: BusinessData;
}

export default function DelvRaiTab({ data }: DelvRaiTabProps) {
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

  const features = [
    { name: 'Lead generation automation', icon: '🎯' },
    { name: 'Lead qualification system', icon: '🔍' },
    { name: 'Proposal generation (30 sec)', icon: '📄' },
    { name: 'Appointment scheduling', icon: '📅' },
    { name: 'Follow-up sequences', icon: '📧' },
    { name: 'Review collection automation', icon: '⭐' },
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
            <span className="text-4xl">🤖</span>
            <span className="bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent ml-3">
              Delvrai
            </span>
          </h1>
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 bg-neon-orange/10 border border-neon-orange/30 rounded-lg"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-orange"></span>
            <span className="text-neon-orange font-bold">Planning</span>
          </motion.div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-orange/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Current Clients</div>
            <div className="text-4xl font-bold text-neon-orange">{data.delvrai.clients}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: 10 clients by April</div>
          </motion.div>
          <motion.div 
            className="bg-dark-800/50 backdrop-blur-glass border border-neon-green/30 rounded-xl p-6 hover:bg-dark-700/50 transition-all"
            whileHover={{ y: -5 }}
          >
            <div className="text-gray-400 text-sm mb-2">Monthly Revenue</div>
            <div className="text-4xl font-bold text-neon-green">${data.delvrai.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Goal: $15k/mo</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Service & Company Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Offering */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>🎁</span>
            <span className="text-neon-cyan">Service Offering</span>
          </h2>

          <motion.div className="mb-6 p-6 bg-neon-blue/10 border border-neon-blue/30 rounded-xl">
            <p className="font-bold text-gray-100 mb-2">AI Automation System</p>
            <p className="text-sm text-gray-300 mb-3">
              Complete lead-to-close automation for contractors nationwide
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Monthly Price</p>
                <p className="text-2xl font-bold text-neon-green">$1,500</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Commission</p>
                <p className="text-2xl font-bold text-neon-orange">30%</p>
              </div>
            </div>
          </motion.div>

          <h3 className="font-bold text-gray-100 mb-4">Features:</h3>
          <div className="space-y-3">
            {features.map((f, idx) => (
              <motion.div 
                key={idx}
                className="flex items-center gap-3 p-3 bg-dark-800/30 border border-glass rounded-lg hover:bg-dark-700/50 transition-all"
                whileHover={{ x: 8 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-gray-200">{f.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>📊</span>
            <span className="text-neon-pink">Sales Pipeline</span>
          </h2>

          <div className="space-y-4 mb-8">
            <motion.div 
              className="p-5 bg-neon-blue/10 border border-neon-blue/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">Prospects</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-neon-blue">0</div>
                <span className="text-xs text-gray-500">in funnel</span>
              </div>
            </motion.div>

            <motion.div 
              className="p-5 bg-neon-orange/10 border border-neon-orange/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">In Discussion</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-neon-orange">0</div>
                <span className="text-xs text-gray-500">active talks</span>
              </div>
            </motion.div>

            <motion.div 
              className="p-5 bg-neon-green/10 border border-neon-green/30 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-sm text-gray-400 mb-1">Closed Deals</div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-neon-green">{data.delvrai.clients}</div>
                <span className="text-xs text-gray-500">customers</span>
              </div>
            </motion.div>
          </div>

          <h3 className="font-bold text-gray-100 mb-4">Target Market:</h3>
          <div className="space-y-3">
            <motion.div className="p-3 bg-dark-800/30 border border-glass rounded-lg flex items-center gap-2">
              <span>🏗️</span>
              <span className="text-gray-200">Contractors (Primary)</span>
            </motion.div>
            <motion.div className="p-3 bg-dark-800/30 border border-glass rounded-lg flex items-center gap-2">
              <span>🏘️</span>
              <span className="text-gray-200">Real Estate Agents</span>
            </motion.div>
            <motion.div className="p-3 bg-dark-800/30 border border-glass rounded-lg flex items-center gap-2">
              <span>🌍</span>
              <span className="text-gray-200">Nationwide B2B</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Progress Targets */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span>🎯</span>
          <span className="text-neon-green">Growth Targets</span>
        </h2>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-100">Client Acquisition</span>
              <span className="text-neon-orange font-bold">{data.delvrai.clients} / 10</span>
            </div>
            <ProgressBar current={data.delvrai.clients} target={10} color="orange" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-100">Monthly Revenue Target</span>
              <span className="text-neon-green font-bold">${data.delvrai.revenue.toLocaleString()} / $15,000</span>
            </div>
            <ProgressBar current={data.delvrai.revenue} target={15000} color="green" />
          </motion.div>
        </div>

        <motion.div 
          className="mt-8 p-6 bg-neon-orange/10 border border-neon-orange/30 rounded-xl"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              ⚡
            </motion.span>
            <span className="font-bold text-neon-orange">Sales Agent Status</span>
          </div>
          <p className="text-sm text-gray-300">Recruitment in progress • Ready to launch Q2 2026</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
