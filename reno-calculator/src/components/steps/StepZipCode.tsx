'use client';

import { MapPin } from 'lucide-react';

interface StepZipCodeProps {
  value: string;
  error: string;
  onChange: (zip: string) => void;
}

export default function StepZipCode({ value, error, onChange }: StepZipCodeProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Where's Your Project?</h2>
      <p className="text-gray-400 mb-6">We serve the greater Chicago area</p>
      <div className="max-w-sm mx-auto">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="Enter ZIP code"
            maxLength={5}
            className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white text-lg text-center tracking-widest focus:outline-none transition-all ${error ? 'border-red-500' : 'border-white/10 focus:border-gold'}`}
          />
        </div>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        <p className="text-gray-500 text-xs mt-4 text-center">We serve Chicago and surrounding suburbs within 30 miles</p>
      </div>
    </div>
  );
}
