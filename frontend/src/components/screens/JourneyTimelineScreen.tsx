import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation, MapPin, Clock, Shield, AlertTriangle,
  Phone, ChevronRight, Play, Footprints, Train, Bus, Car, CheckCircle2,
  Sparkles, XCircle,
} from 'lucide-react';
import type { LiveTracking, JourneyStage, SafetyAlert } from '@/lib/types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const modeIcons: Record<string, any> = { metro: Train, bus: Bus, auto: Car, walk: Footprints, train: Train, cab: Car, drive: Car };
const modeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  metro: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  bus: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
  walk: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' },
  auto: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  cab: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
  train: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  drive: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-500' },
};

const mockStages: JourneyStage[] = [
  { mode: 'walk', label: 'Walk to Andheri Station', distance: '0.4 km', duration: 4, status: 'completed', actualDuration: 3 },
  { mode: 'metro', label: 'Metro Line 1 to BKC', distance: '8.2 km', duration: 18, status: 'current', eta: '09:14 AM' },
  { mode: 'walk', label: 'Walk to BKC Office', distance: '0.3 km', duration: 6, status: 'upcoming' },
];

const mockActiveJourney: LiveTracking = {
  id: 'j_live_1',
  userId: 'user_1',
  status: 'active',
  currentStageIndex: 1,
  stages: mockStages,
  routeData: null,
  startTime: new Date().toISOString(),
  totalDuration: 28,
  remainingTime: 12,
  lateArrival: false,
  updatedAt: new Date().toISOString(),
};

const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: 1, type: 'heavy_crowd', title: 'Heavy Crowd at Andheri Station', description: 'Platform 2 is overcrowded',
    location: 'Andheri Station', severity: 'medium',
    coordinates: { lat: 19.1136, lng: 72.8697 }, distance: 0.2, timestamp: new Date().toISOString(),
  },
];

function generateSuggestions(stageIndex: number, stage: JourneyStage) {
  if (stage.mode === 'walk') return [
    'Stay on the left side of the footpath for faster movement',
    'Cross at the signal — traffic is light right now',
  ];
  if (stage.mode === 'metro') return [
    'Board at Platform 2 — less crowd reported',
    'Air-conditioned coach is available at the rear end',
  ];
  return [
    'Your route is clear — no disruptions reported',
    'Estimated arrival is on time',
  ];
}

const JourneyTimelineScreen = () => {
  const [activeJourney, setActiveJourney] = useState<LiveTracking | null>(mockActiveJourney);
  const [started, setStarted] = useState(false);

  const handleStartJourney = useCallback(() => {
    setStarted(true);
    setActiveJourney(mockActiveJourney);
  }, []);

  const handleSOS = useCallback(() => {
    alert('🔴 Emergency SOS triggered! Your location will be shared with emergency contacts.');
  }, []);

  const currentStage = activeJourney?.stages[activeJourney.currentStageIndex];
  const suggestions = currentStage ? generateSuggestions(activeJourney!.currentStageIndex, currentStage) : [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Journey Timeline</h1>
        <p className="text-gray-500 font-medium">Track your active journey in real-time</p>
      </motion.div>

      {!activeJourney || !started ? (
        <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f4f7eb] flex items-center justify-center mx-auto mb-4">
            <Navigation size={28} className="text-[#1b3a2a]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Journey</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Plan a route first, then start your journey here. You'll get live tracking, safety alerts, and AI suggestions along the way.</p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleStartJourney}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm shadow-md hover:bg-[#234d38] transition-all"
          >
            <Play size={16} /> Start Journey (Demo)
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Live</span>
                  </div>
                  <span className="text-2xl font-black tracking-tight">{activeJourney.remainingTime} <span className="text-base font-bold text-white/60">min left</span></span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-[#c5f02c]" />
                  <span className="text-sm text-white/70">Andheri Station → BKC</span>
                </div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black tracking-tight">{activeJourney.totalDuration}</span>
                  <span className="text-sm text-white/60">min total</span>
                  {activeJourney.lateArrival && (
                    <span className="ml-2 bg-red-500/20 text-red-300 text-xs font-bold px-2 py-0.5 rounded-lg">Delayed</span>
                  )}
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                    <span>Journey Progress</span>
                    <span>{Math.round((activeJourney.currentStageIndex / activeJourney.stages.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#c5f02c] rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(activeJourney.currentStageIndex / activeJourney.stages.length) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-base text-gray-900 mb-5">Timeline</h3>
              <div className="space-y-0">
                {activeJourney.stages.map((stage, i) => {
                  const modeKey = stage.mode as string;
                  const mc = modeColors[modeKey] || modeColors.walk;
                  const Icon = modeIcons[modeKey] || Footprints;
                  const isCurrent = i === activeJourney.currentStageIndex;
                  const isCompleted = stage.status === 'completed' || i < activeJourney.currentStageIndex;
                  const isUpcoming = stage.status === 'upcoming' || i > activeJourney.currentStageIndex;

                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center pt-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          isCurrent
                            ? 'bg-[#1b3a2a] border-[#1b3a2a] text-[#c5f02c] shadow-md shadow-[#1b3a2a]/20 scale-110'
                            : isCompleted
                              ? `${mc.bg} ${mc.border} ${mc.text}`
                              : 'bg-gray-50 border-gray-200 text-gray-300'
                        }`}>
                          {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} strokeWidth={2.5} />}
                        </div>
                        {i < activeJourney.stages.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[24px] my-1 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className={`pb-6 last:pb-0 flex-1 min-w-0 ${isUpcoming ? 'opacity-40' : ''}`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-bold text-sm ${isCurrent ? 'text-[#1b3a2a]' : 'text-gray-900'}`}>
                            {stage.label}
                            {isCurrent && <span className="ml-2 text-[10px] text-[#c5f02c] bg-[#1b3a2a] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">Current</span>}
                          </p>
                          <span className="text-xs font-semibold text-gray-500 tabular-nums">{stage.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{stage.distance}</span>
                          {stage.eta && <span className="text-xs font-bold text-[#1b3a2a]">ETA {stage.eta}</span>}
                          {stage.actualDuration && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                              {stage.actualDuration} min actual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {suggestions.length > 0 && (
              <motion.div variants={fadeUp} className="bg-gradient-to-r from-[#f0f7f2] to-[#f7faf0] rounded-2xl border border-[#1b3a2a]/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-[#1b3a2a]" />
                  <h3 className="font-bold text-sm text-[#1b3a2a]">AI Action Suggestions</h3>
                </div>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1b3a2a] mt-2 flex-shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Safety Alerts</h3>
              {mockSafetyAlerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3">
                  <Shield size={14} />
                  <span className="font-semibold">No alerts along your route</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {mockSafetyAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className={alert.severity === 'high' ? 'text-red-500 mt-0.5' : 'text-amber-500 mt-0.5'} />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{alert.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                          <p className="text-[10px] font-medium text-gray-400 mt-1">{alert.location} · {alert.distance} km</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-sm text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSOS}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-red-600 transition-all"
                >
                  <Phone size={16} /> Emergency SOS
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  <Shield size={14} /> Share Live Location
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JourneyTimelineScreen;
