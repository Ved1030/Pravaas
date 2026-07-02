import { motion } from 'framer-motion';
import { Shield, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface WomenSafetyToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const WomenSafetyToggle = ({ enabled, onToggle }: WomenSafetyToggleProps) => {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        enabled
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-100',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              enabled ? 'bg-emerald-100' : 'bg-gray-100',
            )}
          >
            <Shield
              size={18}
              className={cn(
                'transition-colors',
                enabled ? 'text-emerald-600' : 'text-gray-400',
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-bold transition-colors',
                  enabled ? 'text-emerald-900' : 'text-gray-900',
                )}
              >
                Women Safe Mode
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-400">
              {enabled ? 'Preferring safer routes' : 'Standard routing'}
            </span>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {enabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 pt-3 border-t border-emerald-200"
        >
          <div className="flex items-start gap-1.5">
            <Info size={12} className="text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-emerald-700">
              <span>Well-lit roads</span>
              <span className="text-emerald-300">·</span>
              <span>Crowded areas</span>
              <span className="text-emerald-300">·</span>
              <span>Police patrolled routes</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WomenSafetyToggle;
