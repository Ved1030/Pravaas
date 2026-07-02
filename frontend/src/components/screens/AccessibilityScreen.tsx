import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, Type, Mic, Keyboard, Monitor, Palette,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { AccessibilitySettings } from '@/lib/types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const ACCESSIBILITY_KEY = 'fc_accessibility';

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  voiceNavigation: false,
  keyboardNavigation: false,
  screenReader: false,
  colorBlindSupport: false,
};

const settingConfig: { key: keyof AccessibilitySettings; icon: any; label: string; description: string }[] = [
  { key: 'highContrast', icon: Eye, label: 'High Contrast', description: 'Increase color contrast for better visibility' },
  { key: 'largeText', icon: Type, label: 'Large Text', description: 'Enlarge text throughout the app' },
  { key: 'voiceNavigation', icon: Mic, label: 'Voice Navigation', description: 'Navigate using voice commands' },
  { key: 'keyboardNavigation', icon: Keyboard, label: 'Keyboard Navigation', description: 'Full keyboard navigation support' },
  { key: 'screenReader', icon: Monitor, label: 'Screen Reader', description: 'Optimize for screen reader compatibility' },
  { key: 'colorBlindSupport', icon: Palette, label: 'Color Blind Support', description: 'Adjust colors for color vision deficiency' },
];

function loadSettings(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function persistSettings(settings: AccessibilitySettings) {
  localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
}

const AccessibilityScreen = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const toggle = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#f4f7eb] flex items-center justify-center">
            <Eye size={20} className="text-[#1b3a2a]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Accessibility</h1>
        </div>
        <p className="text-gray-500 font-medium ml-[52px]">Customize your app experience</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingConfig.map((setting) => {
          const Icon = setting.icon;
          const isActive = settings[setting.key];

          return (
            <motion.div key={setting.key} variants={fadeUp}>
              <div className={`bg-white rounded-2xl shadow-sm border p-5 transition-all ${isActive ? 'border-[#1b3a2a]/20 ring-1 ring-[#1b3a2a]/10' : 'border-gray-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-[#1b3a2a] text-[#c5f02c]' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{setting.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                      </div>
                      <Switch checked={isActive} onCheckedChange={() => toggle(setting.key)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={fadeUp} className="mt-8 bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <p className="text-xs text-gray-500 leading-relaxed">
          Accessibility settings are stored locally on your device. Changes apply immediately across the app.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default AccessibilityScreen;
