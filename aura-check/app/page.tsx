'use client';

import { useState } from 'react';
import Landing from '@/components/Landing';
import Upload from '@/components/Upload';
import Analyzing from '@/components/Analyzing';
import Paywall from '@/components/Paywall';
import Results from '@/components/Results';
import Particles from '@/components/Particles';
import { AuraAnalysis } from '@/lib/types';
import { analyzeImage } from '@/lib/analyzer';

type Screen = 'landing' | 'upload' | 'analyzing' | 'paywall' | 'results';

function isSubscribed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('aura_subscribed') === 'true';
}

function getScansUsed(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('aura_scans_used') || '0', 10);
}

function incrementScans(): number {
  const next = getScansUsed() + 1;
  localStorage.setItem('aura_scans_used', String(next));
  return next;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [analysis, setAnalysis] = useState<AuraAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [roastMode, setRoastMode] = useState(false);

  const handleStart = () => setScreen('upload');

  const handleImageSelected = async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setScreen('analyzing');

    try {
      const buf = await file.arrayBuffer();
      const result = await analyzeImage(buf, roastMode, file.name);
      await new Promise(r => setTimeout(r, 5000));
      setAnalysis(result);

      const scanCount = incrementScans();
      if (scanCount <= 1 || isSubscribed()) {
        setScreen('results');
      } else {
        setScreen('paywall');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setScreen('upload');
    }
  };

  const handleSubscribe = () => {
    setScreen('results');
  };

  const handleReset = () => {
    setAnalysis(null);
    setImageUrl('');
    setScreen('upload');
  };

  return (
    <main className="relative min-h-screen">
      <Particles />
      <div className="relative z-10">
        {screen === 'landing' && (
          <Landing onStart={handleStart} roastMode={roastMode} onToggleRoast={() => setRoastMode(!roastMode)} />
        )}
        {screen === 'upload' && <Upload onImageSelected={handleImageSelected} />}
        {screen === 'analyzing' && <Analyzing roastMode={roastMode} />}
        {screen === 'paywall' && analysis && (
          <Paywall overallScore={analysis.face.overall} onSubscribe={handleSubscribe} />
        )}
        {screen === 'results' && analysis && (
          <Results analysis={analysis} imageUrl={imageUrl} onReset={handleReset} isPro={isSubscribed()} />
        )}
      </div>
    </main>
  );
}
