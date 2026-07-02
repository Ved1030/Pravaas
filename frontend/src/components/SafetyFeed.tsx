import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff } from 'lucide-react';
import SafetyAlertCard from './SafetyAlertCard';
import type { SafetyAlert } from '@/lib/types';

interface SafetyFeedProps {
  alerts: SafetyAlert[];
  onDismiss: (id: number) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const SafetyFeed = ({ alerts, onDismiss }: SafetyFeedProps) => {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
          <ShieldOff size={20} className="text-emerald-400" />
        </div>
        <p className="text-sm font-bold text-gray-900">No active alerts</p>
        <p className="text-xs font-medium text-gray-400 mt-1">Your route looks safe right now</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <SafetyAlertCard alert={alert} onDismiss={onDismiss} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SafetyFeed;
