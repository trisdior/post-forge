'use client';

import { motion } from 'framer-motion';
import { QualityLevel } from '@/lib/types';
import { Star } from 'lucide-react';

interface StepQualityProps {
  selected: QualityLevel | null;
  onSelect: (quality: QualityLevel) => void;
}

const qualityOptions: { 
  id: QualityLevel; 
  label: string; 
  description: string; 
  features: string[];
  stars: number;
}[] = [
  {
    id: 'budget',
    label: 'Budget-Friendly',
    description: 'Quality work at affordable prices',
    features: [
      'Standard materials & finishes',
      'Basic fixtures & hardware',
      'Cost-effective solutions',
      'Great for rentals or starter homes',
    ],
    stars: 1,
  },
  {
    id: 'mid-range',
    label: 'Mid-Range',
    description: 'Best value for most homeowners',
    features: [
      'Quality materials & finishes',
      'Brand-name fixtures',
      'Popular design choices',
      'Balance of style & budget',
    ],
    stars: 2,
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'High-end luxury renovation',
    features: [
      'Premium materials & custom work',
      'Designer fixtures & finishes',
      'Custom cabinetry & details',
      'Show-stopping results',
    ],
    stars: 3,
  },
];

export default function StepQuality({ selected, onSelect }: StepQualityProps) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
        What quality level are you looking for?
      </h2>
      <p className="text-gray-400 mb-8">
        This determines the materials, fixtures, and finishes we&apos;ll include in your estimate.
      </p>

      <div className="space-y-4">
        {qualityOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(option.id)}
            className={`w-full p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              selected === option.id
                ? 'bg-gold/10 border-gold'
                : 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3
                  className={`font-semibold text-lg transition-colors ${
                    selected === option.id ? 'text-gold' : 'text-white'
                  }`}
                >
                  {option.label}
                </h3>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
              
              {/* Stars indicator */}
              <div className="flex gap-1 flex-shrink-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < option.stars
                        ? selected === option.id
                          ? 'fill-gold text-gold'
                          : 'fill-gold/60 text-gold/60'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Features list */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {option.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${
                      selected === option.id ? 'text-gold' : 'text-gray-500'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* Selection indicator */}
            {selected === option.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-gold/30"
              >
                <span className="text-gold text-sm font-medium flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Selected
                </span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
