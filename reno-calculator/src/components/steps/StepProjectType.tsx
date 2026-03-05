'use client';

import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Bath, 
  Layers, 
  Paintbrush, 
  Home, 
  MoreHorizontal,
  LucideIcon 
} from 'lucide-react';
import { ProjectType } from '@/lib/types';

interface StepProjectTypeProps {
  selected: ProjectType | null;
  onSelect: (type: ProjectType) => void;
}

interface ProjectOption {
  id: ProjectType;
  icon: LucideIcon;
  label: string;
  description: string;
}

const projectOptions: ProjectOption[] = [
  {
    id: 'kitchen',
    icon: ChefHat,
    label: 'Kitchen Remodel',
    description: 'Cabinets, countertops, appliances & more',
  },
  {
    id: 'bathroom',
    icon: Bath,
    label: 'Bathroom Remodel',
    description: 'Tub, shower, vanity, tile & fixtures',
  },
  {
    id: 'flooring',
    icon: Layers,
    label: 'Flooring',
    description: 'Hardwood, tile, LVP, carpet installation',
  },
  {
    id: 'painting',
    icon: Paintbrush,
    label: 'Painting',
    description: 'Interior & exterior painting',
  },
  {
    id: 'full-remodel',
    icon: Home,
    label: 'Full Home Remodel',
    description: 'Complete home renovation',
  },
  {
    id: 'other',
    icon: MoreHorizontal,
    label: 'Other Project',
    description: 'Custom renovation work',
  },
];

export default function StepProjectType({ selected, onSelect }: StepProjectTypeProps) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
        What type of project are you planning?
      </h2>
      <p className="text-gray-400 mb-8">
        Select the renovation type that best describes your project.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projectOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.id)}
            className={`group relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 text-left ${
              selected === option.id
                ? 'bg-gold/10 border-gold'
                : 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                selected === option.id
                  ? 'bg-gold text-black'
                  : 'bg-white/10 text-gold group-hover:bg-gold/20'
              }`}
            >
              <option.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-semibold mb-1 transition-colors ${
                selected === option.id ? 'text-gold' : 'text-white'
              }`}>
                {option.label}
              </h3>
              <p className="text-sm text-gray-400">{option.description}</p>
            </div>
            {selected === option.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
