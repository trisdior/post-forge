'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, DollarSign, Clock, Lightbulb, Send } from 'lucide-react';
import { CostEstimate, CalculatorState } from '@/lib/types';
import { formatCurrency } from '@/lib/pricing';

interface ResultsPageProps {
  estimate: CostEstimate;
  state: CalculatorState;
  onBack: () => void;
}

export default function ResultsPage({ estimate, state, onBack }: ResultsPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          projectType: state.projectType,
          roomSize: state.roomSize,
          qualityLevel: state.qualityLevel,
          estimate,
          zipCode: state.zipCode,
          timeline: state.timeline,
        }),
      });
      setSubmitted(true);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const projectLabel = state.projectType?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Project';
  const qualityLabel = state.qualityLevel?.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';

  const tips = [
    'Get multiple quotes to compare pricing',
    'Set aside 10-15% contingency for unexpected costs',
    'Consider phasing work to spread out costs',
    'Ask about material alternatives that look premium but cost less',
    'Time your project for off-season (winter) for better rates',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Adjust estimate
        </button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Estimate</h1>
          <p className="text-gray-400">{qualityLabel} {projectLabel} • Chicago Area</p>
        </motion.div>

        {/* Main Estimate Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/5 border border-gold/30 rounded-2xl p-6 md:p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-2">Estimated Cost Range</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl text-gray-400">{formatCurrency(estimate.low)}</span>
              <span className="text-gray-600">—</span>
              <span className="text-4xl font-bold text-gold">{formatCurrency(estimate.mid)}</span>
              <span className="text-gray-600">—</span>
              <span className="text-2xl text-gray-400">{formatCurrency(estimate.high)}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">Based on 2026 Chicago market rates</p>
          </div>

          {/* Visual bar */}
          <div className="relative h-4 bg-white/10 rounded-full mb-8 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-gold to-red-500 rounded-full" />
            <div className="absolute inset-y-0 left-[40%] w-[20%] bg-gold/40 border-x-2 border-gold rounded" />
          </div>

          {/* Breakdown */}
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-gold" /> Cost Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Materials', values: estimate.breakdown.materials, pct: '40%' },
              { label: 'Labor', values: estimate.breakdown.labor, pct: '45%' },
              { label: 'Permits & Fees', values: estimate.breakdown.permits, pct: '5%' },
              { label: 'Contingency', values: estimate.breakdown.contingency, pct: '10%' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <span className="text-white text-sm">{item.label}</span>
                  <span className="text-gray-500 text-xs ml-2">({item.pct})</span>
                </div>
                <span className="text-gray-300 text-sm">{formatCurrency(item.values.low)} — {formatCurrency(item.values.high)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-gold" /> Estimated Timeline</h3>
          <p className="text-2xl text-gold font-bold">{estimate.timelineWeeks.min} — {estimate.timelineWeeks.max} weeks</p>
          <p className="text-gray-400 text-sm mt-1">Depending on scope, materials, and scheduling</p>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-gold" /> Money-Saving Tips</h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                <span className="text-gold mt-0.5">•</span> {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Lead Capture */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-2xl p-6 md:p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gold text-3xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">We'll Be in Touch!</h3>
              <p className="text-gray-400">Valencia Construction will contact you within 24 hours with a detailed quote.</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-gold">
                <Phone className="w-4 h-4" /> (773) 682-7788
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-2">Want an Exact Quote?</h3>
              <p className="text-gray-400 mb-6">Get a FREE consultation from Valencia Construction. We'll contact you within 24 hours.</p>
              <div className="space-y-3">
                <input type="text" placeholder="Your Name *" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                <input type="tel" placeholder="Phone Number *" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                <input type="email" placeholder="Email (optional)" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gold" />
                <button onClick={handleSubmit} disabled={!name || !phone || submitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${name && phone ? 'bg-gold hover:bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                  <Send className="w-5 h-5" /> {submitting ? 'Sending...' : 'Get My Free Quote'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-3 text-center">No spam. No obligation. Just a real quote from a real contractor.</p>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <p className="text-gray-500 text-sm">Valencia Construction • Chicago, IL</p>
          <p className="text-gray-600 text-xs mt-1">(773) 682-7788 • valenciaconstructionchi.com</p>
        </div>
      </div>
    </div>
  );
}
