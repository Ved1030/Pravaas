import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, Construction, CloudRain, ShieldAlert,
  Users, Road, Skull, X, MapPin, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SafetyAlert } from '@/lib/types';

interface SafetyAlertCardProps {
  alert: SafetyAlert;
  onDismiss?: (id: number) => void;
}

const alertIcons: Record<string, typeof Shield> = {
  heavy_crowd: Users,
  accident: AlertTriangle,
  construction: Construction,
  flooding: CloudRain,
  crime_alert: ShieldAlert,
  political_gathering: Users,
  road_blocked: Road,
  unsafe_area: Skull,
};

const severityStyles: Record<string, { border: string; bg: string; dot: string; text: string; label: string }> = {
  high: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
    text: 'text-red-700',
    label: 'High',
  },
  medium: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    label: 'Medium',
  },
  low: {
    border: 'border-gray-200',
    bg: 'bg-gray-50',
    dot: 'bg-gray-400',
    text: 'text-gray-600',
    label: 'Low',
  },
};

const SafetyAlertCard = ({ alert, onDismiss }: SafetyAlertCardProps) => {
  const Icon = alertIcons[alert.type] || Shield;
  const severity = severityStyles[alert.severity] || severityStyles.low;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        'relative rounded-xl border p-3.5',
        severity.border,
        severity.bg,
      )}
    >
      {onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        >
          <X size={13} className="text-gray-400" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', severity.bg)}>
          <Icon size={16} className={severity.text} />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-gray-900 truncate">{alert.title}</h4>
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', severity.bg, severity.text)}>
              {severity.label}
            </span>
          </div>
          {alert.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{alert.description}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {alert.location} ({alert.distance}m)
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {alert.timestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyAlertCard;
