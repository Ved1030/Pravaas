import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Flag, ArrowUpDown, Zap, IndianRupee, Users,
  Clock, Shield, Sparkles, AlertCircle, Loader2,
  TrendingDown, Wallet, Gauge, AlertTriangle, CheckCircle2,
  BarChart3, Train, Bus, Car, Footprints, GitCompare,
  Cloud, Brain, Award,
} from 'lucide-react';
import { planRoute, getConnectionStateMessage, onConnectionStateChange, getConnectionState, type ConnectionState, type BackendRoute, type AIRecommendation, aiCompare } from '@/lib/api';
import ComfortScore from '@/components/ComfortScore';
import CrowdIndicator from '@/components/CrowdIndicator';
import WeatherImpact from '@/components/WeatherImpact';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const routeTypeConfig: Record<string, { bg: string; text: string; label: string; icon: any; color: string }> = {
  fastest:  { bg: 'bg-[#1b3a2a]',    text: 'text-white', label: 'Fastest',  icon: Zap,         color: '#22c55e' },
  cheapest: { bg: 'bg-blue-600',      text: 'text-white', label: 'Cheapest', icon: IndianRupee, color: '#3b82f6' },
  comfort:  { bg: 'bg-orange-500',    text: 'text-white', label: 'Comfort',  icon: Users,       color: '#f97316' },
};

const trafficConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  low:    { label: 'Low',      color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  medium: { label: 'Moderate', color: 'text-amber-600',   bg: 'bg-amber-50',   dot: 'bg-amber-500'   },
  high:   { label: 'Heavy',    color: 'text-red-600',     bg: 'bg-red-50',     dot: 'bg-red-500'     },
};

const resourceConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  walk:   { icon: Footprints, color: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-200'   },
  metro:  { icon: Train,      color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200'   },
  bus:    { icon: Bus,        color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200'  },
  train:  { icon: Train,      color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  cab:    { icon: Car,        color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-200' },
  auto:   { icon: Car,        color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200'},
};

function getConfidenceStyle(score: number) {
  if (score >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50',  label: 'High' };
  if (score >= 75) return { bar: 'bg-amber-400',   text: 'text-amber-600',   bg: 'bg-amber-50',    label: 'Good' };
  return              { bar: 'bg-red-400',    text: 'text-red-600',    bg: 'bg-red-50',     label: 'Fair' };
}

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const s = getConfidenceStyle(pct);
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className={s.text} />
          <span className={`text-xs font-bold ${s.text}`}>{pct}%</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${s.bg} ${s.text}`}>{s.label}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">AI confidence</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${s.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

function ConfidenceCell({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const s = getConfidenceStyle(pct);
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
      <div className="flex items-center gap-1.5">
        <span className={`text-sm font-bold tabular-nums ${s.text}`}>{pct}%</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${s.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ResourceFlow({ resources }: { resources: any[] }) {
  if (!resources || resources.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {resources.map((res, i) => {
        const cfg = resourceConfig[res.type] || resourceConfig.walk;
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
              <Icon size={13} className={cfg.color} strokeWidth={2} />
              <span className={`text-xs font-semibold ${cfg.color}`}>{res.duration} min</span>
            </div>
            {i < resources.length - 1 && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-300 flex-shrink-0">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

const RouteComparisonScreen = () => {
  const [origin, setOrigin] = useState('Andheri Station');
  const [dest, setDest]     = useState('BKC, Mumbai');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [routes, setRoutes]         = useState<BackendRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [recommended, setRecommended]     = useState<AIRecommendation | null>(null);
  const [hasSearched, setHasSearched]     = useState(false);
  const [connState, setConnState] = useState<ConnectionState>(getConnectionState());
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    return onConnectionStateChange(setConnState);
  }, []);

  const handleCompare = async () => {
    const src = origin.trim();
    const dst = dest.trim();
    if (!src || !dst) { setError('Please enter both origin and destination.'); return; }
    setError(null);
    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);
    setHasSearched(true);
    setComparisonData(null);
    try {
      const data = await planRoute(src, dst);
      const backendRoutes = data?.routes || [];
      const recId = data?.recommended?.routeId;
      setRoutes(backendRoutes);
      setSelectedRoute(recId || backendRoutes[0]?.id || null);
      setRecommended(data?.recommended || null);
      setAiLoading(true);
      aiCompare(src, dst).then((cmp) => {
        setComparisonData(cmp?.comparison || null);
      }).catch(() => {}).finally(() => setAiLoading(false));
    } catch {
      setError(getConnectionStateMessage(connState) || 'Could not connect to the backend. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCompare();
  };

  const activeRoute = routes.find(r => r.id === selectedRoute);
  const comparisonForSelected = comparisonData?.comparisons?.find((c: any) => c.routeId === selectedRoute);

  const metrics = [
    { key: 'durationMin',    label: 'Travel Time', icon: Clock,          format: (v: any) => `${v} min` },
    { key: 'estimatedCost',  label: 'Est. Cost',   icon: Wallet,         format: (v: any) => `₹${v}` },
    { key: 'distanceKm',     label: 'Distance',    icon: TrendingDown,   format: (v: any) => `${v} km` },
    { key: 'trafficLevel',   label: 'Traffic',     icon: Gauge,          format: (v: any) => trafficConfig[v]?.label || v },
    { key: 'predictedDelay', label: 'Peak Delay',  icon: AlertTriangle,  format: (v: any) => v > 0 ? `+${v} min` : 'None' },
  ];

  const bestValues: Record<string, number> = {};
  if (routes.length > 0) {
    bestValues['durationMin']    = Math.min(...routes.map(r => r.durationMin));
    bestValues['estimatedCost']  = Math.min(...routes.map(r => r.estimatedCost));
    bestValues['distanceKm']     = Math.min(...routes.map(r => r.distanceKm));
    bestValues['predictedDelay'] = Math.min(...routes.map(r => r.predictedDelay || 0));
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">

      <motion.div variants={fadeUp} className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-[#1b3a2a] flex items-center justify-center">
            <GitCompare size={18} className="text-[#c5f02c]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Route Comparison</h1>
        </div>
        <p className="text-gray-500 font-medium ml-[52px]">Side-by-side analysis of Fastest, Cheapest &amp; Comfort routes</p>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-lg text-gray-900 mb-6">Compare Routes</h3>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} strokeWidth={2.5} className="text-blue-600" />
            </div>
            <input
              value={origin}
              onChange={e => { setOrigin(e.target.value); setRoutes([]); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter origin..."
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={() => { const t = origin; setOrigin(dest); setDest(t); setRoutes([]); }}
            className="w-10 h-10 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors self-center flex-shrink-0 mx-auto"
          >
            <ArrowUpDown size={15} strokeWidth={2.5} className="text-gray-500" />
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
              <Flag size={16} strokeWidth={2.5} className="text-red-500" />
            </div>
            <input
              value={dest}
              onChange={e => { setDest(e.target.value); setRoutes([]); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter destination..."
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleCompare} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1b3a2a] to-[#2c5f45] text-white rounded-2xl font-bold text-sm shadow-[0_8px_16px_rgba(27,58,42,0.2)] hover:shadow-[0_12px_20px_rgba(27,58,42,0.3)] transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Comparing…</>
              : <><GitCompare size={16} /> Compare Now</>}
          </motion.button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-red-600">{error}</p>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1b3a2a]/10 flex items-center justify-center">
              <Loader2 size={28} className="text-[#1b3a2a] animate-spin" />
            </div>
            <p className="text-gray-500 font-medium">
              {connState === 'retrying' || connState === 'waking'
                ? getConnectionStateMessage(connState)
                : 'Generating comparison across all routes…'}
            </p>
          </motion.div>
        )}

        {!loading && routes.length > 0 && (
          <motion.div key="results" variants={stagger} initial="hidden" animate="show" className="space-y-8">

            {recommended && (
              <motion.div variants={fadeUp}
                className="bg-gradient-to-r from-[#1b3a2a] to-[#2c5f45] rounded-[24px] p-6 text-white">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-[#c5f02c]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#c5f02c]">AI Recommendation</span>
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">{recommended.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {(recommended.insights?.timeSaved || 0) > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                          <TrendingDown size={11} className="text-[#c5f02c]" />
                          Saves {recommended.insights!.timeSaved} min
                        </span>
                      )}
                      {(recommended.insights?.costSaved || 0) > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                          <Wallet size={11} className="text-[#c5f02c]" />
                          ₹{recommended.insights!.costSaved} cheaper
                        </span>
                      )}
                      {recommended.insights?.avoidedTraffic && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/10 px-3 py-1.5 rounded-xl">
                          <Gauge size={11} className="text-[#c5f02c]" />
                          Avoids heavy traffic
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 text-center flex-shrink-0 min-w-[108px]">
                    <Shield size={18} className="text-[#c5f02c] mx-auto mb-1" />
                    <p className="text-3xl font-bold tabular-nums text-white leading-none">
                      {recommended.confidence ?? 85}%
                    </p>
                    <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wider mt-1">Overall Score</p>
                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#c5f02c] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${recommended.confidence ?? 85}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {comparisonData?.winners && Object.keys(comparisonData.winners).length > 0 && (
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-[#1b3a2a]" />
                  <h3 className="font-semibold text-sm text-gray-900">AI Comparison Winners</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(comparisonData.winners).map(([category, routeId]) => {
                    const route = routes.find(r => r.id === routeId);
                    if (!route) return null;
                    const cfg = routeTypeConfig[route.type] || routeTypeConfig.comfort;
                    return (
                      <div key={category} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{category}</p>
                        <div className={`${cfg.bg} ${cfg.text} inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold`}>
                          <cfg.icon size={10} />
                          {cfg.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {routes.map(route => {
                const cfg        = routeTypeConfig[route.type] || routeTypeConfig.comfort;
                const traffic    = trafficConfig[route.trafficLevel] || trafficConfig.medium;
                const BadgeIcon  = cfg.icon;
                const isSelected = route.id === selectedRoute;
                const isAIPick   = route.id === recommended?.routeId;
                const confidence = route.confidence ?? 0;

                const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                const comfortScore = cmp?.metrics?.comfort?.score;
                const delayRisk = cmp?.metrics?.delayRisk;
                const weatherImpact = comparisonData?.weather;

                return (
                  <motion.div
                    key={route.id}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRoute(route.id)}
                    className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col ${
                      isSelected
                        ? 'border-2 border-[#1b3a2a]/30 bg-white shadow-lg ring-1 ring-[#1b3a2a]/10'
                        : 'border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${cfg.bg} ${cfg.text} px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5`}>
                        <BadgeIcon size={12} strokeWidth={3} />
                        {cfg.label}
                        {isAIPick && (
                          <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">AI Pick</span>
                        )}
                      </div>
                      {isSelected && <CheckCircle2 size={16} className="text-[#1b3a2a]" />}
                    </div>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900 tabular-nums">{route.durationMin}</span>
                      <span className="text-sm font-medium text-gray-400">min</span>
                      <span className="ml-auto text-lg font-semibold text-gray-700">₹{route.estimatedCost}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-gray-400">{route.distanceKm} km</span>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${traffic.bg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${traffic.dot}`} />
                        <span className={`text-[10px] font-semibold ${traffic.color}`}>{traffic.label}</span>
                      </div>
                      {delayRisk && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${delayRisk.color.bg}`}>
                          <span className={`text-[10px] font-semibold ${delayRisk.color.text}`}>
                            {delayRisk.probability}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50/80 rounded-xl p-3 mb-4 flex-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Transport Mix</p>
                      <ResourceFlow resources={route.resources || []} />
                      {comfortScore !== undefined && (
                        <div className="mt-2 pt-2 border-t border-gray-200/50 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-gray-400">Comfort</span>
                          <ComfortScore score={comfortScore} size={28} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <ConfidenceBar score={confidence} />
                      {(route.predictedDelay || 0) > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <AlertTriangle size={11} className="text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">+{route.predictedDelay} min peak delay</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-[#1b3a2a]" />
                  <h3 className="font-semibold text-base text-gray-900">Detailed Comparison</h3>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">All metrics side by side. Best value highlighted.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                        Metric
                      </th>
                      {routes.map(route => {
                        const cfg = routeTypeConfig[route.type] || routeTypeConfig.comfort;
                        const Icon = cfg.icon;
                        const isSel = route.id === selectedRoute;
                        return (
                          <th key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 cursor-pointer transition-colors ${isSel ? 'bg-[#f0f7f2]' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedRoute(route.id)}>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`${cfg.bg} ${cfg.text} w-8 h-8 rounded-xl flex items-center justify-center`}>
                                <Icon size={14} strokeWidth={2.5} />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{cfg.label}</span>
                              {isSel && <span className="text-[9px] font-bold bg-[#1b3a2a] text-white px-1.5 py-0.5 rounded-md">Selected</span>}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(({ key, label, icon: Icon, format }, mIdx) => (
                      <tr key={key} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-600">{label}</span>
                          </div>
                        </td>
                        {routes.map(route => {
                          const rawVal = (route as any)[key];
                          const best   = bestValues[key];
                          const isBest = key !== 'trafficLevel' && rawVal === best;
                          const isSel  = route.id === selectedRoute;
                          return (
                            <td key={route.id}
                              className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                              {key === 'trafficLevel' ? (() => {
                                const tc = trafficConfig[rawVal] || trafficConfig.medium;
                                return (
                                  <span className={`text-[10px] font-bold ${tc.color} ${tc.bg} px-2 py-0.5 rounded-lg`}>
                                    {tc.label}
                                  </span>
                                );
                              })() : (
                                <span className={`text-sm font-bold ${isBest ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg' : 'text-gray-900'}`}>
                                  {format(rawVal)}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    <tr className="bg-white">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Delay Risk</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                        const dr = cmp?.metrics?.delayRisk;
                        const isSel = route.id === selectedRoute;
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            {dr ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={`text-sm font-bold ${dr.color.text}`}>{dr.probability}%</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dr.color.bg} ${dr.color.text}`}>{dr.label}</span>
                              </div>
                            ) : <span className="text-sm text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50/50">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Comfort Score</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                        const cs = cmp?.metrics?.comfort?.score;
                        const isSel = route.id === selectedRoute;
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            {cs !== undefined ? (
                              <div className="flex justify-center">
                                <ComfortScore score={cs} size={40} strokeWidth={3} />
                              </div>
                            ) : <span className="text-sm text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-white">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Cloud size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Weather Impact</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                        const wi = cmp?.metrics?.weatherImpact;
                        const isSel = route.id === selectedRoute;
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            {wi !== undefined ? (
                              <span className={`text-sm font-bold ${wi > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {wi > 0 ? `+${wi} min` : 'None'}
                              </span>
                            ) : <span className="text-sm text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50/50">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Footprints size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Walking Distance</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                        const wd = cmp?.metrics?.walkingDistance?.value;
                        const isSel = route.id === selectedRoute;
                        const walkingMinValues = [0, ...routes.map(r => {
                          const rc = comparisonData?.comparisons?.find((c: any) => c.routeId === r.id);
                          return rc?.metrics?.walkingDistance?.value ?? Infinity;
                        })];
                        const bestWalk = Math.min(...walkingMinValues.filter(v => v > 0));
                        const isBestWalk = wd === bestWalk;
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            {wd !== undefined ? (
                              <span className={`text-sm font-bold ${isBestWalk ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg' : 'text-gray-900'}`}>
                                {Math.round(wd)} min
                              </span>
                            ) : <span className="text-sm text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-white">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <GitCompare size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Transfers</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const tr = route.transfers ?? 0;
                        const isSel = route.id === selectedRoute;
                        const allTransfers = routes.map(r => r.transfers ?? 0);
                        const bestTransfer = Math.min(...allTransfers);
                        const isBest = tr === bestTransfer;
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            <span className={`text-sm font-bold ${isBest ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg' : 'text-gray-900'}`}>
                              {tr}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-white border-t-2 border-gray-100">
                      <td className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Shield size={13} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-gray-600">AI Confidence</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const isSel = route.id === selectedRoute;
                        return (
                          <td key={route.id}
                            className={`px-6 py-5 border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            <div className="flex justify-center">
                              <ConfidenceCell score={route.confidence ?? 0} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-gray-50/50">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Train size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Transport Mix</span>
                        </div>
                      </td>
                      {routes.map(route => (
                        <td key={route.id}
                          className={`px-6 py-4 border-b border-gray-100 ${route.id === selectedRoute ? 'bg-[#f0f7f2]/50' : ''}`}>
                          <div className="flex justify-center">
                            <ResourceFlow resources={route.resources || []} />
                          </div>
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-white">
                      <td className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Crowd Level</span>
                        </div>
                      </td>
                      {routes.map(route => {
                        const cmp = comparisonData?.comparisons?.find((c: any) => c.routeId === route.id);
                        const crowdAvg = cmp?.metrics?.crowd?.average;
                        const isSel = route.id === selectedRoute;
                        const crowdLevel = crowdAvg !== undefined
                          ? (crowdAvg >= 70 ? 'very_high' : crowdAvg >= 50 ? 'high' : crowdAvg >= 30 ? 'medium' : 'low')
                          : 'low';
                        return (
                          <td key={route.id}
                            className={`px-6 py-4 text-center border-b border-gray-100 transition-colors ${isSel ? 'bg-[#f0f7f2]/50' : ''}`}>
                            {crowdAvg !== undefined ? (
                              <CrowdIndicator level={crowdLevel} score={crowdAvg} />
                            ) : <span className="text-sm text-gray-400">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-gray-50/50 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                  <span className="text-[11px] text-gray-500 font-medium">Green cell = best value</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-3 h-1.5 rounded-full bg-amber-400" />
                    <div className="w-2 h-1.5 rounded-full bg-red-400" />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">Confidence: High / Good / Fair</span>
                </div>
              </div>
            </motion.div>

            {activeRoute && (
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-base text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#1b3a2a]" />
                  Selected Route — {routeTypeConfig[activeRoute.type]?.label || activeRoute.type}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {([
                    { icon: Clock,       label: 'Total Time',     value: `${activeRoute.durationMin} min`,   sub: activeRoute.predictedDelay > 0 ? `+${activeRoute.predictedDelay} min peak` : undefined },
                    { icon: Wallet,      label: 'Estimated Cost', value: `₹${activeRoute.estimatedCost}`,   sub: undefined },
                    { icon: TrendingDown,label: 'Distance',       value: `${activeRoute.distanceKm} km`,    sub: undefined },
                  ] as const).map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{value}</p>
                      {sub && <p className="text-xs text-amber-600 mt-1 font-medium">{sub}</p>}
                    </div>
                  ))}

                  {comparisonForSelected?.metrics?.comfort && (
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Comfort</span>
                      <ComfortScore score={comparisonForSelected.metrics.comfort.score} size={48} strokeWidth={4} />
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Confidence</span>
                    </div>
                    <ConfidenceBar score={activeRoute.confidence ?? 0} />
                  </div>
                </div>

                {comparisonData?.weather && (
                  <div className="mt-4">
                    <WeatherImpact weather={comparisonData.weather} />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {!loading && !hasSearched && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
              <GitCompare size={32} className="text-gray-300" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2 text-lg">Compare Routes Instantly</h4>
            <p className="text-sm text-gray-400 font-medium max-w-sm">
              Enter your origin and destination above to get a detailed side-by-side comparison of Fastest, Cheapest, and Comfort routes.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RouteComparisonScreen;
