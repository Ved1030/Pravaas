import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Train, Bus, Car, Footprints,
  AlertTriangle, Calendar, Shield, Clock, CheckCircle2,
  AlertCircle, TrendingDown, Wallet, BarChart3, Route,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type JourneyStatus = 'on-time' | 'delayed' | 'disrupted';
type TransitMode = 'metro' | 'bus' | 'auto' | 'walk';

interface Journey {
  id: string;
  from: string;
  to: string;
  mode: TransitMode;
  modeLabel: string;
  routeType?: 'fastest' | 'cheapest' | 'comfort';
  date: string;
  time: string;
  duration: number;
  cost: number;
  timeSaved?: number;
  costSaved?: number;
  status: JourneyStatus;
  rerouted?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const journeyHistory: Journey[] = [
  { id: 'j01', from: 'Vasai', to: 'Churchgate', mode: 'metro', modeLabel: 'Walk → Train → Walk', routeType: 'fastest', date: 'March 31, 2026', time: '08:10 AM', duration: 74, cost: 35, timeSaved: 8, costSaved: 45, status: 'on-time' },
  { id: 'j02', from: 'Churchgate', to: 'Vasai', mode: 'metro', modeLabel: 'Walk → Train → Walk', routeType: 'cheapest', date: 'March 31, 2026', time: '07:05 PM', duration: 80, cost: 35, timeSaved: 0, costSaved: 20, status: 'delayed' },
  { id: 'j03', from: 'Andheri', to: 'Nariman Point', mode: 'metro', modeLabel: 'Metro → Walk → Bus', routeType: 'fastest', date: 'March 28, 2026', time: '09:15 AM', duration: 52, cost: 42, timeSaved: 12, costSaved: 0, status: 'on-time' },
  { id: 'j04', from: 'Nariman Point', to: 'Andheri', mode: 'bus', modeLabel: 'Bus → Metro', routeType: 'cheapest', date: 'March 28, 2026', time: '06:50 PM', duration: 65, cost: 22, timeSaved: 0, costSaved: 30, status: 'delayed' },
  { id: 'j05', from: 'Borivali', to: 'Churchgate', mode: 'metro', modeLabel: 'Walk → Train → Walk', routeType: 'fastest', date: 'March 27, 2026', time: '08:30 AM', duration: 58, cost: 30, timeSaved: 6, costSaved: 0, status: 'on-time' },
  { id: 'j06', from: 'Churchgate', to: 'Dadar', mode: 'metro', modeLabel: 'Train → Walk', routeType: 'comfort', date: 'March 27, 2026', time: '01:15 PM', duration: 18, cost: 10, timeSaved: 2, costSaved: 5, status: 'on-time' },
  { id: 'j07', from: 'Dadar', to: 'Borivali', mode: 'bus', modeLabel: 'Bus → Walk', routeType: 'cheapest', date: 'March 27, 2026', time: '07:40 PM', duration: 45, cost: 15, timeSaved: 0, costSaved: 25, status: 'disrupted', rerouted: true },
  { id: 'j08', from: 'Thane', to: 'Fort', mode: 'metro', modeLabel: 'Train → Walk → Bus', routeType: 'fastest', date: 'March 26, 2026', time: '08:00 AM', duration: 62, cost: 38, timeSaved: 9, costSaved: 0, status: 'on-time' },
  { id: 'j09', from: 'Fort', to: 'Bandra', mode: 'auto', modeLabel: 'Walk → Auto', routeType: 'comfort', date: 'March 26, 2026', time: '03:30 PM', duration: 35, cost: 95, timeSaved: 5, costSaved: 0, status: 'on-time' },
  { id: 'j10', from: 'Bandra', to: 'Thane', mode: 'metro', modeLabel: 'Metro → Train', routeType: 'fastest', date: 'March 26, 2026', time: '08:10 PM', duration: 55, cost: 32, timeSaved: 7, costSaved: 10, status: 'on-time' },
  { id: 'j11', from: 'Ghatkopar', to: 'Churchgate', mode: 'metro', modeLabel: 'Metro → Train → Walk', routeType: 'fastest', date: 'March 25, 2026', time: '07:55 AM', duration: 44, cost: 28, timeSaved: 11, costSaved: 0, status: 'delayed', rerouted: true },
  { id: 'j12', from: 'Churchgate', to: 'Ghatkopar', mode: 'metro', modeLabel: 'Walk → Train → Metro', routeType: 'cheapest', date: 'March 25, 2026', time: '06:20 PM', duration: 46, cost: 28, timeSaved: 0, costSaved: 15, status: 'on-time' },
  { id: 'j13', from: 'Vasai', to: 'Dadar', mode: 'metro', modeLabel: 'Walk → Train → Walk', routeType: 'fastest', date: 'March 24, 2026', time: '08:20 AM', duration: 66, cost: 32, timeSaved: 5, costSaved: 0, status: 'on-time' },
  { id: 'j14', from: 'Dadar', to: 'Vasai', mode: 'metro', modeLabel: 'Walk → Train → Auto', routeType: 'comfort', date: 'March 24, 2026', time: '07:00 PM', duration: 70, cost: 72, timeSaved: 0, costSaved: 0, status: 'disrupted', rerouted: true },
];

const weeklyTrips = [
  { day: 'Mon', trips: 2, mode: 'metro' },
  { day: 'Tue', trips: 2, mode: 'metro' },
  { day: 'Wed', trips: 3, mode: 'metro' },
  { day: 'Thu', trips: 3, mode: 'metro' },
  { day: 'Fri', trips: 3, mode: 'bus' },
  { day: 'Sat', trips: 0, mode: 'walk' },
  { day: 'Sun', trips: 1, mode: 'bus' },
];

const trendData = [
  { day: 1, time: 74 }, { day: 2, time: 38 }, { day: 3, time: 70 },
  { day: 4, time: 66 }, { day: 5, time: 90 }, { day: 6, time: 85 },
  { day: 7, time: 40 }, { day: 8, time: 74 }, { day: 9, time: 46 },
  { day: 10, time: 70 }, { day: 11, time: 38 }, { day: 12, time: 62 },
  { day: 13, time: 55 }, { day: 14, time: 85 }, { day: 15, time: 30 },
  { day: 16, time: 68 }, { day: 17, time: 52 }, { day: 18, time: 44 },
  { day: 19, time: 38 }, { day: 20, time: 40 }, { day: 21, time: 50 },
  { day: 22, time: 30 }, { day: 23, time: 66 }, { day: 24, time: 70 },
  { day: 25, time: 44 }, { day: 26, time: 62 }, { day: 27, time: 45 },
  { day: 28, time: 52 }, { day: 29, time: 30 }, { day: 30, time: 80 },
];

const costData = [
  { name: 'Metro', value: 569, color: '#3B82F6' },
  { name: 'Bus', value: 183, color: '#f59e0b' },
  { name: 'Auto', value: 275, color: '#22C55E' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<TransitMode, { icon: any; bg: string; border: string; text: string; barColor: string }> = {
  metro: { icon: Train, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', barColor: '#3B82F6' },
  bus: { icon: Bus, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', barColor: '#f59e0b' },
  auto: { icon: Car, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', barColor: '#22C55E' },
  walk: { icon: Footprints, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', barColor: '#A1A1AA' },
};

const STATUS_CONFIG: Record<JourneyStatus, { icon: any; label: string; bg: string; text: string; border: string; dot: string }> = {
  'on-time': { icon: CheckCircle2, label: 'On Time', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  delayed: { icon: AlertCircle, label: 'Delayed', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
  disrupted: { icon: AlertTriangle, label: 'Disrupted', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
};

const ROUTE_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  fastest: { label: 'Fastest', bg: 'bg-[#1b3a2a]', text: 'text-white' },
  cheapest: { label: 'Cheapest', bg: 'bg-blue-600', text: 'text-white' },
  comfort: { label: 'Comfort', bg: 'bg-orange-500', text: 'text-white' },
};

const filterConfig = [
  { id: 'ALL', icon: null, label: 'All' },
  { id: 'METRO', icon: Train, label: 'Metro' },
  { id: 'BUS', icon: Bus, label: 'Bus' },
  { id: 'AUTO', icon: Car, label: 'Auto' },
  { id: 'DISRUPTED', icon: AlertTriangle, label: 'Disrupted' },
  { id: 'THIS_WEEK', icon: Calendar, label: 'This Week' },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ─── Counter Hook ─────────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1.5) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(id);
  }, [target, duration]);
  return val;
}

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

function hasJourneyOn(year: number, month: number, day: number) {
  return journeyHistory.some(j => {
    const d = new Date(j.date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });
}

function hasDisruptionOn(year: number, month: number, day: number) {
  return journeyHistory.some(j => {
    const d = new Date(j.date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day &&
      (j.status === 'disrupted' || j.status === 'delayed');
  });
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ year, month }: { year: number; month: number }) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="grid grid-cols-7 gap-y-1">
      {dayLabels.map((d, i) => (
        <div key={i} className="text-center text-[9px] font-bold text-gray-400 pb-1">{d}</div>
      ))}
      {cells.map((day, i) => {
        if (!day) return <div key={`e-${i}`} />;
        const hasJ = hasJourneyOn(year, month, day);
        const hasD = hasDisruptionOn(year, month, day);
        return (
          <div
            key={day}
            className={`relative flex items-center justify-center w-full aspect-square text-[10px] font-semibold rounded-md ${
              hasJ ? (hasD ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700') : 'text-gray-400'
            }`}
          >
            {day}
            {hasJ && (
              <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${hasD ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const HistoryScreen = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [calendarMonth, setCalendarMonth] = useState(2);
  const [calendarYear, setCalendarYear] = useState(2026);

  const totalTrips = useCounter(32, 1.8);
  const totalCost = useCounter(840, 1.8);
  const totalTimeSaved = useCounter(4, 1.8);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const prevMonth = () => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); };
  const nextMonth = () => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); };

  const filteredJourneys = journeyHistory.filter(j => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'DISRUPTED') return j.status === 'disrupted';
    if (activeFilter === 'THIS_WEEK') {
      const weekAgo = new Date('March 25, 2026');
      return new Date(j.date) >= weekAgo;
    }
    return j.mode === activeFilter.toLowerCase();
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Journey History</h1>
        <p className="text-gray-500 font-medium">Track your commutes and analyze your travel patterns</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-6">

          {/* Monthly Summary Card */}
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">

            {/* Calendar Nav */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={15} strokeWidth={2.5} className="text-gray-600" />
                </button>
                <h3 className="font-bold text-base text-gray-900 min-w-[160px] text-center">
                  {monthNames[calendarMonth]} {calendarYear}
                </h3>
                <button
                  onClick={nextMonth}
                  className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={15} strokeWidth={2.5} className="text-gray-600" />
                </button>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl">
                This Month
              </span>
            </div>

            {/* Stat counters */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: totalTrips, label: 'Trips', icon: Route, color: 'text-gray-900', iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
                { value: `₹${totalCost}`, label: 'Spent', icon: Wallet, color: 'text-amber-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
                { value: `${totalTimeSaved}h`, label: 'Saved', icon: TrendingDown, color: 'text-emerald-600', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <div className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center mb-2`}>
                    <s.icon size={15} className={s.iconColor} strokeWidth={2.5} />
                  </div>
                  <p className={`text-2xl font-bold ${s.color} tabular-nums`}>{s.value}</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mini Calendar */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
              <MiniCalendar year={calendarYear} month={calendarMonth} />
              <div className="flex gap-4 mt-3 pt-2 border-t border-gray-200/60">
                <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Journey day
                </span>
                <span className="text-[9px] font-medium text-gray-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                  Delay / disruption
                </span>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrips} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 6]} width={20} />
                  <Tooltip
                    contentStyle={{ background: '#1b3a2a', border: 'none', borderRadius: 12, color: 'white', fontSize: 11 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="trips" radius={[6, 6, 0, 0]} animationDuration={800}>
                    {weeklyTrips.map((entry, i) => (
                      <Cell key={i} fill={MODE_CONFIG[entry.mode as TransitMode]?.barColor || '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mode share strip */}
            <div className="mt-4">
              <div className="flex gap-0.5 w-full h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '60%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '30%' }} />
                <div className="bg-gray-400 h-full" style={{ width: '10%' }} />
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-medium text-gray-500">🚇 Metro 60%</span>
                <span className="text-[10px] font-medium text-gray-500">🚌 Bus 30%</span>
                <span className="text-[10px] font-medium text-gray-500">🚶 Walk 10%</span>
              </div>
            </div>
          </motion.div>

          {/* Filter Chips */}
          <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filterConfig.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                  activeFilter === f.id
                    ? 'bg-[#1b3a2a] text-white border-[#1b3a2a] shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.icon && <f.icon size={12} strokeWidth={2.5} />}
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Journey List */}
          <motion.div variants={fadeUp} className="space-y-3">
            <AnimatePresence>
              {filteredJourneys.map((j, idx) => {
                const modeCfg = MODE_CONFIG[j.mode];
                const statusCfg = STATUS_CONFIG[j.status];
                const routeCfg = j.routeType ? ROUTE_TYPE_CONFIG[j.routeType] : null;
                const ModeIcon = modeCfg.icon;
                const StatusIcon = statusCfg.icon;

                return (
                  <motion.div
                    key={j.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ delay: idx * 0.04, duration: 0.28 }}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Mode icon */}
                      <div className={`w-10 h-10 rounded-xl ${modeCfg.bg} border ${modeCfg.border} flex items-center justify-center flex-shrink-0`}>
                        <ModeIcon size={16} className={modeCfg.text} strokeWidth={2.5} />
                      </div>

                      {/* Journey details */}
                      <div className="flex-1 min-w-0">
                        {/* Route: source → destination */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {j.from}
                            <span className="text-gray-400 font-normal mx-1.5">→</span>
                            {j.to}
                          </p>
                        </div>

                        {/* Tags row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Route Type */}
                          {routeCfg && (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${routeCfg.bg} ${routeCfg.text}`}>
                              {routeCfg.label}
                            </span>
                          )}
                          {/* Mode label */}
                          <span className="text-[10px] font-medium text-gray-400">{j.modeLabel}</span>
                          {/* Rerouted badge */}
                          {j.rerouted && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">
                              Rerouted
                            </span>
                          )}
                        </div>

                        {/* Date & Time */}
                        <p className="text-[10px] font-medium text-gray-400 mt-1.5">{j.date} · {j.time}</p>

                        {/* Savings row */}
                        {((j.timeSaved || 0) > 0 || (j.costSaved || 0) > 0) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {(j.timeSaved || 0) > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                <Clock size={9} />
                                Saved {j.timeSaved} min
                              </span>
                            )}
                            {(j.costSaved || 0) > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                                <Wallet size={9} />
                                Saved ₹{j.costSaved}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Duration, Cost, Status */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                        <div>
                          <p className="font-bold text-sm text-gray-900 tabular-nums">{j.duration} min</p>
                          <p className="text-xs font-semibold text-gray-500 tabular-nums">₹{j.cost}</p>
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${statusCfg.bg} ${statusCfg.border} border`}>
                          <StatusIcon size={9} className={statusCfg.text} />
                          <span className={`text-[9px] font-bold ${statusCfg.text}`}>{statusCfg.label}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredJourneys.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Route size={20} className="text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500 text-sm">No journeys found</p>
                <p className="text-xs text-gray-400 mt-1">Try changing the filter above</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-6">

          {/* 30-Day Trend Chart */}
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={16} className="text-[#1b3a2a]" />
              <h3 className="font-bold text-base text-gray-900">30-Day Commute Trend</h3>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="commuteFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="m" domain={[0, 110]} width={30} />
                  <Tooltip
                    contentStyle={{ background: '#1b3a2a', border: 'none', borderRadius: 12, color: 'white', fontSize: 11 }}
                    formatter={(v: any) => [`${v} min`, 'Duration']}
                  />
                  <Area type="monotone" dataKey="time" stroke="#3B82F6" fill="url(#commuteFill)" strokeWidth={2} dot={false} animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Cost Breakdown</h3>
            <div className="flex items-center gap-6">
              <div className="h-[160px] flex-shrink-0" style={{ width: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      strokeWidth={2}
                      stroke="#fff"
                      animationDuration={1000}
                    >
                      {costData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1b3a2a', border: 'none', borderRadius: 12, color: 'white', fontSize: 11 }}
                      formatter={(v: any) => [`₹${v}`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {costData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium text-gray-700">{d.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{d.value}</p>
                      <p className="text-[10px] text-gray-400">{Math.round(d.value / (569 + 183 + 275) * 100)}%</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Total Spent</span>
                    <span className="text-sm font-bold text-gray-900">₹{569 + 183 + 275}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Insights & Achievements</h3>
            <div className="space-y-3">
              {[
                { emoji: '🔥', title: '7-Day Streak', desc: 'Public transit every weekday', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
                { emoji: '🌱', title: '8.2 kg CO₂ Saved', desc: 'This month vs. driving', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
                { emoji: '⚡', title: 'Speed Demon', desc: 'Avg 26 min — 4 min < city avg', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
                { emoji: '🏆', title: 'Smart Commuter', desc: '78% AI recommendations accepted', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700' },
              ].map((a, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl ${a.bg} border ${a.border}`}>
                  <span className="text-xl">{a.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${a.text}`}>{a.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{a.desc}</p>
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

export default HistoryScreen;