import { motion } from 'framer-motion';
import { Walk, Train, Bus, Navigation, MapPin, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import type { LiveTracking } from '@/lib/types';

interface JourneyTrackingCardProps {
  tracking: LiveTracking;
  onStageUpdate?: (stageIndex: number) => void;
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

const JourneyTrackingCard = ({ tracking, onStageUpdate }: JourneyTrackingCardProps) => {
  const currentStage = tracking.stages[tracking.currentStageIndex];
  const completedCount = tracking.stages.filter((s) => s.status === 'completed').length;
  const progress = Math.round((completedCount / tracking.stages.length) * 100);
  const Icon = currentStage ? modeIcons[currentStage.mode] || Navigation : Navigation;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {tracking.lateArrival && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-center gap-2"
        >
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-red-700">Running Late</span>
            <span className="text-red-400">·</span>
            <span className="font-medium text-red-600">
              Updated ETA: {tracking.stages[tracking.stages.length - 1]?.eta || '--'}
            </span>
          </div>
        </motion.div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
              <Icon size={18} className="text-[#c5f02c]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {currentStage?.label || 'Journey'}
              </h3>
              <p className="text-[10px] font-medium text-gray-400">
                Stage {tracking.currentStageIndex + 1} of {tracking.stages.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 tabular-nums">
              {tracking.remainingTime < 60
                ? `${tracking.remainingTime}m`
                : `${Math.floor(tracking.remainingTime / 60)}h ${tracking.remainingTime % 60}m`}
            </div>
            <p className="text-[10px] font-medium text-gray-400">remaining</p>
          </div>
        </div>

        <div className="relative mb-3">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                tracking.lateArrival ? 'bg-red-400' : 'bg-[#1b3a2a]'
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-medium text-gray-400">{progress}% complete</span>
            {tracking.delay && tracking.delay > 0 && (
              <span className="text-[10px] font-bold text-red-500">+{tracking.delay}min delay</span>
            )}
          </div>
        </div>

        {currentStage && currentStage.eta && (
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">
              ETA: <span className="text-gray-900">{currentStage.eta}</span>
            </span>
            {currentStage.actualDuration && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[10px] font-medium text-gray-400">
                  {currentStage.actualDuration > currentStage.duration
                    ? `+${currentStage.actualDuration - currentStage.duration}min`
                    : `-${currentStage.duration - currentStage.actualDuration}min`}
                </span>
              </>
            )}
          </div>
        )}

        {tracking.stages.length > 0 && tracking.currentStageIndex < tracking.stages.length - 1 && (
          <div className="mt-3">
            <button
              onClick={() => onStageUpdate?.(tracking.currentStageIndex + 1)}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Next:</span>
                <span className="text-xs font-bold text-gray-700">
                  {tracking.stages[tracking.currentStageIndex + 1]?.label}
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  {tracking.stages[tracking.currentStageIndex + 1]?.distance}
                </span>
              </div>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyTrackingCard;
