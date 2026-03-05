'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const neonGradient: Record<string, string> = {
  'neon-green': 'from-neon-green to-neon-green',
  'neon-cyan': 'from-neon-cyan to-neon-green',
  'neon-orange': 'from-neon-orange to-neon-green',
  'neon-pink': 'from-neon-pink to-neon-green',
};

const neonBorder: Record<string, string> = {
  'neon-green': 'border-neon-green/50',
  'neon-cyan': 'border-neon-cyan/50',
  'neon-orange': 'border-neon-orange/50',
  'neon-pink': 'border-neon-pink/50',
};

type IdeaCategory = 'hot' | 'promising' | 'strategic' | 'wildcards' | 'tweaks';

export default function WhiteboardTab() {
  const [selected, setSelected] = useState<string | null>(null);

  const ideas: Record<IdeaCategory, string[]> = {
    hot: [
      'AI-powered lead qualification for Valencia',
      'Content extraction from AI Money Machines',
      'Twitter growth strategy for Trovva',
    ],
    promising: [
      'Delvrai sales agent recruitment',
      'Contractor outreach templates',
      'Case study creation from Valencia',
    ],
    strategic: [
      'Expand Valencia to 3 other cities',
      'Scale Trovva to TikTok + YouTube',
      'Build productized Delvrai offering',
      'Email nurture sequences',
      'Community building around Trovva',
    ],
    wildcards: [
      'AI automation for personal branding',
      'Real estate agent targeting (Phase 2)',
      'HVAC & plumbing vertical expansion',
    ],
    tweaks: [
      'Add SMS follow-ups to Valencia outreach',
      'Experiment with LinkedIn for Trovva',
      'Create video content for lead generation',
    ],
  };

  const categories = [
    { key: 'hot' as IdeaCategory, title: 'Hot Ideas', icon: '🔥', color: 'neon-green', desc: 'Being tested now' },
    { key: 'promising' as IdeaCategory, title: 'Promising', icon: '⭐', color: 'neon-cyan', desc: 'Waiting for resources' },
    { key: 'strategic' as IdeaCategory, title: 'Strategic', icon: '📊', color: 'neon-orange', desc: 'Next 6 months' },
    { key: 'wildcards' as IdeaCategory, title: 'Moonshots', icon: '🚀', color: 'neon-pink', desc: 'Experimental ideas' },
    { key: 'tweaks' as IdeaCategory, title: 'Tweaks', icon: '🔧', color: 'neon-green', desc: 'Quick wins' },
  ];

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
          <span className="text-4xl">💡</span>
          <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            Strategic Whiteboard
          </span>
        </h1>
        <p className="text-gray-400 mt-3">Ideas organized by priority and timeline</p>
      </motion.div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className={`text-4xl mb-2`}>{cat.icon}</div>
            <p className="font-bold text-gray-100">{cat.title}</p>
            <p className="text-xs text-gray-500">{cat.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Ideas by Category */}
      <div className="space-y-6">
        {categories.map((cat, catIdx) => (
          <motion.div
            key={cat.key}
            variants={itemVariants}
            className="bg-gradient-to-br from-dark-800/40 to-dark-700/20 backdrop-blur-glass border border-glass rounded-2xl p-8 shadow-glass"
          >
            <motion.h2 
              className="text-2xl font-bold mb-6 flex items-center gap-3"
              whileHover={{ x: 5 }}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`bg-gradient-to-r ${neonGradient[cat.color] || 'from-neon-green to-neon-green'} bg-clip-text text-transparent`}>
                {cat.title}
              </span>
              <span className="text-sm font-normal text-gray-400">({ideas[cat.key].length})</span>
            </motion.h2>

            <div className="space-y-3">
              {ideas[cat.key].map((idea: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                    selected === `${cat.key}-${idx}`
                      ? `bg-dark-700/50 ${neonBorder[cat.color] || 'border-neon-green/50'}`
                      : 'bg-dark-800/30 border-glass hover:bg-dark-700/50 hover:border-glass'
                  }`}
                  onClick={() => setSelected(selected === `${cat.key}-${idx}` ? null : `${cat.key}-${idx}`)}
                  whileHover={{ x: 8, scale: 1.02 }}
                >
                  <motion.span 
                    className={`text-xl flex-shrink-0 group-hover:scale-125 transition-transform`}
                    animate={selected === `${cat.key}-${idx}` ? { scale: 1.3, rotate: 10 } : { scale: 1, rotate: 0 }}
                  >
                    {['✓', '•', '→', '⚡', '⚙️'][catIdx]}
                  </motion.span>
                  <div className="flex-1">
                    <p className="text-gray-100 font-medium group-hover:text-neon-green transition-colors">
                      {idea}
                    </p>
                  </div>
                  <motion.span 
                    className="text-gray-500 group-hover:text-neon-green transition-colors"
                    animate={selected === `${cat.key}-${idx}` ? { x: 5 } : { x: 0 }}
                  >
                    →
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 backdrop-blur-glass border border-neon-green/30 rounded-2xl p-8"
      >
        <h3 className="text-lg font-bold text-neon-green mb-4">💼 Total Ideas in Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {categories.map((cat) => (
            <div key={cat.key}>
              <div className="text-2xl font-bold text-neon-green">{ideas[cat.key].length}</div>
              <div className="text-xs text-gray-400">{cat.title}</div>
            </div>
          ))}
          <div>
            <div className="text-2xl font-bold text-neon-cyan">
              {Object.values(ideas).reduce((sum, arr) => sum + arr.length, 0)}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
