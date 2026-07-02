import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronDown, Sparkles, Shield, Cloud, Users,
  Thermometer, Wallet, Clock, AlertTriangle, Gauge,
} from 'lucide-react';
import ComfortScore from './ComfortScore';
import type { AIRecommendationResponse } from '@/lib/types';

interface AIInsightPanelProps {
  recommendation: AIRecommendationResponse | null;
  loading?: boolean;
}

const AIInsightPanel = ({ recommendation, loading = false }: AIInsightPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!recommendation && !loading) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1b3a2a] to-[#2c5f45] flex items-center justify-center">
            <Brain size={15} className="text-[#c5f02c]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-gray-900">AI Journey Insights</h3>
            {recommendation && (
              <p className="text-[10px] font-medium text-gray-400">
                {recommendation.confidence}% confidence · {recommendation.reasons.length} insights
              </p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && recommendation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-[#1b3a2a] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && (
                <>
                  <div className="bg-[#f0f7f2] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={12} className="text-[#1b3a2a]" />
                      <span className="text-[10px] font-bold text-[#1b3a2a] uppercase tracking-wider">Recommendation Reason</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed">
                      {recommendation.explanation}
                    </p>
                  </div>

                  {recommendation.reasons.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {recommendation.reasons.map((reason, i) => (
                        <div key={i} className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                          <Shield size={11} className="text-emerald-500" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-[18px] font-bold text-gray-900 tabular-nums">{recommendation.recommendedRoute.totalTime}</span>
                      <span className="text-[10px] font-medium text-gray-500">min</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1">
                      <Wallet size={14} className="text-gray-400" />
                      <span className="text-[18px] font-bold text-gray-900 tabular-nums">₹{recommendation.recommendedRoute.cost}</span>
                      <span className="text-[10px] font-medium text-gray-500">est. cost</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1">
                      <Shield size={14} className="text-gray-400" />
                      <span className="text-[18px] font-bold text-emerald-600 tabular-nums">{recommendation.confidence}%</span>
                      <span className="text-[10px] font-medium text-gray-500">confidence</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Gauge size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delay Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${recommendation.delayPrediction.color.text} tabular-nums`}>
                          {recommendation.delayPrediction.probability}%
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${recommendation.delayPrediction.color.bg} ${recommendation.delayPrediction.color.text}`}>
                          {recommendation.delayPrediction.label}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Thermometer size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Comfort</span>
                      </div>
                      <ComfortScore score={recommendation.comfort.score} size={48} strokeWidth={4} />
                    </div>
                  </div>

                  {recommendation.weather && (
                    <div className={`${recommendation.weather.bg} rounded-xl p-3`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Cloud size={12} className={recommendation.weather.color} />
                        <span className={`text-[10px] font-bold ${recommendation.weather.color} uppercase tracking-wider`}>
                          Weather · {recommendation.weather.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{recommendation.weather.temperature}°C</span>
                        <span className="text-gray-300">·</span>
                        <span>Humidity: {recommendation.weather.humidity}%</span>
                        <span className="text-gray-300">·</span>
                        <span>Vis: {recommendation.weather.visibility}</span>
                      </div>
                    </div>
                  )}

                  {recommendation.crowd && recommendation.crowd.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Crowd Analysis</span>
                      </div>
                      <div className="space-y-1.5">
                        {recommendation.crowd.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 font-medium capitalize">{c.mode || `Segment ${i + 1}`}</span>
                            <span className={`font-bold ${c.color}`}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.comfort.factors.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={12} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Comfort Factors</span>
                      </div>
                      <div className="space-y-1">
                        {recommendation.comfort.factors.map((factor, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{factor.name}</span>
                            <span className={`font-bold ${factor.impact < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {factor.impact < 0 ? factor.impact : `+${factor.impact}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightPanel;
