import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, HeartPulse, Train, ParkingCircle, Zap, Fuel, Bath,
  ShieldCheck, Ambulance, ChevronDown, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayerDef {
  key: string;
  label: string;
  icon: React.ElementType;
  defaultOn: boolean;
}

const LAYERS: LayerDef[] = [
  { key: 'police', label: 'Police Stations', icon: Shield, defaultOn: false },
  { key: 'hospitals', label: 'Hospitals', icon: HeartPulse, defaultOn: false },
  { key: 'metro', label: 'Metro Stations', icon: Train, defaultOn: true },
  { key: 'parking', label: 'Parking', icon: ParkingCircle, defaultOn: true },
  { key: 'charging', label: 'Charging Stations', icon: Zap, defaultOn: false },
  { key: 'petrol', label: 'Petrol Pumps', icon: Fuel, defaultOn: false },
  { key: 'restrooms', label: 'Restrooms', icon: Bath, defaultOn: false },
  { key: 'safe_zones', label: 'Safe Zones', icon: ShieldCheck, defaultOn: true },
  { key: 'emergency', label: 'Emergency Centers', icon: Ambulance, defaultOn: false },
];

interface LiveMapEnhancementsProps {
  onToggleLayer?: (layer: string, visible: boolean) => void;
}

const LiveMapEnhancements = ({ onToggleLayer }: LiveMapEnhancementsProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    LAYERS.forEach((l) => { initial[l.key] = l.defaultOn; });
    return initial;
  });

  const toggleLayer = (key: string) => {
    setVisibleLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      onToggleLayer?.(key, next[key]);
      return next;
    });
  };

  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-[200px]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-700">Map Layers</span>
          </div>
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} className="text-gray-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-1 border-t border-gray-100 pt-2">
                {LAYERS.map((layer) => {
                  const isOn = visibleLayers[layer.key];
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.key}
                      onClick={() => toggleLayer(layer.key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                        isOn
                          ? 'bg-[#1b3a2a] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100',
                      )}
                    >
                      <Icon size={14} />
                      <span className="truncate">{layer.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveMapEnhancements;
