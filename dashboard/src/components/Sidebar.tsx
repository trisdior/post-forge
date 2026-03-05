'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'valencia', label: 'Valencia', icon: '🏗️' },
    { id: 'trovva', label: 'Trovva AI', icon: '📝' },
    { id: 'delvrai', label: 'Delvrai', icon: '🤖' },
    { id: 'whiteboard', label: 'Whiteboard', icon: '💡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <motion.aside 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className={`${isOpen ? 'w-64' : 'w-24'} transition-all duration-300 bg-dark-900/80 backdrop-blur-glass border-r border-glass h-screen sticky top-0 overflow-y-auto flex flex-col shadow-glass`}
    >
      <div className="px-6 py-6 flex items-center justify-between border-b border-glass">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-lg font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent"
            >
              Menu
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-neon-green/10 rounded-lg text-neon-cyan transition-colors"
        >
          {isOpen ? '◀' : '▶'}
        </motion.button>
      </div>

      <div className="flex-1 px-3 space-y-2 py-6">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ x: 4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all backdrop-blur-glass border ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 text-neon-green border-neon-green/50 shadow-neon-green'
                : 'border-glass text-gray-400 hover:bg-dark-800/50 hover:text-neon-cyan'
            }`}
          >
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <motion.span className="text-xl" animate={activeTab === tab.id ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}>
                {tab.icon}
              </motion.span>
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium text-sm"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div className="p-4 border-t border-glass bg-dark-800/30 backdrop-blur-glass">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xs space-y-2"
            >
              <p className="text-gray-500 uppercase font-bold px-2">Status</p>
              <div className="flex items-center gap-2 px-2 py-2 bg-neon-green/10 rounded-lg border border-neon-green/30">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-neon-green"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-neon-green font-medium">Live & Active</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.aside>
  );
}
