'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const pts: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-purple-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 aura-orb" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-600/10 aura-orb" style={{ animationDelay: '2s' }} />
    </div>
  );
}
