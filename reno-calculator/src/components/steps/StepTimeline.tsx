'use client';

import { Timeline } from '@/lib/types';
import { Clock, Zap, Calendar, Infinity } from 'lucide-react';

interface StepTimelineProps {
  selected: Timeline | null;
  onSelect: (timeline: Timeline) => void;
}

const timelines = [
  { value: 'asap' as const, label: 'ASAP', desc: 'Ready to start immediately', icon: Zap },
  { value: '1-3-months' as const, label: '1-3 Months', desc: 'Planning to start soon', icon: Clock },
  { value: '3-6-months' as const, label: '3-6 Months', desc: 'Still in the planning phase', icon: Calendar },
  { value: 'flexible' as const, label: 'Flexible', desc: 'No rush, exploring options', icon: Infinity },
];

export default function StepTimeline({ selected, onSelect }: StepTimelineProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">When Do You Want to Start?</h2>
      <p className="text-gray-400 mb-6">This helps us prioritize your project</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {timelines.map(t => (
          <button key={t.value} onClick={() => onSelect(t.value)}
            className={`p-5 rounded-xl border text-left transition-all ${selected === t.value ? 'bg-gold/10 border-gold/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
            <t.icon className={`w-6 h-6 mb-3 ${selected === t.value ? 'text-gold' : 'text-gray-400'}`} />
            <div className="text-white font-semibold">{t.label}</div>
            <div className="text-gray-400 text-sm mt-1">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
