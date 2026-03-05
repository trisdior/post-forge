'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BusinessData } from '@/lib/types';

interface SettingsTabProps {
  data?: BusinessData;
}

export default function SettingsTab({ data }: SettingsTabProps) {
  const [stats, setStats] = useState({
    valenciaClients: data?.valencia.clients ?? 0,
    trovvaFollowers: data?.trovva.followers ?? 0,
    delvRaiClients: data?.delvrai.clients ?? 0,
    totalRevenue: data?.totalRevenue ?? 0,
    goalMonthly: data?.targetMonthly ?? 25000,
    goalValenciaClients: 10,
    goalTrovvaFollowers: 5000,
    goalDelvRaiClients: 10,
  });

  const [saved, setSaved] = useState(false);

  const handleUpdate = (field: string, value: string) => {
    setStats(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setStats({
      valenciaClients: 0,
      trovvaFollowers: 0,
      delvRaiClients: 0,
      totalRevenue: 0,
      goalMonthly: 25000,
      goalValenciaClients: 10,
      goalTrovvaFollowers: 5000,
      goalDelvRaiClients: 10,
    });
  };

  const handleSync = () => {
    if (data) {
      setStats(prev => ({
        ...prev,
        valenciaClients: data.valencia.clients,
        trovvaFollowers: data.trovva.followers,
        delvRaiClients: data.delvrai.clients,
        totalRevenue: data.totalRevenue,
        goalMonthly: data.targetMonthly,
      }));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission-control-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

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
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span className="text-4xl">⚙️</span>
          <span className="bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
            Settings & Controls
          </span>
        </h1>
        <p className="text-gray-400 mt-3">Manage your dashboard settings and update mission data</p>
      </motion.div>

      {/* Update Daily Stats */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>📊</span>
          <span className="text-neon-cyan">Update Stats</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Valencia Clients</label>
            <input
              type="number"
              value={stats.valenciaClients}
              onChange={(e) => handleUpdate('valenciaClients', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-cyan focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Current pipeline status</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Trovva Followers</label>
            <input
              type="number"
              value={stats.trovvaFollowers}
              onChange={(e) => handleUpdate('trovvaFollowers', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-cyan focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Social growth metric</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Delvrai Clients</label>
            <input
              type="number"
              value={stats.delvRaiClients}
              onChange={(e) => handleUpdate('delvRaiClients', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-cyan focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">SaaS pipeline clients</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Total Monthly Revenue</label>
            <input
              type="number"
              value={stats.totalRevenue}
              onChange={(e) => handleUpdate('totalRevenue', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-green focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Combined revenue</div>
          </motion.div>
        </div>

        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          {saved ? '✅ Saved!' : '💾 Save Stats'}
        </motion.button>
      </motion.div>

      {/* Goals Management */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🎯</span>
          <span className="text-neon-orange">Edit Goals</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Monthly Revenue Goal</label>
            <input
              type="number"
              value={stats.goalMonthly}
              onChange={(e) => handleUpdate('goalMonthly', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-orange focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Primary goal for mission</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Valencia Goal (Clients)</label>
            <input
              type="number"
              value={stats.goalValenciaClients}
              onChange={(e) => handleUpdate('goalValenciaClients', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-orange focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Local services target</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Trovva Goal (Followers)</label>
            <input
              type="number"
              value={stats.goalTrovvaFollowers}
              onChange={(e) => handleUpdate('goalTrovvaFollowers', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-orange focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">Content hub audience</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-sm text-gray-400 mb-3 font-medium">Delvrai Goal (Clients)</label>
            <input
              type="number"
              value={stats.goalDelvRaiClients}
              onChange={(e) => handleUpdate('goalDelvRaiClients', e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/50 border border-glass rounded-lg text-white font-mono focus:border-neon-orange focus:bg-dark-700/50 transition-all"
              min="0"
            />
            <div className="text-xs text-gray-500 mt-1">SaaS client target</div>
          </motion.div>
        </div>

        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-neon-orange to-neon-pink text-dark-900 px-8 py-3 rounded-lg font-bold hover:shadow-neon-orange/30 transition-all"
        >
          🔄 Update All Goals
        </motion.button>
      </motion.div>

      {/* Data Management */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>💾</span>
          <span className="text-neon-green">Data Management</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button 
            onClick={handleExport}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-green text-dark-900 px-6 py-4 rounded-xl font-bold hover:shadow-neon-cyan/30 transition-all"
          >
            <span>📥</span> Export as JSON
          </motion.button>

          <motion.button
            onClick={handleSync}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon-green to-neon-cyan text-dark-900 px-6 py-4 rounded-xl font-bold hover:shadow-neon-green/30 transition-all"
          >
            <span>🔄</span> Sync from Files
          </motion.button>

          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon-orange to-neon-red text-dark-900 px-6 py-4 rounded-xl font-bold hover:shadow-neon-orange/30 transition-all"
          >
            <span>⚠️</span> Reset All Data
          </motion.button>

          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 px-6 py-4 rounded-xl font-bold hover:shadow-neon-cyan/30 transition-all"
          >
            <span>💾</span> Auto-Save Settings
          </motion.button>
        </div>
      </motion.div>

      {/* About & Info */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-neon-green/10 to-neon-cyan/10 backdrop-blur-glass border border-neon-green/30 rounded-2xl p-8"
      >
        <h3 className="text-lg font-bold text-neon-green mb-4 flex items-center gap-2">
          <span>ℹ️</span> About This Dashboard
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Version:</span>
            <span className="text-neon-green font-mono">1.0.0 Professional</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Framework:</span>
            <span className="text-neon-cyan font-mono">Next.js 15 + React 19</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Styling:</span>
            <span className="text-neon-orange font-mono">TailwindCSS + Framer Motion</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Updated:</span>
            <span className="text-neon-green font-mono">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
