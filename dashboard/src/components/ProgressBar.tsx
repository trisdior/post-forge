'use client';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: 'green' | 'blue' | 'cyan' | 'orange' | 'red';
}

export default function ProgressBar({ current, target, color = 'green' }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);

  const gradientMap = {
    green: 'from-neon-green to-neon-blue',
    blue: 'from-neon-blue to-cyan-400',
    cyan: 'from-cyan-400 to-neon-green',
    orange: 'from-neon-orange to-yellow-500',
    red: 'from-neon-red to-orange-500',
  };

  return (
    <div className="progress-bar">
      <div 
        className={`progress-fill bg-gradient-to-r ${gradientMap[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
