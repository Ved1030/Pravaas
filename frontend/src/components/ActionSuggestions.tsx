import { useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import {
  Sparkles, Clock, Train, Crosshair, Car, Navigation, Bus,
  Walk, Umbrella, Coffee, AlertTriangle, Zap,
} from 'lucide-react';

interface Suggestion {
  id: string;
  icon: string;
  text: string;
  description: string;
  action: () => void;
}

interface ActionSuggestionsProps {
  suggestions: Suggestion[];
}

const iconMap: Record<string, typeof Clock> = {
  Clock, Train, Crosshair, Car, Navigation, Bus, Walk, Umbrella, Coffee, AlertTriangle, Zap,
};

const defaultIcon = Zap;

const ActionSuggestions = ({ suggestions }: ActionSuggestionsProps) => {
  const mapped = useMemo(
    () =>
      suggestions.map((s) => ({
        ...s,
        Icon: iconMap[s.icon] || defaultIcon,
      })),
    [suggestions],
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1b3a2a] to-[#2c5f45] flex items-center justify-center">
          <Sparkles size={13} className="text-[#c5f02c]" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">AI Suggestions</h3>
      </div>

      <LayoutGroup>
        <motion.div layout className="p-2 space-y-1">
          {mapped.map(({ id, Icon, text, description, action }, index) => (
            <motion.button
              key={id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={action}
              className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#f0f7f2] flex items-center justify-center shrink-0 group-hover:bg-[#e8f0ea] transition-colors">
                <Icon size={15} className="text-[#1b3a2a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{text}</p>
                {description && (
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5 line-clamp-1">{description}</p>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </LayoutGroup>

      {mapped.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-xs font-medium text-gray-400 text-center py-4">
            No suggestions available right now
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionSuggestions;
