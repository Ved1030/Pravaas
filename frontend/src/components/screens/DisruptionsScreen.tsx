import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  AlertTriangle, Clock, TrendingUp, ChevronDown, ChevronRight,
  Shield, Bus, Footprints, Car, Train, Sparkles, XCircle,
  Radio, CloudRain, Zap as ZapIcon, Construction, Users,
  Trash2, Shuffle, Play, CheckCircle2, TriangleAlert, Loader2,
  MapPin, Navigation,
} from 'lucide-react';
import SegmentBar from '@/components/SegmentBar';
import MapComponent, { type MapRoute, normalizeCoordinates } from '@/components/MapComponent';
import { simulateDisruption, handleDisruption, type DisruptionResponse } from '@/lib/api';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const severityReasons = [
  { id: 'delay', label: 'Delay', icon: Clock },
  { id: 'crowd', label: 'Crowd', icon: Users },
  { id: 'closure', label: 'Closure', icon: Construction },
  { id: 'signal', label: 'Signal Failure', icon: Radio },
  { id: 'weather', label: 'Weather', icon: CloudRain },
  { id: 'power', label: 'Power Cut', icon: ZapIcon },
];

const modeIcons: Record<string, any> = {
  metro: Train,
  train: Train,
  bus: Bus,
  cab: Car,
  auto: Car,
  walk: Footprints,
  bike: Navigation,
};

const modeLabels: Record<string, string> = {
  metro: 'Metro',
  train: 'Train',
  bus: 'Bus',
  cab: 'Cab',
  auto: 'Auto',
  walk: 'Walk',
  bike: 'Bike',
};

const DisruptionsScreen = () => {
  const [showAlts, setShowAlts] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('Metro Line 1');
  const [delayMin, setDelayMin] = useState(15);
  const [severity, setSeverity] = useState<'minor' | 'major' | 'shutdown'>('major');
  const [activeReasons, setActiveReasons] = useState<string[]>(['signal']);
  const [logs, setLogs] = useState([
    { time: '09:14:22', type: 'trigger', text: 'Metro L1 +18 min — Signal Failure' },
    { time: '09:14:22', type: 'reroute', text: 'Reroute: Bus #340 suggested (+9 min)' },
  ]);
  const [apiLoading, setApiLoading] = useState(false);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [issueType, setIssueType] = useState('delay');

  const [disruptionData, setDisruptionData] = useState<DisruptionResponse | null>(null);
  const [selectedSwitchOption, setSelectedSwitchOption] = useState<string | null>(null);
  const [disruptionLoading, setDisruptionLoading] = useState(false);

  const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([]);
  const [selectedMapRouteId, setSelectedMapRouteId] = useState<string | undefined>();

  const triggerDisruption = async () => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    const reasonLabels = activeReasons
      .map((id) => severityReasons.find((r) => r.id === id)?.label)
      .filter(Boolean)
      .join(', ');
    setLogs((prev) => [
      { time: now, type: 'trigger', text: `${selectedRoute} +${delayMin} min — ${reasonLabels}` },
      ...prev,
    ]);
    setApiLoading(true);
    try {
      const data = await simulateDisruption(delayMin);
      setLogs((prev) => [
        { time: now, type: 'reroute', text: data.alert + ` (${data.routes.length} routes updated)` },
        ...prev,
      ]);
    } catch {
      setLogs((prev) => [
        { time: now, type: 'reroute', text: 'Backend unavailable — reroute simulated locally' },
        ...prev,
      ]);
    } finally {
      setApiLoading(false);
    }
  };

  const clearAll = () => {
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [{ time: now, type: 'clear', text: 'All disruptions cleared' }, ...prev]);
    setDisruptionData(null);
    setSelectedSwitchOption(null);
    setMapRoutes([]);
    setSelectedMapRouteId(undefined);
  };

  const randomize = () => {
    const routes = ['Metro Line 1', 'Metro Line 2', 'Bus #308', 'Bus #340', 'Bus #209'];
    const reasons = severityReasons.map((r) => r.id);
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const randomDelay = Math.floor(Math.random() * 25) + 5;
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    setSelectedRoute(randomRoute);
    setDelayMin(randomDelay);
    setActiveReasons([randomReason]);
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    const label = severityReasons.find((r) => r.id === randomReason)?.label || '';
    setLogs((prev) => [
      { time: now, type: 'trigger', text: `${randomRoute} +${randomDelay} min — ${label}` },
      { time: now, type: 'reroute', text: 'Reroute calculated' },
      ...prev,
    ]);
  };

  const handleSmartRecovery = async () => {
    if (!source || !destination) return;

    setDisruptionLoading(true);
    setDisruptionData(null);
    setSelectedSwitchOption(null);
    setMapRoutes([]);

    try {
      const data = await handleDisruption({
        source,
        destination,
        currentLocation: currentLocation || undefined,
        issueType,
      });

      setDisruptionData(data);

      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs((prev) => [
        { time: now, type: 'trigger', text: `Disruption: ${source} → ${destination} (+${data.summary.totalDelay} min)` },
        { time: now, type: 'reroute', text: `${data.switchOptions.length} switch options, ${data.lastMile.length} last-mile options found` },
        ...prev,
      ]);

      if (data.disruptedRoute.geometry && Array.isArray(data.disruptedRoute.geometry) && data.disruptedRoute.geometry.length > 0) {
        const disruptedRoute: MapRoute = {
          id: 'disrupted',
          type: 'fastest',
          color: '#ef4444',
          positions: normalizeCoordinates(data.disruptedRoute.geometry),
        };
        setMapRoutes([disruptedRoute]);
        setSelectedMapRouteId('disrupted');
      }
    } catch (err) {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs((prev) => [
        { time: now, type: 'trigger', text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        ...prev,
      ]);
    } finally {
      setDisruptionLoading(false);
    }
  };

  const selectSwitchOption = (mode: string) => {
    setSelectedSwitchOption(mode);
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="w-full max-w-[1200px] mx-auto pb-10"
    >
      {/* ─── Header ─── */}
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
          Disruptions & Reroute
        </h1>
        <p className="text-gray-500 font-medium">
          Smart Transport Recovery System — adaptive routing
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        {/* ═══════════════════════════════════════════
            LEFT COLUMN — Alerts & Reroute
           ═══════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── User Input Section ── */}
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7 space-y-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900">Report Disruption</h3>
              <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                SMART
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Enter your journey details to get real-time disruption recovery options
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Source
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Andheri"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Destination
                </label>
                <div className="relative">
                  <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. BKC"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="Optional — where you are now"
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all appearance-none cursor-pointer"
                >
                  <option value="delay">Delay</option>
                  <option value="crowd">Crowd</option>
                  <option value="closure">Closure</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSmartRecovery}
              disabled={disruptionLoading || !source || !destination}
              className="w-full py-4 bg-[#1b3a2a] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              {disruptionLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing Route…</>
              ) : (
                <><Shield size={16} strokeWidth={2.5} /> Find Recovery Options</>
              )}
            </motion.button>
          </motion.div>

          {/* ── Delay Summary ── */}
          <AnimatePresence>
            {disruptionData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                variants={fadeUp}
                className="relative bg-red-50 rounded-[28px] p-7 border border-red-200 overflow-hidden"
              >
                <div className="absolute top-6 right-6">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={22} strokeWidth={2.5} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700">Route Disrupted</h3>
                    <p className="text-sm font-medium text-red-600/80">
                      {disruptionData.source} → {disruptionData.destination}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/60 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-600 tabular-nums">
                      +{disruptionData.summary.totalDelay}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                      Total Delay
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {disruptionData.summary.originalTime}m
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                      Original Time
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">
                      {disruptionData.summary.newTime}m
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                      New Time
                    </p>
                  </div>
                </div>

                {/* Affected Steps */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Affected Steps
                  </p>
                  {disruptionData.disruptedSteps
                    .filter((s) => s.delayMinutes > 0)
                    .map((step, i) => {
                      const Icon = modeIcons[step.mode] || AlertTriangle;
                      const severityColor =
                        step.impactLevel === 'high'
                          ? 'text-red-600 bg-red-100'
                          : step.impactLevel === 'medium'
                          ? 'text-amber-600 bg-amber-100'
                          : 'text-blue-600 bg-blue-100';

                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 bg-white/60 rounded-2xl p-3"
                        >
                          <Icon size={16} className="text-gray-600" />
                          <span className="flex-1 text-sm font-semibold text-gray-900">
                            {step.label}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${severityColor}`}>
                            {step.impactLevel}
                          </span>
                          <span className="text-sm font-bold text-red-600 tabular-nums">
                            +{step.delayMinutes}m
                          </span>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Map Integration ── */}
          <AnimatePresence>
            {mapRoutes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-[28px] overflow-hidden border border-gray-100 shadow-sm"
              >
                <MapComponent
                  routes={mapRoutes}
                  selectedRouteId={selectedMapRouteId}
                  sourceLabel={disruptionData?.source}
                  destinationLabel={disruptionData?.destination}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Current Switching UI ── */}
          <AnimatePresence>
            {disruptionData && disruptionData.switchOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[28px] shadow-md border-2 border-blue-200 overflow-hidden relative"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

                <div className="p-7 relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="bg-[#1b3a2a] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <Sparkles size={12} strokeWidth={3} />
                      Better Options Available
                    </div>
                  </div>

                  <div className="space-y-3">
                    {disruptionData.switchOptions.map((option, i) => {
                      const Icon = modeIcons[option.mode] || AlertTriangle;
                      const isSelected = selectedSwitchOption === option.mode;

                      return (
                        <motion.div
                          key={option.mode}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => selectSwitchOption(option.mode)}
                          className={`rounded-[24px] p-5 border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 shadow-md'
                              : 'bg-gray-50 border-gray-100 hover:shadow-sm hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'bg-blue-100 border border-blue-200'
                                : 'bg-white border border-gray-200'
                            }`}>
                              <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-600'} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-900">
                                {modeLabels[option.mode] || option.mode}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{option.reason}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-gray-900 tabular-nums">
                                ~{option.estimatedTimeMin}m
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedSwitchOption && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-5 py-4 bg-[#1b3a2a] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                      >
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                        Switch to {modeLabels[selectedSwitchOption] || selectedSwitchOption}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Last Mile UI ── */}
          <AnimatePresence>
            {disruptionData && disruptionData.lastMile.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-7 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation size={16} className="text-emerald-600" />
                    <h3 className="font-bold text-lg text-gray-900">Complete Your Journey</h3>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    Last mile options to reach your destination
                  </p>
                </div>

                <div className="px-7 pb-7 space-y-3">
                  {disruptionData.lastMile.map((option, i) => {
                    const Icon = modeIcons[option.mode] || AlertTriangle;

                    return (
                      <motion.div
                        key={option.mode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gray-50 rounded-[24px] p-5 border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-gray-600" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900">
                            {modeLabels[option.mode] || option.mode}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                              <Clock size={11} /> ~{option.time} min
                            </span>
                            {option.cost > 0 && (
                              <span className="text-xs font-bold text-gray-900">₹{option.cost}</span>
                            )}
                            {option.cost === 0 && (
                              <span className="text-xs font-bold text-emerald-600">Free</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Alternative Routes ── */}
          <motion.div variants={fadeUp}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAlts(!showAlts)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Other Options
              <motion.div
                animate={{ rotate: showAlts ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown size={16} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showAlts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                        <Car size={18} className="text-emerald-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900">Auto Rickshaw Direct</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <Clock size={11} /> 25 min
                          </span>
                          <span className="text-xs font-bold text-gray-900">₹80</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                      >
                        Select
                      </motion.button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center gap-4 group cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Bus size={18} className="text-amber-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900">Walk + Bus #209</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <Clock size={11} /> 38 min
                          </span>
                          <span className="text-xs font-bold text-gray-900">₹12</span>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                      >
                        Select
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════
            RIGHT COLUMN — Simulator Panel
           ═══════════════════════════════════════════ */}
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-7 space-y-5">
            {/* Simulator Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900">Disruption Simulator</h3>
                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  DEMO
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Inject disruptions and watch the app adapt in real time
              </p>
            </div>

            {/* Route Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all appearance-none cursor-pointer"
              >
                {['Metro Line 1', 'Metro Line 2', 'Bus #308', 'Bus #340', 'Bus #209', 'All Routes'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Delay Input */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Delay (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={delayMin}
                onChange={(e) => setDelayMin(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all tabular-nums"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Severity
              </label>
              <div className="flex gap-2">
                {([
                  { key: 'minor' as const, label: 'Minor', color: 'amber' },
                  { key: 'major' as const, label: 'Major', color: 'red' },
                  { key: 'shutdown' as const, label: 'Shutdown', color: 'red' },
                ]).map(({ key, label, color }) => {
                  const active = severity === key;
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSeverity(key)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${active
                        ? key === 'minor'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : key === 'major'
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-red-600 text-white border border-red-600'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Reason Chips */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Reason
              </label>
              <div className="grid grid-cols-3 gap-2">
                {severityReasons.map(({ id, label, icon: Icon }) => {
                  const active = activeReasons.includes(id);
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() =>
                        setActiveReasons((prev) =>
                          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                        )
                      }
                      className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border ${active
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      <Icon size={16} strokeWidth={2.5} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={triggerDisruption}
                disabled={apiLoading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {apiLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Simulating…</>
                ) : (
                  <><Play size={16} strokeWidth={2.5} /> Trigger Disruption</>
                )}
              </motion.button>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAll}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={13} strokeWidth={2.5} />
                  Clear All
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={randomize}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Shuffle size={13} strokeWidth={2.5} />
                  Randomize
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── Event Log ── */}
          <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Event Log</h3>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 max-h-[300px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="p-4 text-xs text-gray-400 italic text-center">
                    No active disruptions. Use controls above to simulate.
                  </p>
                ) : (
                  <div className="p-4 space-y-2">
                    {logs.map((log, i) => (
                      <motion.div
                        key={`${log.time}-${i}`}
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.02 }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${log.type === 'trigger'
                            ? 'bg-red-100'
                            : log.type === 'reroute'
                              ? 'bg-blue-100'
                              : 'bg-emerald-100'
                            }`}
                        >
                          {log.type === 'trigger' ? (
                            <TriangleAlert size={12} className="text-red-600" strokeWidth={2.5} />
                          ) : log.type === 'reroute' ? (
                            <TrendingUp size={12} className="text-blue-600" strokeWidth={2.5} />
                          ) : (
                            <CheckCircle2 size={12} className="text-emerald-600" strokeWidth={2.5} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                            {log.text}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium tabular-nums mt-0.5">
                            {log.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DisruptionsScreen;
