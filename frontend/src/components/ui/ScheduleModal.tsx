// src/components/ui/ScheduleModal.tsx
// Self-contained schedule modal.
// Writes scheduled routes to localStorage under key: 'riq_scheduled_routes'
// HistoryScreen reads this same key on mount.

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  X, Calendar, Clock, CheckCircle2,
  Train, Bus, Car, Footprints, ChevronLeft, ChevronRight,
  MapPin, Flag, Zap, IndianRupee, Users,
} from 'lucide-react';

// ── Shared localStorage key ────────────────────────────────────────────────────
export const SCHEDULED_ROUTES_KEY = 'riq_scheduled_routes';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ScheduledRoute {
  id:          string;
  from:        string;
  to:          string;
  date:        string;        // 'YYYY-MM-DD'
  time:        string;        // 'HH:MM'
  routeType:   string;        // 'fastest' | 'cheapest' | 'comfort' | 'balanced' | 'eco'
  badge:       string;        // display label e.g. "FASTEST"
  duration:    number;        // minutes
  cost:        number;        // ₹
  modeLabel:   string;        // e.g. "Metro L1 · Walk"
  confidence:  number;
  scheduledAt: string;        // ISO timestamp when user clicked schedule
}

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  route: {
    id:         string | number;
    from:       string;
    to:         string;
    badge:      string;
    badgeColor: string;
    totalTime:  number;
    cost:       number;
    routeType?: string;
    confidence: number;
    segments:   Array<{ mode: string; label: string; duration?: number }>;
    scheduleDate?: string;
    scheduleTime?: string;
  } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0');

function formatDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function buildModeLabel(segments: Props['route']['segments']): string {
  if (!segments || segments.length === 0) return 'Multi-modal';
  return segments.map(s => s.label.split('·')[0].trim()).join(' → ');
}

// ── Quick date chips: today + next 6 days ─────────────────────────────────────
function getQuickDates(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

// ── Route type → badge colors (matches PlannerScreen) ─────────────────────────
const BADGE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  accent:  { bg: 'bg-[#1b3a2a]', text: 'text-white',         icon: Zap         },
  success: { bg: 'bg-emerald-600', text: 'text-white',        icon: IndianRupee },
  muted:   { bg: 'bg-gray-100',   text: 'text-gray-600',      icon: Users       },
};

const MODE_ICONS: Record<string, any> = {
  metro: Train, bus: Bus, auto: Car, walk: Footprints, train: Train, cab: Car,
};

// ── Hours for picker ──────────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// ── Save to localStorage ──────────────────────────────────────────────────────
function saveScheduledRoute(entry: ScheduledRoute) {
  try {
    const raw     = localStorage.getItem(SCHEDULED_ROUTES_KEY);
    const existing: ScheduledRoute[] = raw ? JSON.parse(raw) : [];
    existing.unshift(entry); // newest first
    localStorage.setItem(SCHEDULED_ROUTES_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save scheduled route', e);
  }
}

// ── Animation variants ────────────────────────────────────────────────────────
const backdrop = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
};

const panel: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit:   { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.18 } },
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ScheduleModal = ({ isOpen, onClose, route }: Props) => {
  const quickDates = getQuickDates();

  const [selectedDate,  setSelectedDate]  = useState<string>(route?.scheduleDate || toDateString(quickDates[0]));
  const [selectedHour,  setSelectedHour]  = useState<number>(route?.scheduleTime ? parseInt(route.scheduleTime.split(':')[0]) : 9);
  const [selectedMin,   setSelectedMin]   = useState<number>(route?.scheduleTime ? parseInt(route.scheduleTime.split(':')[1]) : 0);
  const [calPage,       setCalPage]       = useState<number>(0); // 0=first7, 1=next7
  const [done,          setDone]          = useState<boolean>(false);
  const [savedEntry,    setSavedEntry]    = useState<ScheduledRoute | null>(null);

  // Update internals if route props change (from PlannerScreen inputs)
  useEffect(() => {
    if (route?.scheduleDate) setSelectedDate(route.scheduleDate);
    if (route?.scheduleTime) {
      setSelectedHour(parseInt(route.scheduleTime.split(':')[0]));
      setSelectedMin(parseInt(route.scheduleTime.split(':')[1]));
    }
  }, [route?.scheduleDate, route?.scheduleTime]);

  // All 14 days for calendar page toggle
  const allDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  const visibleDates = allDates.slice(calPage * 7, calPage * 7 + 7);

  const handleConfirm = useCallback(() => {
    if (!route) return;

    const entry: ScheduledRoute = {
      id:          `sched_${Date.now()}`,
      from:        route.from,
      to:          route.to,
      date:        selectedDate,
      time:        `${pad(selectedHour)}:${pad(selectedMin)}`,
      routeType:   route.routeType ?? 'fastest',
      badge:       route.badge,
      duration:    route.totalTime,
      cost:        route.cost,
      modeLabel:   buildModeLabel(route.segments),
      confidence:  route.confidence,
      scheduledAt: new Date().toISOString(),
    };

    saveScheduledRoute(entry);
    setSavedEntry(entry);
    setDone(true);
  }, [route, selectedDate, selectedHour, selectedMin]);

  const handleClose = useCallback(() => {
    setDone(false);
    setSavedEntry(null);
    onClose();
  }, [onClose]);

  if (!route) return null;

  const badgeStyle = BADGE_STYLES[route.badgeColor] ?? BADGE_STYLES.muted;
  const BadgeIcon  = badgeStyle.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[700]"
          />

          {/* ── Modal panel ── */}
          <motion.div
            key="panel"
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-[800] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] shadow-2xl w-full max-w-[480px] overflow-hidden pointer-events-auto"
            >
              {/* ══ SUCCESS STATE ══ */}
              <AnimatePresence mode="wait">
                {done && savedEntry ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 flex flex-col items-center text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-5"
                    >
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </motion.div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">Route Scheduled!</h2>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Your route has been saved and will appear in Journey History.
                    </p>

                    {/* Confirmation card */}
                    <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`${badgeStyle.bg} ${badgeStyle.text} px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1`}>
                          <BadgeIcon size={10} strokeWidth={3} />
                          {savedEntry.badge}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm mb-1">
                        {savedEntry.from}
                        <span className="text-gray-400 font-normal mx-1.5">→</span>
                        {savedEntry.to}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                          <Calendar size={12} className="text-[#1b3a2a]" />
                          {toDisplayDate(savedEntry.date)}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                          <Clock size={12} className="text-[#1b3a2a]" />
                          {savedEntry.time}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className="w-full py-3 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm hover:bg-[#234d38] transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>

                ) : (
                  /* ══ SCHEDULE FORM ══ */
                  <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-[#1b3a2a]/8 flex items-center justify-center">
                          <Calendar size={17} className="text-[#1b3a2a]" />
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 text-base leading-tight">Schedule Route</h2>
                          <p className="text-[11px] text-gray-400">Pick a date and time for this route</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <X size={14} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="px-6 py-5 space-y-5">

                      {/* ── Route Summary ── */}
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`${badgeStyle.bg} ${badgeStyle.text} px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5`}>
                            <BadgeIcon size={10} strokeWidth={3} />
                            {route.badge}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500">
                            {route.totalTime} min · ₹{route.cost}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                              <MapPin size={11} className="text-blue-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 truncate">{route.from}</span>
                          </div>
                          <span className="text-gray-300 font-light text-lg flex-shrink-0">→</span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                              <Flag size={11} className="text-red-400" />
                            </div>
                            <span className="text-sm font-bold text-gray-900 truncate">{route.to}</span>
                          </div>
                        </div>

                        {/* Mode segment icons */}
                        {route.segments && route.segments.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                            {route.segments.map((seg, i) => {
                              const Icon = MODE_ICONS[seg.mode] ?? Footprints;
                              return (
                                <span key={i} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                                  <Icon size={10} className="text-gray-500" />
                                  <span className="text-[10px] font-semibold text-gray-600">{seg.label.split('·')[0].trim()}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* ── Date Picker ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Date</p>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={calPage === 0}
                              onClick={() => setCalPage(0)}
                              className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition-colors"
                            >
                              <ChevronLeft size={12} className="text-gray-500" />
                            </button>
                            <span className="text-[10px] font-semibold text-gray-400 px-1">
                              {calPage === 0 ? 'Days 1–7' : 'Days 8–14'}
                            </span>
                            <button
                              disabled={calPage === 1}
                              onClick={() => setCalPage(1)}
                              className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition-colors"
                            >
                              <ChevronRight size={12} className="text-gray-500" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                          {visibleDates.map((date) => {
                            const ds      = toDateString(date);
                            const active  = ds === selectedDate;
                            const label   = formatDateLabel(date);
                            const isToday = label === 'Today';
                            return (
                              <button
                                key={ds}
                                onClick={() => setSelectedDate(ds)}
                                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all border ${
                                  active
                                    ? 'bg-[#1b3a2a] border-[#1b3a2a] text-white shadow-sm'
                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                                  {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                </span>
                                <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                                {isToday && (
                                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${active ? 'bg-white/20 text-white' : 'bg-[#1b3a2a]/10 text-[#1b3a2a]'}`}>
                                    Today
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected date display */}
                        <div className="mt-3 flex items-center gap-2 bg-[#1b3a2a]/5 rounded-xl px-3 py-2 border border-[#1b3a2a]/10">
                          <Calendar size={13} className="text-[#1b3a2a]" />
                          <span className="text-xs font-semibold text-[#1b3a2a]">
                            {toDisplayDate(selectedDate)}
                          </span>
                        </div>
                      </div>

                      {/* ── Time Picker ── */}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          Select Time
                        </p>

                        <div className="flex items-center gap-3">
                          {/* Hour */}
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold text-gray-400 mb-1.5 text-center">Hour</p>
                            <div className="relative">
                              <select
                                value={selectedHour}
                                onChange={(e) => setSelectedHour(Number(e.target.value))}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#1b3a2a]/20 focus:border-[#1b3a2a]/30 transition-all cursor-pointer"
                              >
                                {HOURS.map((h) => (
                                  <option key={h} value={h}>
                                    {pad(h)} {h < 12 ? 'AM' : 'PM'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <span className="text-2xl font-bold text-gray-300 mt-4">:</span>

                          {/* Minute */}
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold text-gray-400 mb-1.5 text-center">Minute</p>
                            <div className="relative">
                              <select
                                value={selectedMin}
                                onChange={(e) => setSelectedMin(Number(e.target.value))}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-base font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#1b3a2a]/20 focus:border-[#1b3a2a]/30 transition-all cursor-pointer"
                              >
                                {MINUTES.map((m) => (
                                  <option key={m} value={m}>{pad(m)}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* AM/PM display */}
                          <div className="flex flex-col gap-1.5 mt-4">
                            {['AM', 'PM'].map((period) => {
                              const isActive = period === 'AM' ? selectedHour < 12 : selectedHour >= 12;
                              return (
                                <button
                                  key={period}
                                  onClick={() => {
                                    if (period === 'AM' && selectedHour >= 12) setSelectedHour(h => h - 12);
                                    if (period === 'PM' && selectedHour < 12)  setSelectedHour(h => h + 12);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                    isActive
                                      ? 'bg-[#1b3a2a] text-white border-[#1b3a2a]'
                                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {period}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time preview */}
                        <div className="mt-3 flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                          <Clock size={14} className="text-[#1b3a2a]" />
                          <span className="text-sm font-bold text-gray-900">
                            Departing at{' '}
                            <span className="text-[#1b3a2a]">
                              {pad(selectedHour)}:{pad(selectedMin)}{' '}
                              {selectedHour < 12 ? 'AM' : 'PM'}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* ── Confirm Button ── */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirm}
                        className="w-full py-3.5 bg-[#1b3a2a] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#234d38] transition-all"
                      >
                        <Calendar size={17} />
                        Confirm Schedule
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScheduleModal;