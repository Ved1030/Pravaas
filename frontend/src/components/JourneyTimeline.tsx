import { motion } from 'framer-motion';
import { Walk, Train, Bus, Navigation, MapPin, CheckCircle2, Circle } from 'lucide-react';
import type { JourneyStage } from '@/lib/types';

interface JourneyTimelineProps {
  stages: JourneyStage[];
  currentStageIndex: number;
}

const modeIcons: Record<string, typeof Walk> = {
  walk: Walk,
  metro: Train,
  bus: Bus,
  auto: Navigation,
  train: Train,
  cab: Navigation,
  drive: Navigation,
};

const modeColors: Record<string, string> = {
  walk: 'bg-gray-400',
  metro: 'bg-blue-500',
  bus: 'bg-amber-500',
  auto: 'bg-emerald-500',
  train: 'bg-blue-600',
  cab: 'bg-purple-500',
  drive: 'bg-emerald-600',
};

const JourneyTimeline = ({ stages, currentStageIndex }: JourneyTimelineProps) => {
  return (
    <div className="relative">
      {stages.map((stage, index) => {
        const Icon = modeIcons[stage.mode] || Navigation;
        const isCompleted = stage.status === 'completed';
        const isCurrent = index === currentStageIndex;
        const isUpcoming = stage.status === 'upcoming';

        return (
          <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
            {index < stages.length - 1 && (
              <div
                className={`absolute left-[15px] top-8 w-0.5 h-full -translate-x-1/2 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                }`}
              />
            )}

            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={
                  isCurrent
                    ? { scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 2 } }
                    : { scale: 1 }
                }
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-emerald-100'
                    : isCurrent
                      ? 'bg-[#1b3a2a] ring-4 ring-[#c5f02c]/30'
                      : 'bg-gray-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Icon size={16} className="text-[#c5f02c]" />
                  </motion.div>
                ) : (
                  <Icon size={16} className="text-gray-400" />
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex-1 min-w-0 ${
                isUpcoming ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent ? 'text-[#1b3a2a]' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#c5f02c] bg-[#1b3a2a] px-1.5 py-0.5 rounded-full">
                      NOW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-gray-600 tabular-nums">
                    {stage.duration}min
                  </span>
                  {stage.eta && (
                    <span className="text-[10px] font-medium text-gray-400">
                      {stage.eta}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={10} className="text-gray-300" />
                <span className="text-[11px] text-gray-400">{stage.distance}</span>
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default JourneyTimeline;
