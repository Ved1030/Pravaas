// src/components/screens/DashboardScreen.tsx
import { motion, Variants } from 'framer-motion';
import {
  Bell, AlertTriangle, ArrowRight, Activity, Leaf,
  Clock, Navigation, Train, Bus, Footprints, ChevronRight, Shield,
  MapPin, GitCompare, TrendingUp, Wallet, Zap, Car,
} from 'lucide-react';
import { savedRoutes, disruptions, journeyHistory, routeResults } from '@/lib/mock-data';
import { useState, useEffect, useRef, useMemo } from 'react';
import LiveLocationCard from '@/components/ui/LiveLocationCard';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

interface Props { onNavigate: (screen: string) => void; }

// ── Live clock & greeting ─────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return { greeting, time, date };
}

// ── Animated counter ──────────────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1.8) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 600);
    return () => clearTimeout(t);
  }, [target, duration]);
  return display;
}

// ── Mode helpers ──────────────────────────────────────────────────────────────
const modeIcons: Record<string, any> = { metro: Train, bus: Bus, walk: Footprints, auto: Car, train: Train };
const modeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  metro: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  bus: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
  walk: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', dot: 'bg-gray-400' },
  auto: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};
const getModeKey = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('metro')) return 'metro';
  if (l.includes('bus')) return 'bus';
  if (l.includes('auto')) return 'auto';
  return 'walk';
};

// ── Derived stats from journeyHistory ─────────────────────────────────────────
function useDashboardStats() {
  return useMemo(() => {
    const history = journeyHistory;
    const totalTrips = history.length;
    const totalCost = history.reduce((s, t) => s + t.cost, 0);
    const totalTime = history.reduce((s, t) => s + t.duration, 0);
    const avgCost = totalTrips > 0 ? Math.round(totalCost / totalTrips) : 0;
    const avgTime = totalTrips > 0 ? Math.round(totalTime / totalTrips) : 0;

    const fastestRoute = routeResults.find((r) => r.id === '1');
    const cheapestRoute = routeResults.find((r) => r.id === '2');
    const moneySaved = fastestRoute && cheapestRoute ? fastestRoute.cost - cheapestRoute.cost : 0;
    const timeSaved = fastestRoute && cheapestRoute ? cheapestRoute.totalTime - fastestRoute.totalTime : 0;

    const modeCounts: Record<string, number> = {};
    history.forEach((t) => {
      const key = getModeKey(t.modeLabel);
      modeCounts[key] = (modeCounts[key] || 0) + 1;
    });
    const bestMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'metro';

    const onTimeTrips = history.filter((t) => t.status === 'on-time').length;
    const reliability = totalTrips > 0 ? Math.round((onTimeTrips / totalTrips) * 100) : 0;

    const disruptedTrips = history.filter((t) => t.status === 'disrupted' || t.rerouted).length;
    const avgDelay = disruptedTrips > 0
      ? Math.round(history.filter((t) => t.status === 'delayed' || t.status === 'disrupted')
          .reduce((s, t) => s + Math.max(0, t.duration - avgTime), 0) / Math.max(disruptedTrips, 1))
      : 0;

    return {
      totalTrips,
      totalCost,
      totalTime,
      avgCost,
      avgTime,
      moneySaved,
      timeSaved,
      bestMode,
      modeCounts,
      reliability,
      disruptedTrips,
      avgDelay,
    };
  }, []);
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD SCREEN
// ══════════════════════════════════════════════════════════════════════════════
const DashboardScreen = ({ onNavigate }: Props) => {
  const { greeting, time, date } = useLiveClock();
  const confidence = useAnimatedCounter(87, 2);
  const stats = useDashboardStats();

  const recentRoutes = journeyHistory.slice(0, 5);

  const insights = useMemo(() => {
    const items: { icon: any; text: string; highlight?: string }[] = [];

    if (stats.moneySaved > 0) {
      items.push({
        icon: Wallet,
        text: `You save ₹${stats.moneySaved} per trip choosing metro over cab`,
        highlight: `₹${stats.moneySaved}`,
      });
    }
    if (stats.timeSaved > 0) {
      items.push({
        icon: TrendingUp,
        text: `Fastest route is ${stats.timeSaved} min quicker than cheapest`,
        highlight: `${stats.timeSaved} min`,
      });
    }
    if (stats.reliability > 0) {
      items.push({
        icon: Shield,
        text: `${stats.reliability}% of your trips were on-time this month`,
        highlight: `${stats.reliability}%`,
      });
    }
    if (stats.bestMode) {
      const count = stats.modeCounts[stats.bestMode] || 0;
      items.push({
        icon: modeIcons[stats.bestMode] || Train,
        text: `${modeLabels[stats.bestMode]} is your most used mode (${count} trips)`,
      });
    }
    if (stats.disruptedTrips > 0) {
      items.push({
        icon: AlertTriangle,
        text: `${stats.disruptedTrips} trip${stats.disruptedTrips > 1 ? 's' : ''} faced disruptions recently`,
        highlight: `${stats.disruptedTrips} trip${stats.disruptedTrips > 1 ? 's' : ''}`,
      });
    }

    return items;
  }, [stats]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{greeting}, Rohan</h1>
          <p className="text-gray-500 font-medium">{date}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gray-700">{time}</span>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs font-semibold text-gray-500 tracking-wider">31°C HUMID</span>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════
          SECTION 1 — TOP SUMMARY (HERO STATS)
         ═══════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Trips */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#f4f7eb] flex items-center justify-center">
              <Navigation size={16} className="text-[#1b3a2a]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{stats.totalTrips}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Total Trips</p>
        </div>

        {/* Money Saved */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">₹{stats.moneySaved}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Saved per Trip</p>
        </div>

        {/* Time Saved */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{stats.timeSaved}<span className="text-base font-semibold text-gray-500 ml-0.5">min</span></p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Time Saved per Trip</p>
        </div>

        {/* Avg Cost */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Activity size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">₹{stats.avgCost}</p>
          <p className="text-xs font-medium text-gray-500 mt-0.5">Avg Cost per Trip</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left Column (2/3) ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Live Journey Card */}
          <motion.div
            variants={fadeUp}
            onClick={() => onNavigate('map')}
            className="bg-[#1b3a2a] rounded-2xl p-8 text-white relative overflow-hidden cursor-pointer shadow-md group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110" />

            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-ff-lime text-[#1b3a2a] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,240,44,0.3)]">
                  <div className="w-1.5 h-1.5 bg-[#1b3a2a] rounded-full animate-pulse" />
                  Live
                </div>
                <span className="text-white/60 text-sm font-medium">Tap to view map</span>
              </div>
              <ArrowRight className="text-white/40 group-hover:text-white transition-colors" />
            </div>

            <div className="relative z-10 mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                Andheri <span className="text-white/40">to</span> BKC
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-ff-lime tracking-tighter">28</span>
                <span className="text-xl font-bold text-white/70">min</span>
                <span className="ml-4 bg-white/10 px-3 py-1 rounded-lg text-sm font-medium text-white/90">ETA 09:18 AM</span>
              </div>
            </div>

            <div className="relative z-10 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Navigation size={16} className="text-ff-lime" />
                  On Time
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-ff-lime" />
                  <span className="text-xs font-mono font-bold text-ff-lime tracking-wide">
                    Confidence: {confidence}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-ff-lime rounded-full relative"
                  initial={{ width: '0%' }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1], delay: 0.6 }}
                >
                  <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40" />
                </motion.div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Route stability</span>
                <span className="text-[10px] font-medium text-white/40">Based on {disruptions.length} active disruptions</span>
              </div>
            </div>
          </motion.div>

          {/* ── SECTION 2 — RECENT ROUTES ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-gray-900">Recent Routes</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Your last {recentRoutes.length} trips</p>
              </div>
              <button onClick={() => onNavigate('history')} className="text-sm font-semibold text-[#3c7689] hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {recentRoutes.map((trip) => {
                const modeKey = getModeKey(trip.modeLabel);
                const colors = modeColors[modeKey] || modeColors.walk;
                const Icon = modeIcons[modeKey] || Footprints;
                const statusDot = trip.status === 'on-time' ? 'bg-emerald-500' : trip.status === 'delayed' ? 'bg-amber-500' : 'bg-red-500';

                return (
                  <motion.div
                    key={trip.id}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => onNavigate('plan')}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className={colors.text} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {trip.from}<span className="text-gray-400 font-normal mx-1.5">→</span>{trip.to}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>
                          {trip.modeLabel}
                        </span>
                        <span className="text-[10px] text-gray-400">{trip.date} · {trip.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 tabular-nums">₹{trip.cost}</p>
                        <p className="text-[10px] text-gray-400 tabular-nums">{trip.duration} min</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${statusDot}`} title={trip.status} />
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── SECTION 3 — ROUTE INSIGHTS ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-gray-900">Route Insights</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Smart observations from your travel patterns</p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-gray-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">
                        {insight.text.split(insight.highlight || '').map((part, j, arr) => (
                          arr.length > 1 && insight.highlight && j === 0 ? (
                            <span key={j}>
                              {part}
                              <span className="font-bold text-gray-900">{insight.highlight}</span>
                            </span>
                          ) : j === arr.length - 1 && arr.length > 1 ? (
                            <span key={j}>{part}</span>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        ))}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">

          {/* ══ LIVE LOCATION CARD ════════════════════════════════════════ */}
          <LiveLocationCard onNavigate={onNavigate} />

          {/* ── SECTION 4 — QUICK ACTIONS ── */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('planner')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#f4f7eb] border border-[#e0e8d5] hover:bg-[#e8f0db] transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1b3a2a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Navigation size={18} className="text-ff-lime" />
                </div>
                <span className="text-xs font-bold text-gray-900">Plan Route</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('map')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MapPin size={18} className="text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900">Live Map</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('comparison')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GitCompare size={18} className="text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900">Compare</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('alerts')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                  <AlertTriangle size={18} className="text-white" />
                  {disruptions.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {disruptions.length}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-900">Disruptions</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Live Disruptions */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-base text-gray-900">Live Disruptions</h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {disruptions.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('alerts')}
                  className={`relative p-4 rounded-2xl border cursor-pointer overflow-hidden transition-shadow hover:shadow-md ${
                    d.type === 'cancellation' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${d.type === 'cancellation' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div className="flex items-start gap-3 ml-2">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${d.type === 'cancellation' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}>
                      <AlertTriangle size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 mb-1">{d.route}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${d.type === 'cancellation' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                          {d.type === 'delay' ? `Delayed ${d.delay} min` : 'Cancelled'}
                        </span>
                        <span className="text-[10px] font-medium text-gray-400">3 min ago</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Saved Routes */}
          <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-gray-900">Saved Routes</h3>
              <button onClick={() => onNavigate('plan')} className="text-sm font-semibold text-[#3c7689] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {savedRoutes.map((route) => {
                const modeKey = getModeKey(route.modeLabel);
                const colors = modeColors[modeKey];
                const Icon = modeIcons[modeKey] || Train;
                return (
                  <motion.div
                    key={route.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('plan')}
                    className={`relative p-4 rounded-2xl ${colors.bg} border ${colors.border} cursor-pointer group overflow-hidden transition-shadow hover:shadow-md`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.dot} rounded-r-full`} />
                    <div className="flex items-start gap-3 ml-2">
                      <div className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border} flex-shrink-0`}>
                        <Icon size={18} className={colors.text} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="font-bold text-gray-900 text-sm truncate pr-2">
                            {route.from}<span className="text-gray-400 font-normal mx-1.5">→</span>{route.to}
                          </p>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text} border ${colors.border}`}>
                            <Icon size={10} strokeWidth={3} />{route.modeLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                            <Clock size={11} strokeWidth={2.5} />{route.duration} min
                          </span>
                          <span className="text-xs font-bold text-gray-900">₹{route.cost}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

const modeLabels: Record<string, string> = {
  metro: 'Metro',
  bus: 'Bus',
  walk: 'Walking',
  auto: 'Auto',
  train: 'Train',
};

export default DashboardScreen;
