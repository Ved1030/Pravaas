import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  MapPin,
  Locate,
  Bell,
  BellOff,
  Clock,
  TrendingUp,
  Filter,
  X,
} from 'lucide-react';
import { getNotifications } from '@/lib/api';
import type { NotificationAlert, NotificationSeverity, NotificationType } from '@/lib/types';
import MapComponent, { type MapRoute, type AlertMarker, normalizeCoordinates } from '@/components/MapComponent';

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const ICON_MAP: Record<NotificationType, string> = {
  accident: '🚧',
  metro_delay: '🚇',
  crowd: '🧑‍🤝‍🧑',
  traffic: '🚦',
  signal_failure: '🚨',
  road_closure: '🚫',
  prediction: '⚠️',
};

const SEVERITY_CONFIG: Record<NotificationSeverity, { bg: string; text: string; border: string; dot: string; label: string }> = {
  high: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'High',
  },
  medium: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Medium',
  },
  low: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low',
  },
};

const TYPE_LABELS: Record<NotificationType, string> = {
  accident: 'Accident',
  metro_delay: 'Metro Delay',
  crowd: 'Crowd',
  traffic: 'Traffic',
  signal_failure: 'Signal Failure',
  road_closure: 'Road Closure',
  prediction: 'AI Prediction',
};

const FILTER_OPTIONS: { value: NotificationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'accident', label: '🚧 Accidents' },
  { value: 'metro_delay', label: '🚇 Metro' },
  { value: 'crowd', label: '🧑‍🤝‍🧑 Crowd' },
  { value: 'traffic', label: '🚦 Traffic' },
  { value: 'signal_failure', label: '🚨 Signal' },
  { value: 'road_closure', label: '🚫 Closure' },
  { value: 'prediction', label: '⚠️ AI Predict' },
];

function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
  return Notification.permission === 'granted';
}

function sendPushNotification(alert: NotificationAlert) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const icon = ICON_MAP[alert.type] || '⚠️';
  new Notification(`${icon} ${alert.title}`, {
    body: `${alert.message} — ${alert.location} (${alert.distance} km)`,
    tag: String(alert.id),
    requireInteraction: false,
  });
}

const NotificationsScreen = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([]);
  const [alertMarkers, setAlertMarkers] = useState<AlertMarker[]>([]);
  const hasPushedRef = useRef<Set<string>>(new Set());

  const fetchAlerts = useCallback((lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    getNotifications(lat, lng, 5)
      .then((resp) => {
        setAlerts(resp.alerts);
        setLoading(false);

        if (pushEnabled) {
          resp.alerts.forEach((alert) => {
            if (!hasPushedRef.current.has(String(alert.id))) {
              hasPushedRef.current.add(String(alert.id));
              sendPushNotification(alert);
            }
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch notifications:', err);
        setError('Could not connect to notification service. Make sure the backend is running.');
        setLoading(false);
      });
  }, [pushEnabled]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchAlerts(latitude, longitude);
      },
      (err) => {
        console.error('Location error:', err);
        if (err.code === 1) {
          setGeoError('Location access denied. Please enable location permissions.');
        } else if (err.code === 2) {
          setGeoError('Location unavailable. Please check your device settings.');
        } else {
          setGeoError('Location request timed out. Please try again.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleTogglePush = () => {
    const granted = requestNotificationPermission();
    setPushEnabled(granted);
  };

  const filteredAlerts = activeFilter === 'all'
    ? alerts
    : alerts.filter((a) => a.type === activeFilter);

  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const predictionCount = alerts.filter((a) => a.type === 'prediction').length;

  useEffect(() => {
    if (alerts.length > 0 && showMap) {
      const heatmapPoints: [number, number][] = alerts.map((a) => [a.coordinates.lat, a.coordinates.lng]);
      const route: MapRoute = {
        id: 'heatmap-alerts',
        type: 'fastest',
        color: '#ef4444',
        positions: heatmapPoints,
      };
      setMapRoutes([route]);

      const markers: AlertMarker[] = alerts.map((a) => ({
        id: a.id,
        type: a.type,
        title: a.title,
        message: a.message,
        location: a.location,
        severity: a.severity,
        coordinates: a.coordinates,
        icon: ICON_MAP[a.type] || '⚠️',
        distance: a.distance,
        confidence: a.confidence,
      }));
      setAlertMarkers(markers);
    }
  }, [alerts, showMap]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto">
      <motion.div variants={fadeUp} className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Nearby Alerts</h1>
            <p className="text-gray-500 font-medium">Real-time disruptions and AI predictions around you</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePush}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pushEnabled
                  ? 'bg-[#1b3a2a] text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {pushEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              {pushEnabled ? 'Push On' : 'Push Off'}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                showMap
                  ? 'bg-[#1b3a2a] text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <MapPin size={14} />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
        {/* ── LEFT PANEL ── */}
        <div className="space-y-5">
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4">Your Location</h3>

            {userLocation ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Locate size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Location detected</p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-500 text-center">Enable location to see nearby alerts</p>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetLocation}
                  className="w-full py-3 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:bg-[#234d38] transition-all"
                >
                  <Locate size={14} />
                  Use My Location
                </motion.button>
              </div>
            )}

            {geoError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-600">{geoError}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          {alerts.length > 0 && (
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-red-600">{highCount}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">High</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-blue-600">{predictionCount}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">AI Pred</p>
              </div>
            </motion.div>
          )}

          {/* Filter */}
          {alerts.length > 0 && (
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3"
              >
                <Filter size={14} />
                Filter by type
                <motion.div animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2">
                      {FILTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setActiveFilter(opt.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeFilter === opt.value
                              ? 'bg-[#1b3a2a] text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-5 overflow-y-auto pr-2" style={{ scrollBehavior: 'smooth', maxHeight: 'calc(100vh - 140px)' }}>
          {/* Map */}
          <AnimatePresence>
            {showMap && userLocation && (
              <motion.div
                variants={fadeUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-[28px] overflow-hidden border border-gray-100 shadow-sm"
                style={{ height: 350 }}
              >
                <MapComponent
                  routes={mapRoutes}
                  selectedRouteId="heatmap-alerts"
                  sourceLabel="You"
                  destinationLabel="Alerts"
                  userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null}
                  alertMarkers={alertMarkers}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {loading && !userLocation && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1b3a2a]/10 flex items-center justify-center">
                  <Loader2 size={24} className="text-[#1b3a2a] animate-spin" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Detecting your location…</p>
              </motion.div>
            )}

            {loading && userLocation && (
              <motion.div key="loading-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1b3a2a]/10 flex items-center justify-center">
                  <Loader2 size={24} className="text-[#1b3a2a] animate-spin" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Fetching nearby alerts…</p>
              </motion.div>
            )}

            {!loading && userLocation && filteredAlerts.length > 0 && (
              <motion.div key="alerts" variants={stagger} initial="hidden" animate="show" className="space-y-4">
                {filteredAlerts.map((alert) => {
                  const sev = SEVERITY_CONFIG[alert.severity];
                  const icon = ICON_MAP[alert.type] || '⚠️';
                  const typeLabel = TYPE_LABELS[alert.type] || alert.type;
                  const isPrediction = alert.type === 'prediction';

                  return (
                    <motion.div
                      key={alert.id}
                      variants={fadeUp}
                      whileHover={{ y: -2 }}
                      className={`rounded-2xl p-5 border transition-all ${
                        isPrediction
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                          : `${sev.bg} ${sev.border}`
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                          isPrediction ? 'bg-blue-100 border border-blue-200' : 'bg-white/80 border border-gray-100'
                        }`}>
                          {icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-bold text-sm ${isPrediction ? 'text-blue-800' : 'text-gray-900'}`}>
                              {alert.title}
                            </h4>
                            {isPrediction && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                                <TrendingUp size={9} />
                                AI
                              </span>
                            )}
                          </div>

                          <p className={`text-xs font-medium mb-2 ${isPrediction ? 'text-blue-600' : 'text-gray-600'}`}>
                            {alert.message}
                          </p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${sev.bg} ${sev.text} border ${sev.border}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                              <span className="text-[10px] font-bold">{sev.label}</span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                              <MapPin size={11} />
                              {alert.location}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                              <Clock size={11} />
                              {alert.distance} km away
                            </div>

                            {isPrediction && alert.confidence != null && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                                {Math.round(alert.confidence * 100)}% confidence
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {!loading && userLocation && filteredAlerts.length === 0 && alerts.length > 0 && activeFilter !== 'all' && (
              <motion.div key="no-filter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <X size={24} className="text-gray-300" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">No {FILTER_OPTIONS.find(f => f.value === activeFilter)?.label} alerts</h4>
                <p className="text-sm text-gray-400 font-medium">Try a different filter or clear selection</p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 px-4 py-2 bg-[#1b3a2a] text-white rounded-xl text-xs font-semibold"
                >
                  Show All Alerts
                </button>
              </motion.div>
            )}

            {!loading && userLocation && alerts.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">No issues nearby</h4>
                <p className="text-sm text-gray-400 font-medium">Smooth travel — all clear around you</p>
              </motion.div>
            )}

            {!loading && !userLocation && !geoError && (
              <motion.div key="no-location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <Bell size={24} className="text-gray-300" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Enable Location</h4>
                <p className="text-sm text-gray-400 font-medium">We need your location to show nearby alerts</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-600">{error}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsScreen;
