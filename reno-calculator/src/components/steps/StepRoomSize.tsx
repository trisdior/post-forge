'use client';

import { motion } from 'framer-motion';
import { RoomSize, ProjectType } from '@/lib/types';

interface StepRoomSizeProps {
  selected: RoomSize | null;
  projectType: ProjectType | null;
  onSelect: (size: RoomSize) => void;
}

const getSizeDescriptions = (projectType: ProjectType | null) => {
  switch (projectType) {
    case 'kitchen':
      return {
        small: { sqft: 'Under 100 sq ft', desc: 'Galley or apartment kitchen' },
        medium: { sqft: '100-200 sq ft', desc: 'Standard home kitchen' },
        large: { sqft: 'Over 200 sq ft', desc: 'Large or open-concept kitchen' },
      };
    case 'bathroom':
      return {
        small: { sqft: 'Under 40 sq ft', desc: 'Half bath or powder room' },
        medium: { sqft: '40-80 sq ft', desc: 'Standard full bathroom' },
        large: { sqft: 'Over 80 sq ft', desc: 'Master bath or luxury bathroom' },
      };
    case 'flooring':
      return {
        small: { sqft: 'Under 500 sq ft', desc: '1-2 rooms' },
        medium: { sqft: '500-1,500 sq ft', desc: '3-5 rooms or one floor' },
        large: { sqft: 'Over 1,500 sq ft', desc: 'Whole house or multiple floors' },
      };
    case 'painting':
      return {
        small: { sqft: '1-3 rooms', desc: 'Small apartment or accent work' },
        medium: { sqft: '4-8 rooms', desc: 'Average home interior' },
        large: { sqft: '9+ rooms', desc: 'Large home or whole house' },
      };
    case 'full-remodel':
      return {
        small: { sqft: 'Under 1,000 sq ft', desc: 'Small home or condo' },
        medium: { sqft: '1,000-2,500 sq ft', desc: 'Average family home' },
        large: { sqft: 'Over 2,500 sq ft', desc: 'Large or custom home' },
      };
    default:
      return {
        small: { sqft: 'Small project', desc: 'Limited scope' },
        medium: { sqft: 'Medium project', desc: 'Standard scope' },
        large: { sqft: 'Large project', desc: 'Extensive scope' },
      };
  }
};

const sizes: { id: RoomSize; label: string }[] = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

export default function StepRoomSize({ selected, projectType, onSelect }: StepRoomSizeProps) {
  const descriptions = getSizeDescriptions(projectType);

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
        What size is your project?
      </h2>
      <p className="text-gray-400 mb-8">
        This helps us estimate materials and labor costs accurately.
      </p>

      <div className="space-y-4">
        {sizes.map((size, index) => {
          const sizeInfo = descriptions[size.id];
          return (
            <motion.button
              key={size.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(size.id)}
              className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                selected === size.id
                  ? 'bg-gold/10 border-gold'
                  : 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10'
              }`}
            >
              {/* Size indicator */}
              <div className="flex-shrink-0">
                <div
                  className={`relative flex items-center justify-center ${
                    selected === size.id ? 'text-gold' : 'text-gray-400'
                  }`}
                >
                  {size.id === 'small' && (
                    <div className="w-8 h-8 border-2 border-current rounded-lg" />
                  )}
                  {size.id === 'medium' && (
                    <div className="w-12 h-12 border-2 border-current rounded-lg" />
                  )}
                  {size.id === 'large' && (
                    <div className="w-16 h-16 border-2 border-current rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg mb-1 transition-colors ${
                    selected === size.id ? 'text-gold' : 'text-white'
                  }`}
                >
                  {size.label}
                </h3>
                <p className="text-gold/80 text-sm font-medium mb-1">{sizeInfo.sqft}</p>
                <p className="text-gray-400 text-sm">{sizeInfo.desc}</p>
              </div>

              {/* Radio indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === size.id
                    ? 'border-gold bg-gold'
                    : 'border-gray-500'
                }`}
              >
                {selected === size.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-black rounded-full"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
