import { Users } from 'lucide-react';

interface CrowdIndicatorProps {
  level: string;
  label?: string;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const crowdStyles: Record<string, { color: string; bg: string; dot: string; bars: number; activeBar: string; inactiveBar: string }> = {
  low: { color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500', bars: 1, activeBar: 'bg-emerald-500', inactiveBar: 'bg-gray-200' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', bars: 2, activeBar: 'bg-amber-500', inactiveBar: 'bg-gray-200' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-500', bars: 3, activeBar: 'bg-orange-500', inactiveBar: 'bg-gray-200' },
  very_high: { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500', bars: 4, activeBar: 'bg-red-500', inactiveBar: 'bg-gray-200' },
};

const CrowdIndicator = ({ level, label, score, showIcon = true, size = 'sm' }: CrowdIndicatorProps) => {
  const style = crowdStyles[level] || crowdStyles.low;
  const displayLabel = label || (level === 'very_high' ? 'Very High' : level.charAt(0).toUpperCase() + level.slice(1));
  const isSmall = size === 'sm';

  return (
    <div className={`inline-flex items-center gap-1.5 ${isSmall ? 'px-2 py-1' : 'px-2.5 py-1.5'} ${style.bg} rounded-lg`}>
      {showIcon && (
        <Users size={isSmall ? 11 : 13} strokeWidth={2.5} className={style.color} />
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`${isSmall ? 'w-1 h-2.5' : 'w-1.5 h-3'} rounded-sm ${bar <= style.bars ? style.activeBar : style.inactiveBar}`}
          />
        ))}
      </div>
      <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} font-bold ${style.color}`}>
        {displayLabel}
        {score !== undefined && <span className="ml-0.5 opacity-70">({score}%)</span>}
      </span>
    </div>
  );
};

export default CrowdIndicator;
