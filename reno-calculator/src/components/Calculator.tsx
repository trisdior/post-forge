'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { 
  CalculatorState, 
  ProjectType, 
  RoomSize, 
  QualityLevel, 
  Timeline,
  CostEstimate 
} from '@/lib/types';
import { calculateEstimate, isChicagoArea } from '@/lib/pricing';
import StepProjectType from './steps/StepProjectType';
import StepRoomSize from './steps/StepRoomSize';
import StepQuality from './steps/StepQuality';
import StepOptions from './steps/StepOptions';
import StepTimeline from './steps/StepTimeline';
import StepZipCode from './steps/StepZipCode';
import ResultsPage from './ResultsPage';

interface CalculatorProps {
  onBack: () => void;
}

const TOTAL_STEPS = 6;

export default function Calculator({ onBack }: CalculatorProps) {
  const [state, setState] = useState<CalculatorState>({
    step: 1,
    projectType: null,
    roomSize: null,
    qualityLevel: null,
    projectOptions: {},
    timeline: null,
    zipCode: '',
  });

  const [showResults, setShowResults] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [zipError, setZipError] = useState('');

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (state.step < TOTAL_STEPS) {
      updateState({ step: state.step + 1 });
    } else {
      // Validate zip code
      if (!isChicagoArea(state.zipCode)) {
        setZipError('Please enter a valid Chicago area zip code');
        return;
      }
      // Calculate and show results
      const result = calculateEstimate(state);
      setEstimate(result);
      setShowResults(true);
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      updateState({ step: state.step - 1 });
    } else {
      onBack();
    }
  };

  const canProceed = (): boolean => {
    switch (state.step) {
      case 1:
        return state.projectType !== null;
      case 2:
        return state.roomSize !== null;
      case 3:
        return state.qualityLevel !== null;
      case 4:
        return true; // Options are optional
      case 5:
        return state.timeline !== null;
      case 6:
        return state.zipCode.length >= 5;
      default:
        return false;
    }
  };

  const stepTitles = [
    'Project Type',
    'Room Size',
    'Quality Level',
    'Project Details',
    'Timeline',
    'Location',
  ];

  if (showResults && estimate) {
    return (
      <ResultsPage 
        estimate={estimate} 
        state={state}
        onBack={() => setShowResults(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {state.step} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gold font-medium">
              {stepTitles[state.step - 1]}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold to-gold-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(state.step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  i + 1 < state.step
                    ? 'bg-gold text-black'
                    : i + 1 === state.step
                    ? 'bg-gold/20 text-gold border-2 border-gold'
                    : 'bg-white/5 text-gray-500'
                }`}
              >
                {i + 1 < state.step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 mb-6"
          >
            {state.step === 1 && (
              <StepProjectType
                selected={state.projectType}
                onSelect={(type) => updateState({ projectType: type })}
              />
            )}
            {state.step === 2 && (
              <StepRoomSize
                selected={state.roomSize}
                projectType={state.projectType}
                onSelect={(size) => updateState({ roomSize: size })}
              />
            )}
            {state.step === 3 && (
              <StepQuality
                selected={state.qualityLevel}
                onSelect={(quality) => updateState({ qualityLevel: quality })}
              />
            )}
            {state.step === 4 && (
              <StepOptions
                projectType={state.projectType}
                options={state.projectOptions}
                qualityLevel={state.qualityLevel}
                onUpdate={(options) => updateState({ projectOptions: options })}
              />
            )}
            {state.step === 5 && (
              <StepTimeline
                selected={state.timeline}
                onSelect={(timeline) => updateState({ timeline: timeline })}
              />
            )}
            {state.step === 6 && (
              <StepZipCode
                value={state.zipCode}
                error={zipError}
                onChange={(zip) => {
                  setZipError('');
                  updateState({ zipCode: zip });
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{state.step === 1 ? 'Home' : 'Back'}</span>
          </button>

          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              canProceed()
                ? 'bg-gold hover:bg-gold-500 text-black hover:scale-105'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{state.step === TOTAL_STEPS ? 'See My Estimate' : 'Continue'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
