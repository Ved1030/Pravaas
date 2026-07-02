import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, Wallet, TrendingDown, Leaf, Shield, Users, Gauge,
  MapPin, Share2, Sparkles, Footprints, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { JourneySummaryData } from '@/lib/types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const mockSummary: JourneySummaryData = {
  id: 'summary_1',
  userId: 'user_1',
  route: null,
  travelTime: 28,
  moneySpent: 30,
  moneySaved: 45,
  co2Saved: 2.4,
  safetyScore: 92,
  comfortScore: 78,
  confidence: 87,
  delay: 0,
  walkingDistance: 0.7,
  aiSuggestions: [
    'Leaving 5 min earlier could save you ₹10 on peak fares',
    'Metro Line 1 was 20% faster than your usual bus route',
    'Consider buying a weekly pass — you travel this route 5x/week',
    'Walking segment can be reduced by exiting at Gate 2',
  ],
  date: new Date().toISOString(),
  journeyHealthScore: 85,
};

function CircularGauge({ score, size = 140 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight" style={{ color }}>{score}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

const JourneySummaryScreen = () => {
  const [summary] = useState<JourneySummaryData>(mockSummary);

  const statsGrid = [
    { icon: Clock, label: 'Travel Time', value: `${summary.travelTime} min`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Wallet, label: 'Money Spent', value: `₹${summary.moneySpent}`, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: TrendingDown, label: 'Money Saved', value: `₹${summary.moneySaved}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Leaf, label: 'CO₂ Saved', value: `${summary.co2Saved} kg`, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: AlertTriangle, label: 'Delay', value: summary.delay > 0 ? `${summary.delay} min` : 'None', color: summary.delay > 0 ? 'text-red-600' : 'text-gray-500', bg: summary.delay > 0 ? 'bg-red-50' : 'bg-gray-50' },
    { icon: Footprints, label: 'Walking', value: `${summary.walkingDistance} km`, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Journey Summary</h1>
        <p className="text-gray-500 font-medium">Your completed journey at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-6">
              <CircularGauge score={summary.journeyHealthScore || 85} />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Journey Health Score</h2>
                <p className="text-sm text-gray-500">Overall rating based on safety, comfort, traffic, and efficiency</p>
                <div className="flex items-center gap-2 mt-3">
                  {summary.journeyHealthScore && summary.journeyHealthScore >= 80 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 size={12} /> Excellent
                    </span>
                  ) : summary.journeyHealthScore && summary.journeyHealthScore >= 60 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <AlertTriangle size={12} /> Average
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      <AlertTriangle size={12} /> Needs Improvement
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-base text-gray-900 mb-5">Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statsGrid.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                      <Icon size={15} className={stat.color} strokeWidth={2.5} />
                    </div>
                    <p className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5 uppercase tracking-wider">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-base text-gray-900 mb-5">AI Suggestions</h3>
            <div className="space-y-3">
              {summary.aiSuggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f0f7f2] border border-[#1b3a2a]/10">
                  <Sparkles size={14} className="text-[#1b3a2a] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-base text-gray-900 mb-5">Scores</h3>
            <div className="space-y-4">
              <ScoreBar label="Safety Score" score={summary.safetyScore} color="#22c55e" />
              <ScoreBar label="Comfort Score" score={summary.comfortScore} color="#3b82f6" />
              <ScoreBar label="Confidence" score={summary.confidence} color="#8b5cf6" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-base text-gray-900 mb-4">Route Map</h3>
            <div className="bg-gray-50 rounded-xl h-40 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                <MapPin size={24} className="text-gray-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-400">Map thumbnail</p>
                <p className="text-[10px] text-gray-300">Andheri → BKC · 28 min</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => alert('Summary shared!')}
              className="w-full py-3 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#234d38] transition-all"
            >
              <Share2 size={16} /> Share Summary
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default JourneySummaryScreen;
