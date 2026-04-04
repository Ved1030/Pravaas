// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Star, Plus, Train, Bus, Bell, MapPin, Shield, Clock, Pencil, Globe,
//   ChevronRight, Flame, Leaf, Zap, Award, Heart, Users, TrendingDown,
//   BarChart3, Wallet, Route, X, ArrowRight, Footprints, Bike,
// } from 'lucide-react';
// import { useAuth } from '@/lib/auth-context';

// const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
// const fadeUp = {
//   hidden: { opacity: 0, y: 15 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
// };

// function useCounter(target: number, duration = 1.5) {
//   const [val, setVal] = useState(0);
//   useEffect(() => {
//     const start = performance.now();
//     const tick = (now: number) => {
//       const p = Math.min((now - start) / (duration * 1000), 1);
//       const ease = 1 - Math.pow(1 - p, 3);
//       setVal(Math.round(ease * target));
//       if (p < 1) requestAnimationFrame(tick);
//     };
//     const id = setTimeout(() => requestAnimationFrame(tick), 400);
//     return () => clearTimeout(id);
//   }, [target, duration]);
//   return val;
// }

// const prefConfig = [
//   { key: 'crowds', label: 'Avoid Peak Crowds', icon: Users, default: true },
//   { key: 'metro', label: 'Prefer Metro', icon: Train, default: true },
//   { key: 'alerts', label: 'Disruption Alerts', icon: Bell, default: true },
//   { key: 'location', label: 'Share Live Location', icon: MapPin, default: false },
// ];

// type TransportMode = 'metro' | 'bus' | 'walk' | 'bike';
// type TimeOfDay = 'morning' | 'afternoon' | 'evening';

// interface SavedRoute {
//   from: string;
//   to: string;
//   detail: string;
//   mode: TransportMode;
//   icon: React.ElementType;
//   color: string;
// }

// const modeConfig: Record<TransportMode, { icon: React.ElementType; color: string; label: string }> = {
//   metro: { icon: Train, color: 'blue', label: 'Metro' },
//   bus: { icon: Bus, color: 'amber', label: 'Bus' },
//   walk: { icon: Footprints, color: 'emerald', label: 'Walk' },
//   bike: { icon: Bike, color: 'purple', label: 'Bike' },
// };

// const timeConfig: Record<TimeOfDay, { label: string; colorKey: string }> = {
//   morning: { label: 'Morning Transit', colorKey: 'blue' },
//   afternoon: { label: 'Afternoon Transit', colorKey: 'amber' },
//   evening: { label: 'Evening Route', colorKey: 'purple' },
// };

// // When mode is walk or bike, force a specific color; otherwise use time color
// const resolveColor = (mode: TransportMode, time: TimeOfDay): string => {
//   if (mode === 'walk') return 'emerald';
//   if (mode === 'bike') return 'purple';
//   return timeConfig[time].colorKey;
// };

// const modeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
//   blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
//   amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
//   emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
//   gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' },
//   purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' },
// };

// const initialRoutes: SavedRoute[] = [
//   { from: 'Home', to: 'DJSCE', detail: 'Morning Commute', mode: 'metro', icon: Train, color: 'blue' },
//   { from: 'Andheri', to: 'Bandra', detail: 'Evening Route', mode: 'bus', icon: Bus, color: 'amber' },
// ];

// /* ─── Add Route Modal ─── */
// interface AddRouteModalProps {
//   onClose: () => void;
//   onAdd: (route: SavedRoute) => void;
// }

// const backdropVariants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1 },
// };
// const modalVariants = {
//   hidden: { opacity: 0, scale: 0.94, y: 20 },
//   show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
//   exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.18 } },
// };

// function AddRouteModal({ onClose, onAdd }: AddRouteModalProps) {
//   const [from, setFrom] = useState('');
//   const [to, setTo] = useState('');
//   const [mode, setMode] = useState<TransportMode>('metro');
//   const [time, setTime] = useState<TimeOfDay>('morning');
//   const [error, setError] = useState('');

//   const handleAdd = () => {
//     if (!from.trim() || !to.trim()) {
//       setError('Please enter both source and destination.');
//       return;
//     }
//     const color = resolveColor(mode, time);
//     const detail = timeConfig[time].label;
//     const icon = modeConfig[mode].icon;
//     onAdd({ from: from.trim(), to: to.trim(), detail, mode, icon, color });
//     onClose();
//   };

//   const inputCls =
//     'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#1b3a2a] focus:bg-white transition-all';

//   return (
//     <motion.div
//       variants={backdropVariants}
//       initial="hidden"
//       animate="show"
//       exit="hidden"
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
//       onClick={onClose}
//     >
//       <motion.div
//         variants={modalVariants}
//         initial="hidden"
//         animate="show"
//         exit="exit"
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white rounded-[28px] p-7 w-full max-w-md shadow-2xl border border-gray-100"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
//               <Route size={16} className="text-[#c5f02c]" />
//             </div>
//             <h2 className="font-bold text-lg text-gray-900">Add Saved Route</h2>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.08 }}
//             whileTap={{ scale: 0.92 }}
//             onClick={onClose}
//             className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
//           >
//             <X size={16} className="text-gray-500" />
//           </motion.button>
//         </div>

//         {/* Source → Destination */}
//         <div className="flex items-center gap-3 mb-4">
//           <div className="flex-1">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">From</label>
//             <input
//               value={from}
//               onChange={(e) => { setFrom(e.target.value); setError(''); }}
//               placeholder="e.g. Andheri"
//               className={inputCls}
//             />
//           </div>
//           <div className="mt-5 flex-shrink-0">
//             <ArrowRight size={18} className="text-gray-300" />
//           </div>
//           <div className="flex-1">
//             <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">To</label>
//             <input
//               value={to}
//               onChange={(e) => { setTo(e.target.value); setError(''); }}
//               placeholder="e.g. Bandra"
//               className={inputCls}
//             />
//           </div>
//         </div>

//         {error && (
//           <p className="text-xs font-semibold text-red-500 mb-3 px-1">{error}</p>
//         )}

//         {/* Mode of Transport */}
//         <div className="mb-4">
//           <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Mode of Transport</label>
//           <div className="grid grid-cols-4 gap-2">
//             {(Object.keys(modeConfig) as TransportMode[]).map((m) => {
//               const cfg = modeConfig[m];
//               const Icon = cfg.icon;
//               const active = mode === m;
//               const c = modeColors[cfg.color];
//               return (
//                 <motion.button
//                   key={m}
//                   whileTap={{ scale: 0.94 }}
//                   onClick={() => setMode(m)}
//                   className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-bold transition-all ${active
//                     ? `${c.bg} ${c.border} ${c.text}`
//                     : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
//                     }`}
//                 >
//                   <Icon size={18} strokeWidth={2.5} />
//                   {cfg.label}
//                 </motion.button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Time of Day */}
//         <div className="mb-6">
//           <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Time of Day</label>
//           <div className="grid grid-cols-3 gap-2">
//             {(Object.keys(timeConfig) as TimeOfDay[]).map((t) => {
//               const active = time === t;
//               const emojis: Record<TimeOfDay, string> = { morning: '🌅', afternoon: '☀️', evening: '🌆' };
//               return (
//                 <motion.button
//                   key={t}
//                   whileTap={{ scale: 0.94 }}
//                   onClick={() => setTime(t)}
//                   className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 text-xs font-bold capitalize transition-all ${active
//                     ? 'bg-[#1b3a2a] border-[#1b3a2a] text-white'
//                     : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
//                     }`}
//                 >
//                   <span className="text-base">{emojis[t]}</span>
//                   {t}
//                 </motion.button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Preview */}
//         {from.trim() && to.trim() && (() => {
//           const color = resolveColor(mode, time);
//           const c = modeColors[color];
//           const Icon = modeConfig[mode].icon;
//           return (
//             <div className={`mb-5 p-4 rounded-2xl ${c.bg} border ${c.border} flex items-center gap-3 relative overflow-hidden`}>
//               <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.dot} rounded-r-full`} />
//               <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ml-2 flex-shrink-0`}>
//                 <Icon size={16} className={c.text} strokeWidth={2.5} />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="font-bold text-sm text-gray-900">
//                   {from.trim()}
//                   <span className="text-gray-400 font-normal mx-1.5">→</span>
//                   {to.trim()}
//                 </p>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
//                     <Icon size={9} strokeWidth={3} />
//                     {modeConfig[mode].label}
//                   </span>
//                   <span className="text-xs font-medium text-gray-500">{timeConfig[time].label}</span>
//                 </div>
//               </div>
//               <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
//             </div>
//           );
//         })()}

//         {/* Action buttons */}
//         <div className="flex gap-3">
//           <motion.button
//             whileTap={{ scale: 0.96 }}
//             onClick={onClose}
//             className="flex-1 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
//           >
//             Cancel
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.96 }}
//             onClick={handleAdd}
//             className="flex-1 py-3 rounded-2xl bg-[#1b3a2a] text-sm font-bold text-white hover:bg-[#254d39] transition-colors shadow-sm"
//           >
//             Save Route
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* ─── Main Component ─── */
// const ProfileScreen = () => {
//   const { user } = useAuth();

//   const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(initialRoutes);
//   const [showModal, setShowModal] = useState(false);

//   const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
//     const prefs = Object.fromEntries(prefConfig.map((p) => [p.key, p.default]));
//     if (user?.transportPrefs) prefs.metro = user.transportPrefs.includes('metro');
//     return prefs;
//   });
//   const [lang, setLang] = useState('english');

//   const trips = useCounter(87, 1.8);
//   const saved = useCounter(2340, 1.8);
//   const hours = useCounter(42, 1.8);
//   const routesAnalyzed = useCounter(214, 1.8);
//   const avgOptimization = useCounter(23, 1.8);

//   const handleAddRoute = (route: SavedRoute) => {
//     setSavedRoutes((prev) => [...prev, route]);
//   };

//   return (
//     <>
//       <AnimatePresence>
//         {showModal && (
//           <AddRouteModal onClose={() => setShowModal(false)} onAdd={handleAddRoute} />
//         )}
//       </AnimatePresence>

//       <motion.div
//         variants={stagger}
//         initial="hidden"
//         animate="show"
//         className="w-full max-w-[1200px] mx-auto pb-10"
//       >
//         {/* ─── Header ─── */}
//         <motion.div variants={fadeUp} className="mb-10">
//           <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Profile</h1>
//           <p className="text-gray-500 font-medium">Manage your account and preferences</p>
//         </motion.div>

//         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
//           {/* ═══ LEFT COLUMN ═══ */}
//           <div className="xl:col-span-2 space-y-6">

//             {/* ── Profile Hero Card ── */}
//             <motion.div
//               variants={fadeUp}
//               className="bg-[#1b3a2a] rounded-[28px] p-8 text-white relative overflow-hidden"
//             >
//               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
//               <div className="relative z-10 flex items-center gap-5">
//                 <div className="w-[72px] h-[72px] rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
//                   <span className="text-[28px] font-bold text-white tracking-tight">
//                     {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'RA'}
//                   </span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Rohan Acharya'}</h2>
//                   <p className="text-sm text-white/60 font-medium mt-0.5">{user?.city || 'Mumbai, Maharashtra'}</p>
//                   <div className="flex items-center gap-2 mt-2">
//                     <span className="bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white/70 tracking-wider uppercase">
//                       Member since {user?.joinDate || 'Jan 2026'}
//                     </span>
//                     <span className="bg-[#c5f02c]/20 border border-[#c5f02c]/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-[#c5f02c] tracking-wider uppercase">
//                       Premium
//                     </span>
//                   </div>
//                 </div>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
//                 >
//                   <Pencil size={16} className="text-white/70" />
//                 </motion.button>
//               </div>
//             </motion.div>

//             {/* ── 4-Stat Row ── */}
//             <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[
//                 { value: trips, label: 'Total Trips', sub: 'this year', icon: Award, iconBg: 'bg-gray-100', iconColor: 'text-gray-500', color: 'text-gray-900' },
//                 { value: `₹${saved.toLocaleString()}`, label: 'Money Saved', sub: 'vs auto/cab', icon: Wallet, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', color: 'text-emerald-600' },
//                 { value: `${hours} hrs`, label: 'Time Saved', sub: 'vs avg commute', icon: Clock, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', color: 'text-blue-600' },
//                 { value: routesAnalyzed, label: 'Routes Analyzed', sub: 'by AI engine', icon: Route, iconBg: 'bg-purple-50', iconColor: 'text-purple-500', color: 'text-purple-600' },
//               ].map((stat, i) => (
//                 <div key={i} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
//                   <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
//                     <stat.icon size={18} className={stat.iconColor} strokeWidth={2.5} />
//                   </div>
//                   <p className={`text-2xl font-bold ${stat.color} tabular-nums tracking-tight`}>{stat.value}</p>
//                   <p className="text-xs font-semibold text-gray-700 mt-0.5">{stat.label}</p>
//                   <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
//                 </div>
//               ))}
//             </motion.div>

//             {/* ── AI Optimization Stats ── */}
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
//               <div className="flex items-center gap-2 mb-5">
//                 <div className="w-8 h-8 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
//                   <BarChart3 size={15} className="text-[#c5f02c]" />
//                 </div>
//                 <h3 className="font-bold text-base text-gray-900">AI Optimization Stats</h3>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div className="bg-gradient-to-br from-[#e8f5ee] to-[#f0faf4] rounded-2xl p-4 border border-emerald-100">
//                   <div className="flex items-center gap-2 mb-3">
//                     <TrendingDown size={14} className="text-emerald-600" />
//                     <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Avg Improvement</span>
//                   </div>
//                   <p className="text-3xl font-bold text-emerald-700 tabular-nums">{avgOptimization}%</p>
//                   <p className="text-xs text-emerald-600/70 mt-1 font-medium">faster than self-planned routes</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl p-4 border border-blue-100">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Clock size={14} className="text-blue-600" />
//                     <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Time Efficiency</span>
//                   </div>
//                   <p className="text-3xl font-bold text-blue-700 tabular-nums">26 min</p>
//                   <p className="text-xs text-blue-600/70 mt-1 font-medium">avg commute · 4 min &lt; city avg</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl p-4 border border-purple-100">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Shield size={14} className="text-purple-600" />
//                     <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI Picks Used</span>
//                   </div>
//                   <p className="text-3xl font-bold text-purple-700 tabular-nums">78%</p>
//                   <p className="text-xs text-purple-600/70 mt-1 font-medium">of AI recommendations accepted</p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* ── Saved Routes ── */}
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="font-bold text-lg text-gray-900">Saved Routes</h3>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setShowModal(true)}
//                   className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
//                 >
//                   <Plus size={16} className="text-gray-500" strokeWidth={2.5} />
//                 </motion.button>
//               </div>

//               <div className="space-y-3">
//                 <AnimatePresence initial={false}>
//                   {savedRoutes.map((route, i) => {
//                     const c = modeColors[route.color] ?? modeColors.gray;
//                     const Icon = route.icon;
//                     return (
//                       <motion.div
//                         key={`${route.from}-${route.to}-${i}`}
//                         initial={{ opacity: 0, y: 10, scale: 0.98 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: -6, scale: 0.97 }}
//                         transition={{ duration: 0.28, ease: 'easeOut' }}
//                         whileHover={{ scale: 1.01 }}
//                         whileTap={{ scale: 0.99 }}
//                         className={`relative p-4 rounded-2xl ${c.bg} border ${c.border} cursor-pointer group overflow-hidden transition-shadow hover:shadow-md`}
//                       >
//                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.dot} rounded-r-full`} />
//                         <div className="flex items-center gap-3 ml-2">
//                           <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
//                             <Icon size={18} className={c.text} strokeWidth={2.5} />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="font-bold text-sm text-gray-900">
//                               {route.from}
//                               <span className="text-gray-400 font-normal mx-1.5">→</span>
//                               {route.to}
//                             </p>
//                             <div className="flex items-center gap-2 mt-1">
//                               <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
//                                 <Icon size={9} strokeWidth={3} />
//                                 {modeConfig[route.mode]?.label ?? route.mode}
//                               </span>
//                               <span className="text-xs font-medium text-gray-500">{route.detail}</span>
//                             </div>
//                           </div>
//                           <Star size={16} className="text-amber-400 fill-amber-400 flex-shrink-0" strokeWidth={2.5} />
//                           <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           </div>

//           {/* ═══ RIGHT COLUMN ═══ */}
//           <div className="space-y-6">

//             {/* ── Preferences ── */}
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <h3 className="font-bold text-lg text-gray-900 mb-6">Preferences</h3>
//               <div className="space-y-2">
//                 {prefConfig.map((pref) => {
//                   const active = toggles[pref.key];
//                   const Icon = pref.icon;
//                   return (
//                     <div key={pref.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-blue-50' : 'bg-gray-100'} transition-colors`}>
//                           <Icon size={16} strokeWidth={2.5} className={active ? 'text-blue-600' : 'text-gray-400'} />
//                         </div>
//                         <span className="text-sm font-semibold text-gray-700">{pref.label}</span>
//                       </div>
//                       <motion.button
//                         onClick={() => setToggles((prev) => ({ ...prev, [pref.key]: !prev[pref.key] }))}
//                         className={`relative w-12 h-7 rounded-full border-2 transition-colors ${active ? 'bg-[#1b3a2a] border-[#1b3a2a]' : 'bg-gray-200 border-gray-200'}`}
//                       >
//                         <motion.div
//                           layout
//                           transition={{ type: 'spring', stiffness: 500, damping: 30 }}
//                           className={`absolute top-[2px] w-5 h-5 rounded-full bg-white shadow-sm ${active ? 'left-[22px]' : 'left-[2px]'}`}
//                         />
//                       </motion.button>
//                     </div>
//                   );
//                 })}
//               </div>
//             </motion.div>

//             {/* ── Language ── */}
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <div className="flex items-center gap-2 mb-5">
//                 <Globe size={18} className="text-gray-400" strokeWidth={2.5} />
//                 <h3 className="font-bold text-lg text-gray-900">Language</h3>
//               </div>
//               <div className="flex gap-2">
//                 {[
//                   { key: 'english', label: 'English' },
//                   { key: 'hindi', label: 'हिंदी' },
//                   { key: 'marathi', label: 'मराठी' },
//                 ].map((l) => {
//                   const active = lang === l.key;
//                   return (
//                     <motion.button
//                       key={l.key}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => setLang(l.key)}
//                       className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${active
//                         ? 'bg-[#1b3a2a] text-white shadow-sm'
//                         : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
//                         }`}
//                     >
//                       {l.label}
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             </motion.div>

//             {/* ── Achievements Card ── */}
//             <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
//               <h3 className="font-bold text-lg text-gray-900 mb-5">Achievements</h3>
//               <div className="space-y-3">
//                 {[
//                   { icon: Flame, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', title: '7-Day Streak', desc: 'Public transit every weekday' },
//                   { icon: Leaf, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', title: '8.2 kg CO₂ Saved', desc: 'This month vs. driving' },
//                   { icon: Zap, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', title: 'Speed Demon', desc: 'Avg 26 min — 4 min faster than city avg' },
//                   { icon: Heart, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', title: 'Top Saver', desc: '₹2,340 saved this year' },
//                 ].map((a, i) => (
//                   <div key={i} className={`p-4 rounded-2xl ${a.bg} border ${a.border} flex items-center gap-3`}>
//                     <div className={`w-9 h-9 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center flex-shrink-0`}>
//                       <a.icon size={16} className={a.text} strokeWidth={2.5} />
//                     </div>
//                     <div>
//                       <p className={`font-bold text-sm ${a.text}`}>{a.title}</p>
//                       <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* ── Footer ── */}
//             <motion.div variants={fadeUp} className="text-center pt-2 pb-2">
//               <p className="text-[11px] text-gray-400 font-medium">FlowCity v2.0 · Built with ❤️ in Mumbai</p>
//             </motion.div>
//           </div>
//         </div>
//       </motion.div>
//     </>
//   );
// };

// export default ProfileScreen;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Plus, Train, Bus, Bell, MapPin, Shield, Clock, Pencil, Globe,
  ChevronRight, Flame, Leaf, Zap, Award, Heart, Users, TrendingDown,
  BarChart3, Wallet, Route, X, Car, Footprints, Sunrise, Sun, Sunset,
  Bike, Anchor,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ─── Animations ──────────────────────────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function useCounter(target: number, duration = 1.5) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(id);
  }, [target, duration]);
  return val;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const prefConfig = [
  { key: 'bus', label: 'BUS', icon: Bus, default: true },
  { key: 'metro', label: 'METRO', icon: Train, default: true },
  { key: 'uber', label: 'UBER/TAXI', icon: Car, default: true },
  { key: 'local', label: 'LOCAL TRAIN', icon: Train, default: false },
  { key: 'walk', label: 'WALK', icon: Footprints, default: false },
];

const modeConfig = [
  { key: 'metro', label: 'Metro', icon: Train, color: 'blue' },
  { key: 'local', label: 'Local Train', icon: Train, color: 'indigo' },
  { key: 'bus', label: 'Bus', icon: Bus, color: 'amber' },
  { key: 'auto', label: 'Auto', icon: Car, color: 'orange' },
  { key: 'uber', label: 'Uber', icon: Car, color: 'purple' },
  { key: 'walk', label: 'Walk', icon: Footprints, color: 'emerald' },
  { key: 'cycle', label: 'Cycle', icon: Bike, color: 'lime' },
  { key: 'ferry', label: 'Ferry', icon: Anchor, color: 'cyan' },
] as const;

type ModeKey = typeof modeConfig[number]['key'];

const modeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-600', dot: 'bg-lime-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', dot: 'bg-cyan-500' },
  gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const timeConfig = [
  { key: 'morning', label: 'Morning', icon: Sunrise, bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600' },
  { key: 'afternoon', label: 'Afternoon', icon: Sun, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
  { key: 'evening', label: 'Evening', icon: Sunset, bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
];

const timeLabelMap: Record<string, string> = {
  morning: 'Morning Commute', afternoon: 'Afternoon Route', evening: 'Evening Route',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Leg = { from: string; to: string; mode: string };
type RouteEntry = { legs: Leg[]; detail: string; time: string };

const getModeInfo = (key: string) =>
  modeConfig.find(m => m.key === key) ?? modeConfig[0];

// ─── Default routes (new Leg[] format) ───────────────────────────────────────
const defaultRoutes: RouteEntry[] = [
  {
    legs: [{ from: 'Home', to: 'DJSCE', mode: 'metro' }],
    detail: 'Morning Commute', time: 'morning',
  },
  {
    legs: [{ from: 'Andheri', to: 'Bandra', mode: 'bus' }],
    detail: 'Evening Route', time: 'evening',
  },
];

// ─── Compact horizontal mode-pill row ────────────────────────────────────────
function ModeRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {modeConfig.map(m => {
        const active = value === m.key;
        const mc = modeColors[m.color];
        const Icon = m.icon;
        return (
          <motion.button
            key={m.key}
            whileTap={{ scale: 0.88 }}
            onClick={() => onChange(m.key)}
            className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 transition-all text-[10px] font-bold whitespace-nowrap ${active
              ? `${mc.bg} ${mc.border} ${mc.text}`
              : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
              }`}
          >
            <Icon size={11} strokeWidth={2.5} />
            {m.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Add Route Modal ──────────────────────────────────────────────────────────
const overlayV = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
const sheetV = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 28, stiffness: 380 } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.16 } },
};

function AddRouteModal({ onClose, onAdd }: { onClose: () => void; onAdd: (r: RouteEntry) => void }) {
  const [stops, setStops] = useState<string[]>(['', '']);
  const [modes, setModes] = useState<string[]>(['metro']);
  const [time, setTime] = useState('morning');

  // Add an intermediate stop before the final destination
  const addStop = () => {
    setStops(prev => [...prev.slice(0, -1), '', prev[prev.length - 1]]);
    setModes(prev => [...prev, prev[prev.length - 1]]); // carry last mode as default
  };

  // Remove stop at index i (must be intermediate: 1 ≤ i ≤ n-2)
  const removeStop = (i: number) => {
    setStops(prev => prev.filter((_, idx) => idx !== i));
    // Remove the incoming leg mode (modes[i-1]); outgoing (modes[i]) stays
    setModes(prev => prev.filter((_, idx) => idx !== i - 1));
  };

  const updateStop = (i: number, v: string) =>
    setStops(prev => prev.map((s, idx) => (idx === i ? v : s)));

  const updateMode = (i: number, v: string) =>
    setModes(prev => prev.map((m, idx) => (idx === i ? v : m)));

  const canSave = stops[0].trim() !== '' && stops[stops.length - 1].trim() !== '';

  const handleSave = () => {
    if (!canSave) return;
    const legs: Leg[] = modes.map((mode, i) => ({
      from: stops[i].trim() || `Stop ${i + 1}`,
      to: stops[i + 1].trim() || `Stop ${i + 2}`,
      mode,
    }));
    onAdd({ legs, detail: timeLabelMap[time] ?? 'Custom Route', time });
    onClose();
  };

  const stopLabel = (i: number) => {
    if (i === 0) return 'From';
    if (i === stops.length - 1) return 'To (Final Destination)';
    return `Via Stop ${i}`;
  };

  return (
    <motion.div
      variants={overlayV} initial="hidden" animate="show" exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <motion.div
        variants={sheetV}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[440px] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="bg-[#1b3a2a] px-6 pt-6 pb-5 relative overflow-hidden flex-shrink-0">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add Saved Route</h2>
              <p className="text-xs text-white/50 mt-0.5 font-medium">Build your journey — add as many stops as you need</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors mt-0.5"
            >
              <X size={14} className="text-white/70" />
            </motion.button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="p-6 space-y-0">

            {/* Journey builder – stops alternate with mode rows */}
            {stops.map((stop, i) => (
              <div key={i}>
                {/* Stop input */}
                <div className="mb-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-block w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${i === 0 || i === stops.length - 1
                        ? 'bg-[#1b3a2a] text-[#c5f02c]'
                        : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                      {i + 1}
                    </span>
                    {stopLabel(i)}
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 border-2 border-gray-100 rounded-2xl px-4 py-3 bg-gray-50 focus-within:border-[#1b3a2a] focus-within:bg-white focus-within:shadow-sm transition-all">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <MapPin size={11} className="text-gray-500" strokeWidth={2.5} />
                      </div>
                      <input
                        value={stop}
                        onChange={e => updateStop(i, e.target.value)}
                        placeholder={
                          i === 0 ? 'e.g. Home, Andheri East…'
                            : i === stops.length - 1 ? 'e.g. DJSCE, Churchgate…'
                              : 'e.g. Andheri Station, Dadar…'
                        }
                        className="flex-1 bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-400 outline-none"
                      />
                    </div>
                    {/* Remove button — only for intermediate stops */}
                    {i > 0 && i < stops.length - 1 && (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => removeStop(i)}
                        className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                      >
                        <X size={13} className="text-red-400" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Mode selector between stops */}
                {i < stops.length - 1 && (
                  <div className="mb-3 pl-1">
                    {/* Vertical connector */}
                    <div className="flex items-center gap-2 mb-1.5 ml-2">
                      <div className="flex flex-col items-center">
                        <div className="w-px h-2 bg-gray-200" />
                        <div className={`w-3 h-3 rounded-full border-2 ${modeColors[getModeInfo(modes[i]).color].border
                          } ${modeColors[getModeInfo(modes[i]).color].bg}`} />
                        <div className="w-px h-2 bg-gray-200" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Transport for leg {i + 1}
                      </span>
                    </div>
                    <ModeRow value={modes[i]} onChange={v => updateMode(i, v)} />
                    <div className="h-3" />
                  </div>
                )}
              </div>
            ))}

            {/* Add Stop */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={addStop}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 hover:border-[#1b3a2a] hover:text-[#1b3a2a] hover:bg-[#f0faf4] transition-all"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="text-xs font-bold">Add Stop</span>
            </motion.button>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-5" />

            {/* Transit time */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 block">
                Transit Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeConfig.map(t => {
                  const active = time === t.key;
                  const Icon = t.icon;
                  return (
                    <motion.button
                      key={t.key} whileTap={{ scale: 0.93 }}
                      onClick={() => setTime(t.key)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all ${active ? `${t.bg} ${t.border}` : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                    >
                      <Icon size={17} className={active ? t.text : 'text-gray-400'} strokeWidth={2.5} />
                      <span className={`text-[10px] font-bold ${active ? t.text : 'text-gray-400'}`}>{t.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-5">
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-gray-100 border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={handleSave}
                disabled={!canSave}
                className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all ${canSave
                  ? 'bg-[#1b3a2a] text-white shadow-sm hover:bg-[#2a5240]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
              >
                Save Route
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Route Card (full journey chain display) ──────────────────────────────────
function RouteCard({ route }: { route: RouteEntry }) {
  const firstModeInfo = getModeInfo(route.legs[0].mode);
  const c = modeColors[firstModeInfo.color] ?? modeColors.gray;
  const LeadIcon = firstModeInfo.icon;
  const isMultiLeg = route.legs.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 350 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`relative p-4 rounded-2xl ${c.bg} border ${c.border} cursor-pointer group overflow-hidden transition-shadow hover:shadow-md`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.dot} rounded-r-full`} />

      <div className="flex items-start gap-3 ml-2">
        {/* Leading mode icon */}
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <LeadIcon size={18} className={c.text} strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          {/* ── Full stop chain: Stop A →[icon]→ Stop B →[icon]→ Stop C ── */}
          <div className="flex items-center flex-wrap gap-x-1 gap-y-1">
            {route.legs.map((leg, li) => {
              const mi = getModeInfo(leg.mode);
              const mc = modeColors[mi.color];
              const MIcon = mi.icon;
              return (
                <span key={li} className="flex items-center gap-1">
                  {/* Origin label (only on first leg) */}
                  {li === 0 && (
                    <span className="text-sm font-bold text-gray-900 leading-tight">{leg.from}</span>
                  )}
                  {/* Mode arrow badge */}
                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg ${mc.bg} border ${mc.border}`}>
                    <MIcon size={10} className={mc.text} strokeWidth={3} />
                  </span>
                  {/* Destination */}
                  <span className="text-sm font-bold text-gray-900 leading-tight">{leg.to}</span>
                </span>
              );
            })}
          </div>

          {/* ── Mode badges per leg + time label ── */}
          <div className={`flex items-center flex-wrap gap-1.5 ${isMultiLeg ? 'mt-2' : 'mt-1.5'}`}>
            {route.legs.map((leg, li) => {
              const mi = getModeInfo(leg.mode);
              const mc = modeColors[mi.color];
              const MIcon = mi.icon;
              return (
                <span
                  key={li}
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${mc.bg} ${mc.text} border ${mc.border}`}
                >
                  <MIcon size={9} strokeWidth={3} />
                  {mi.label}
                </span>
              );
            })}
            <span className="text-xs font-medium text-gray-500">· {route.detail}</span>
          </div>

          {/* ── Multi-leg stop list (compact) ── */}
          {isMultiLeg && (
            <div className="mt-2 flex flex-wrap gap-x-1 items-center">
              {route.legs.map((leg, li) => (
                <span key={li} className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  {li === 0 && <span>{leg.from}</span>}
                  <span className="text-gray-300">→</span>
                  <span>{leg.to}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 mt-1">
          <Star size={15} className="text-amber-400 fill-amber-400" strokeWidth={2.5} />
          <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const { user } = useAuth();

  const [savedRoutes, setSavedRoutes] = useState<RouteEntry[]>(defaultRoutes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const prefs = Object.fromEntries(prefConfig.map(p => [p.key, p.default]));
    if (user?.transportPrefs) {
      prefConfig.forEach(p => {
        if (user.transportPrefs.includes(p.key)) {
          prefs[p.key] = true;
        } else if (user.transportPrefs.length > 0) {
          // If they have preferences but this key is not there, it was probably unchecked
          prefs[p.key] = false;
        }
      });
    }
    return prefs;
  });
  const [lang, setLang] = useState('english');

  const trips = useCounter(87, 1.8);
  const saved = useCounter(2340, 1.8);
  const hours = useCounter(42, 1.8);
  const routesAnalyzed = useCounter(214, 1.8);
  const avgOpt = useCounter(23, 1.8);

  return (
    <>
      <AnimatePresence>
        {showAddModal && (
          <AddRouteModal
            onClose={() => setShowAddModal(false)}
            onAdd={route => setSavedRoutes(prev => [...prev, route])}
          />
        )}
      </AnimatePresence>

      <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto pb-10">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Profile</h1>
          <p className="text-gray-500 font-medium">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ═══ LEFT ═══ */}
          <div className="xl:col-span-2 space-y-6">

            {/* Hero card */}
            <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-[28px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[28px] font-bold text-white tracking-tight">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'RA'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || 'Rohan Acharya'}</h2>
                  <p className="text-sm text-white/60 font-medium mt-0.5">{user?.city || 'Mumbai, Maharashtra'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white/70 tracking-wider uppercase">
                      Member since {user?.joinDate || 'Jan 2026'}
                    </span>
                    <span className="bg-[#c5f02c]/20 border border-[#c5f02c]/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-[#c5f02c] tracking-wider uppercase">Premium</span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
                  <Pencil size={16} className="text-white/70" />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: trips, label: 'Total Trips', sub: 'this year', icon: Award, iconBg: 'bg-gray-100', iconC: 'text-gray-500', col: 'text-gray-900' },
                { value: `₹${saved.toLocaleString()}`, label: 'Money Saved', sub: 'vs auto/cab', icon: Wallet, iconBg: 'bg-emerald-50', iconC: 'text-emerald-500', col: 'text-emerald-600' },
                { value: `${hours} hrs`, label: 'Time Saved', sub: 'vs avg commute', icon: Clock, iconBg: 'bg-blue-50', iconC: 'text-blue-500', col: 'text-blue-600' },
                { value: routesAnalyzed, label: 'Routes Analyzed', sub: 'by AI engine', icon: Route, iconBg: 'bg-purple-50', iconC: 'text-purple-500', col: 'text-purple-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                    <s.icon size={18} className={s.iconC} strokeWidth={2.5} />
                  </div>
                  <p className={`text-2xl font-bold ${s.col} tabular-nums tracking-tight`}>{s.value}</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </motion.div>

            {/* AI Optimization */}
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#1b3a2a] flex items-center justify-center">
                  <BarChart3 size={15} className="text-[#c5f02c]" />
                </div>
                <h3 className="font-bold text-base text-gray-900">AI Optimization Stats</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#e8f5ee] to-[#f0faf4] rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3"><TrendingDown size={14} className="text-emerald-600" /><span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Avg Improvement</span></div>
                  <p className="text-3xl font-bold text-emerald-700 tabular-nums">{avgOpt}%</p>
                  <p className="text-xs text-emerald-600/70 mt-1 font-medium">faster than self-planned routes</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3"><Clock size={14} className="text-blue-600" /><span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Time Efficiency</span></div>
                  <p className="text-3xl font-bold text-blue-700 tabular-nums">26 min</p>
                  <p className="text-xs text-blue-600/70 mt-1 font-medium">avg commute · 4 min &lt; city avg</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-3"><Shield size={14} className="text-purple-600" /><span className="text-xs font-bold text-purple-700 uppercase tracking-wider">AI Picks Used</span></div>
                  <p className="text-3xl font-bold text-purple-700 tabular-nums">78%</p>
                  <p className="text-xs text-purple-600/70 mt-1 font-medium">of AI recommendations accepted</p>
                </div>
              </div>
            </motion.div>

            {/* Saved Routes */}
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Saved Routes</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#1b3a2a] hover:border-[#1b3a2a] group transition-colors"
                >
                  <Plus size={16} className="text-gray-500 group-hover:text-white transition-colors" strokeWidth={2.5} />
                </motion.button>
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {savedRoutes.map((route, i) => (
                    <RouteCard key={`${route.legs[0].from}-${route.legs[route.legs.length - 1].to}-${i}`} route={route} />
                  ))}
                </AnimatePresence>
                {savedRoutes.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400 font-medium">No saved routes yet</p>
                    <p className="text-xs text-gray-300 mt-1">Tap + to build your first journey</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ═══ RIGHT ═══ */}
          <div className="space-y-6">

            {/* Preferences */}
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-6">Preferences</h3>
              <div className="space-y-2">
                {prefConfig.map(pref => {
                  const active = toggles[pref.key];
                  const Icon = pref.icon;
                  return (
                    <div key={pref.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-blue-50' : 'bg-gray-100'} transition-colors`}>
                          <Icon size={16} strokeWidth={2.5} className={active ? 'text-blue-600' : 'text-gray-400'} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{pref.label}</span>
                      </div>
                      <motion.button
                        onClick={() => setToggles(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                        className={`relative w-12 h-7 rounded-full border-2 transition-colors ${active ? 'bg-[#1b3a2a] border-[#1b3a2a]' : 'bg-gray-200 border-gray-200'}`}
                      >
                        <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`absolute top-[2px] w-5 h-5 rounded-full bg-white shadow-sm ${active ? 'left-[22px]' : 'left-[2px]'}`} />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Language */}
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <Globe size={18} className="text-gray-400" strokeWidth={2.5} />
                <h3 className="font-bold text-lg text-gray-900">Language</h3>
              </div>
              <div className="flex gap-2">
                {[{ key: 'english', label: 'English' }, { key: 'hindi', label: 'हिंदी' }, { key: 'marathi', label: 'मराठी' }].map(l => (
                  <motion.button key={l.key} whileTap={{ scale: 0.95 }} onClick={() => setLang(l.key)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${lang === l.key ? 'bg-[#1b3a2a] text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>
                    {l.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-7 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 mb-5">Achievements</h3>
              <div className="space-y-3">
                {[
                  { icon: Flame, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', title: '7-Day Streak', desc: 'Public transit every weekday' },
                  { icon: Leaf, bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', title: '8.2 kg CO₂ Saved', desc: 'This month vs. driving' },
                  { icon: Zap, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', title: 'Speed Demon', desc: 'Avg 26 min — 4 min faster than city avg' },
                  { icon: Heart, bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', title: 'Top Saver', desc: '₹2,340 saved this year' },
                ].map((a, i) => (
                  <div key={i} className={`p-4 rounded-2xl ${a.bg} border ${a.border} flex items-center gap-3`}>
                    <div className={`w-9 h-9 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center flex-shrink-0`}>
                      <a.icon size={16} className={a.text} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${a.text}`}>{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="text-center pt-2 pb-2">
              <p className="text-[11px] text-gray-400 font-medium">FlowCity v2.0 · Built with ❤️ in Mumbai</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProfileScreen;