import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  Lightbulb, Clock, IndianRupee, CloudRain, TrendingUp, Leaf,
  Shield, AlertTriangle, Bell, RefreshCw,
} from 'lucide-react';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const iconMap: Record<string, any> = {
  clock: Clock, wallet: IndianRupee, 'cloud-rain': CloudRain,
  'trending-up': TrendingUp, leaf: Leaf, shield: Shield,
};

const impactColors: Record<string, string> = {
  high: 'bg-red-50 border-red-200',
  medium: 'bg-amber-50 border-amber-200',
  low: 'bg-blue-50 border-blue-200',
};

const InsightsScreen = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insRes, alertRes] = await Promise.all([
        apiGet<any>('/insights'),
        apiGet<any>('/insights/predictive-alerts'),
      ]);
      setInsights(insRes.dailyInsights || []);
      setSummary(insRes.weeklySummary || null);
      setAlerts(alertRes.alerts || []);
    } catch {
      setInsights([
        { id: '1', type: 'time-saving', icon: 'clock', title: 'Time Master', message: 'You saved 48 minutes this week by choosing optimal routes.', impact: 'high' },
        { id: '2', type: 'cost-saving', icon: 'wallet', title: 'Smart Saver', message: 'Metro reduced your travel cost by ₹230 this week.', impact: 'high' },
        { id: '3', type: 'weather-warning', icon: 'cloud-rain', title: 'Weather Alert', message: 'Avoid Route A tomorrow due to predicted rain between 2-5 PM.', impact: 'medium' },
        { id: '4', type: 'behavior', icon: 'trending-up', title: 'Pattern Detected', message: 'You usually leave 18 minutes later than recommended.', impact: 'medium' },
        { id: '5', type: 'eco', icon: 'leaf', title: 'Eco Impact', message: "You've saved 28.5kg of CO2 this month.", impact: 'low' },
      ]);
      setSummary({ totalSaved: { time: 48, money: 230, co2: 28.5 }, topInsight: 'Metro is your most efficient mode', actionItem: 'Try leaving at 8:30 AM instead of 8:48 AM' });
      setAlerts([
        { id: 'a1', type: 'rain', title: 'Rain Expected Tomorrow', message: 'Heavy rain predicted between 2 PM - 6 PM', severity: 'medium', confidence: 85 },
        { id: 'a2', type: 'traffic', title: 'Heavy Traffic Expected', message: 'Metro Line 1 maintenance scheduled for Saturday', severity: 'high', confidence: 92 },
      ]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="w-full max-w-[1200px] mx-auto pb-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 gap-4">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}</div>
      </div>
    </div>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Smart Insights</h1>
        <p className="text-gray-500 font-medium">AI-powered daily summaries & predictive alerts</p>
      </motion.div>

      {/* Weekly Summary */}
      {summary && (
        <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-ff-lime" />
            <h3 className="font-bold text-white">Weekly Summary</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ff-lime">{summary.totalSaved?.time || 48} min</p>
              <p className="text-[10px] text-white/60">Time Saved</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ff-lime">₹{summary.totalSaved?.money || 230}</p>
              <p className="text-[10px] text-white/60">Money Saved</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-ff-lime">{summary.totalSaved?.co2 || 28.5} kg</p>
              <p className="text-[10px] text-white/60">CO₂ Saved</p>
            </div>
          </div>
          <p className="text-sm text-white/80">{summary.topInsight}</p>
          <p className="text-xs text-ff-lime mt-2 font-semibold">Action: {summary.actionItem}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Insight Cards */}
          <motion.div variants={fadeUp} className="space-y-3">
            <h3 className="font-bold text-base text-gray-900">Daily Insights</h3>
            {insights.map((insight) => {
              const Icon = iconMap[insight.icon] || Lightbulb;
              return (
                <div key={insight.id} className={`p-5 rounded-2xl border ${impactColors[insight.impact] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 mb-1">{insight.title}</p>
                      <p className="text-sm text-gray-700 leading-snug">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Predictive Alerts */}
        <div className="space-y-6">
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-amber-500" />
              <h3 className="font-semibold text-base text-gray-900">Predictive Alerts</h3>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl border ${alert.severity === 'high' ? 'bg-red-50 border-red-200' : alert.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className={alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'} />
                    <span className="text-sm font-bold text-gray-900">{alert.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-gray-500">Confidence: {alert.confidence}%</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightsScreen;
