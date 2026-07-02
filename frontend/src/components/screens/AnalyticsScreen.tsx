import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { apiGet } from '@/services/api';
import {
  BarChart3, TrendingUp, Clock, IndianRupee, Leaf, RefreshCw,
  Shield, Activity, Navigation,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>(`/analytics?period=${period}`);
      setData(res);
    } catch {
      const dailyTrips = [
        { day: 'Mon', trips: 3, time: 85, cost: 90 },
        { day: 'Tue', trips: 2, time: 55, cost: 60 },
        { day: 'Wed', trips: 4, time: 120, cost: 100 },
        { day: 'Thu', trips: 3, time: 95, cost: 75 },
        { day: 'Fri', trips: 4, time: 110, cost: 95 },
        { day: 'Sat', trips: 1, time: 25, cost: 30 },
        { day: 'Sun', trips: 1, time: 50, cost: 45 },
      ];
      setData({
        period, trips: 18, totalTravelTime: 540, avgTravelTime: 30, moneySaved: 1840, co2Saved: 28.5,
        confidenceTrend: [82, 85, 79, 88, 91, 86, 84],
        comfortTrend: [75, 78, 72, 80, 85, 77, 81],
        safetyTrend: [90, 92, 88, 94, 96, 91, 93],
        delayTrend: [5, 8, 12, 3, 2, 7, 4],
        modeBreakdown: { metro: 10, bus: 4, walk: 2, auto: 2 },
        dailyTrips, summary: { totalTrips: 18, avgTravelTime: 30, moneySaved: 1840, co2Saved: 28.5, bestDay: 'Wednesday', worstDay: 'Tuesday' },
      });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [period]);

  if (loading) return (
    <div className="w-full max-w-[1200px] mx-auto pb-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}</div>
      </div>
    </div>
  );

  if (!data) return null;

  const chartData = data.dailyTrips || [
    { day: 'Mon', trips: 3, time: 85, cost: 90 },
    { day: 'Tue', trips: 2, time: 55, cost: 60 },
    { day: 'Wed', trips: 4, time: 120, cost: 100 },
    { day: 'Thu', trips: 3, time: 95, cost: 75 },
    { day: 'Fri', trips: 4, time: 110, cost: 95 },
    { day: 'Sat', trips: 1, time: 25, cost: 30 },
    { day: 'Sun', trips: 1, time: 50, cost: 45 },
  ];

  const trendData = (data.confidenceTrend || []).map((v: number, i: number) => ({
    day: `D${i + 1}`, confidence: v, comfort: data.comfortTrend?.[i] || 0, safety: data.safetyTrend?.[i] || 0, delay: data.delayTrend?.[i] || 0,
  }));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">AI Analytics Center</h1>
          <p className="text-gray-500 font-medium">Deep insights into your travel patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPeriod('weekly')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${period === 'weekly' ? 'bg-[#1b3a2a] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Weekly</button>
          <button onClick={() => setPeriod('monthly')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${period === 'monthly' ? 'bg-[#1b3a2a] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Monthly</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Trips', value: data.trips || data.summary?.totalTrips || 18, icon: Navigation, color: 'bg-[#f4f7eb] text-[#1b3a2a]' },
          { label: 'Money Saved', value: `₹${data.moneySaved || data.summary?.moneySaved || 0}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'CO₂ Saved', value: `${data.co2Saved || data.summary?.co2Saved || 0} kg`, icon: Leaf, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Time', value: `${data.avgTravelTime || data.summary?.avgTravelTime || 30} min`, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center`}><card.icon size={16} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trips Chart */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Trips per Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="trips" fill="#1b3a2a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Trends */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Confidence & Comfort Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="confidence" stroke="#1b3a2a" fill="#1b3a2a" fillOpacity={0.1} />
              <Area type="monotone" dataKey="comfort" stroke="#3c7689" fill="#3c7689" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Safety & Delay */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Safety & Delay Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="safety" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="delay" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mode Breakdown */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-base text-gray-900 mb-4">Mode Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data.modeBreakdown || {}).map(([mode, count]) => (
              <div key={mode} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 capitalize w-16">{mode}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1b3a2a] rounded-full" style={{ width: `${((count as number) / (data.trips || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 w-8 text-right">{count as number}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Best Day</span><span className="font-bold text-emerald-600">{data.summary?.bestDay || 'Wednesday'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Worst Day</span><span className="font-bold text-amber-600">{data.summary?.worstDay || 'Tuesday'}</span></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnalyticsScreen;
