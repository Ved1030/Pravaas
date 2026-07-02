import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ComfortScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function getComfortColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', stroke: '#10b981', track: '#d1fae5' };
  if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', stroke: '#f59e0b', track: '#fef3c7' };
  if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-50', stroke: '#f97316', track: '#fff7ed' };
  return { text: 'text-red-600', bg: 'bg-red-50', stroke: '#ef4444', track: '#fee2e2' };
}

export function getComfortLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Uncomfortable';
}

const ComfortScore = ({ score, size = 64, strokeWidth = 5, label }: ComfortScoreProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getComfortColor(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = 0;
      const end = score;
      const duration = 1000;
      const startTime = performance.now();

      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setAnimatedScore(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }, 200);

    return () => clearTimeout(timer);
  }, [score]);

  const displayLabel = label || getComfortLabel(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.track}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
            {animatedScore}
          </span>
        </div>
      </div>
      <span className={`text-[10px] font-bold ${colors.text} ${colors.bg} px-2 py-0.5 rounded-md`}>
        {displayLabel}
      </span>
    </div>
  );
};

export default ComfortScore;
