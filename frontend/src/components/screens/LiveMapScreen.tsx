import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  MapPin,
  Flag,
  ArrowUpDown,
  Zap,
  IndianRupee,
  Users,
  Clock,
  Shield,
  Sparkles,
  AlertCircle,
  Loader2,
  TrendingDown,
  Wallet,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Train,
  Bus,
  Car,
  Footprints,
  Plus,
  X,
  Navigation,
  Play,
  Square,
  Volume2,
  VolumeX,
  LocateFixed,
  Locate,
} from 'lucide-react';
import { planRoute, getVoiceInstructions, getConnectionState, getConnectionStateMessage, onConnectionStateChange, type BackendRoute, type RouteResource, type AIRecommendation, type VoiceInstruction, type ConnectionState } from '@/lib/api';
import MapComponent, { type LatLng, type MapRoute, type MapStop, type UserLocation, normalizeCoordinates } from '@/components/MapComponent';
import { LIVE_LOCATION_KEY } from '@/components/ui/LiveLocationCard';

type StoredLiveLocation = {
  lat: number;
  lng: number;
  area?: string;
  address?: string;
  accuracy?: number;
  timestamp?: number;
};

function readLiveLocationFromSession(): StoredLiveLocation | null {
  try {
    const raw = sessionStorage.getItem(LIVE_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredLiveLocation;
    if (typeof parsed?.lat !== 'number' || typeof parsed?.lng !== 'number' || Number.isNaN(parsed.lat) || Number.isNaN(parsed.lng)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function geocodeLocation(query: string): Promise<LatLng> {
  const q = encodeURIComponent(`${query}, Mumbai, India`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: "${query}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const routeColors: Record<string, string> = {
  fastest: '#22c55e',
  cheapest: '#3b82f6',
  comfort: '#f97316',
};

function buildRoutesFromBackend(routes: BackendRoute[], recommendedId?: string): MapRoute[] {
  if (!routes || !Array.isArray(routes)) return [];
  return routes
    .filter((r) => r && r.geometry && Array.isArray(r.geometry) && r.geometry.length > 1)
    .map((r) => {
      // normalizeCoordinates converts OSRM [lng, lat] → Leaflet [lat, lng]
      const positions = normalizeCoordinates(r.geometry);
      console.log('OSRM coords (raw):', r.geometry.slice(0, 5));
      console.log('Leaflet coords (normalized):', positions.slice(0, 5));
      return {
        id: r.id,
        type: r.type,
        color: routeColors[r.type] || '#888',
        positions,
      };
    });
}

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const routeTypeConfig: Record<string, { bg: string; text: string; label: string; icon: any; color: string }> = {
  fastest: { bg: 'bg-[#1b3a2a]', text: 'text-white', label: 'Fastest', icon: Zap, color: '#22c55e' },
  cheapest: { bg: 'bg-blue-600', text: 'text-white', label: 'Cheapest', icon: IndianRupee, color: '#3b82f6' },
  comfort: { bg: 'bg-orange-500', text: 'text-white', label: 'Comfort', icon: Users, color: '#f97316' },
};

const trafficConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  low: { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  medium: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  high: { label: 'Heavy', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
};

const resourceConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  walk: { icon: Footprints, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
  metro: { icon: Train, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  bus: { icon: Bus, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  train: { icon: Train, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  cab: { icon: Car, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  auto: { icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

function ResourceFlow({ resources, compact }: { resources: RouteResource[]; compact?: boolean }) {
  if (!resources || resources.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {resources.map((res, i) => {
        const cfg = resourceConfig[res.type] || resourceConfig.walk;
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${cfg.bg} border ${cfg.border}`}>
              <Icon size={compact ? 12 : 14} className={cfg.color} strokeWidth={2} />
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

function RouteCard({
  route,
  isSelected,
  onSelect,
}: {
  route: BackendRoute;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const cfg = routeTypeConfig[route.type] || routeTypeConfig.comfort;
  const traffic = trafficConfig[route.trafficLevel] || trafficConfig.medium;
  const BadgeIcon = cfg.icon;

  return (
    <motion.div
      variants={fadeUp}
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-2 border-[#1b3a2a]/30 bg-white shadow-lg ring-1 ring-[#1b3a2a]/10'
          : 'border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${cfg.bg} ${cfg.text} px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5`}>
          <BadgeIcon size={12} strokeWidth={3} />
          {cfg.label}
        </div>
        <div className="flex items-center gap-3">
          {route.predictedDelay > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle size={11} className="text-amber-500" />
              <span className="text-xs font-medium text-amber-600">+{route.predictedDelay} min</span>
            </div>
          )}
          {isSelected && (
            <CheckCircle2 size={16} className="text-[#1b3a2a]" />
          )}
        </div>
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
      </div>

      <div className="mb-4 p-3 bg-gray-50/80 rounded-xl">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Transport Mix</p>
        <ResourceFlow resources={route.resources || []} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-600">{route.confidence}%</span>
          <span className="text-xs text-gray-400">confidence</span>
        </div>
        {route.transfers > 0 && (
          <div className="flex items-center gap-1">
            <ArrowUpDown size={11} className="text-gray-400" />
            <span className="text-xs text-gray-500">{route.transfers} transfer{route.transfers > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const PROXIMITY_THRESHOLD = 200;

const LiveMapScreen = () => {
  const storedLiveLocation = readLiveLocationFromSession();

  const [source, setSource] = useState(() => storedLiveLocation?.area || storedLiveLocation?.address || '');
  const [sourceCoords, setSourceCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<BackendRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [recommended, setRecommended] = useState<AIRecommendation | null>(null);
  const [mapRoutes, setMapRoutes] = useState<MapRoute[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [navigationMode, setNavigationMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [voiceInstructions, setVoiceInstructions] = useState<VoiceInstruction[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mapStops, setMapStops] = useState<MapStop[]>([]);
  const [segmentGeometries, setSegmentGeometries] = useState<[number, number][][]>([]);
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [connState, setConnState] = useState<ConnectionState>(getConnectionState());

  useEffect(() => {
    return onConnectionStateChange(setConnState);
  }, []);

  const speechQueueRef = useRef<number[]>([]);
  const stepDetectionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (stepDetectionRef.current !== null) {
        clearInterval(stepDetectionRef.current);
      }
      speechSynthesis.cancel();
    };
  }, []);

  const handleSwap = () => {
    setSource(destination);
    setDestination(source);
    setStops([]);
    setRoutes([]);
    setSelectedRoute(null);
    setMapRoutes([]);
    setRecommended(null);
    setMapStops([]);
    setSegmentGeometries([]);
    setWaypoints([]);
    stopNavigation();
  };

  const addStop = () => {
    if (stops.length < 3) {
      setStops([...stops, '']);
    }
  };

  const updateStop = (idx: number, val: string) => {
    const updated = [...stops];
    updated[idx] = val;
    setStops(updated);
    setRoutes([]);
    setSelectedRoute(null);
  };

  const removeStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
    setRoutes([]);
    setSelectedRoute(null);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSourceCoords({ lat: latitude, lng: longitude });
        setSource('Current Location');
        setUserLocation({ lat: latitude, lng: longitude, accuracy: pos.coords.accuracy });
        setLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        if (err.code === 1) {
          setError('Location access denied. Please enable location permissions.');
        } else if (err.code === 2) {
          setError('Location unavailable. Please check your device settings.');
        } else {
          setError('Location request timed out. Please try again.');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUserLocationChange = useCallback((loc: UserLocation) => {
    setUserLocation(loc);
  }, []);

  const detectCurrentStep = useCallback((loc: UserLocation, activeRoute: BackendRoute | undefined) => {
    if (!activeRoute || !activeRoute.steps || activeRoute.steps.length === 0) return;

    const steps = activeRoute.steps;
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepStartIdx = Math.floor((i / steps.length) * activeRoute.geometry.length);
      const stepEndIdx = Math.floor(((i + 1) / steps.length) * activeRoute.geometry.length);

      if (stepStartIdx < 0 || stepEndIdx > activeRoute.geometry.length) continue;

      for (let j = stepStartIdx; j < Math.min(stepEndIdx, activeRoute.geometry.length); j++) {
        const coord = activeRoute.geometry[j];
        const [lat, lng] = normalizeCoordinates([coord])[0] || coord;
        const dist = haversineDistance(loc.lat, loc.lng, lat, lng);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
    }

    if (closestIdx !== currentStepIndex) {
      setCurrentStepIndex(closestIdx);
      if (voiceEnabled && voiceInstructions.length > 0) {
        speakInstruction(closestIdx);
      }
    }

    if (segmentGeometries.length > 0) {
      let segIdx = 0;
      let cumulative = 0;
      for (let s = 0; s < segmentGeometries.length; s++) {
        cumulative += segmentGeometries[s].length;
        if (closestIdx < cumulative) {
          segIdx = s;
          break;
        }
      }
      if (segIdx !== currentSegmentIndex) {
        setCurrentSegmentIndex(segIdx);
      }
    }
  }, [currentStepIndex, currentSegmentIndex, voiceEnabled, voiceInstructions, segmentGeometries]);

  const speakInstruction = useCallback((index: number) => {
    speechSynthesis.cancel();
    const instr = voiceInstructions[index];
    if (!instr || !voiceEnabled) return;

    const text = instr.text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [voiceInstructions, voiceEnabled]);

  const startNavigation = useCallback(() => {
    const activeRoute = routes.find((r) => r.id === selectedRoute);
    if (!activeRoute) return;

    console.log('Stops:', stops);
    console.log('Segments:', activeRoute.segmentGeometries ? activeRoute.segmentGeometries.length : 0);

    setNavigationMode(true);
    setCurrentStepIndex(0);
    setCurrentSegmentIndex(0);

    if (segmentGeometries.length === 0 && activeRoute.segmentGeometries) {
      const segs = activeRoute.segmentGeometries as [number, number][][];
      setSegmentGeometries(segs);
    }

    if (activeRoute.steps && activeRoute.steps.length > 0) {
      const navSteps = activeRoute.steps.map((step, idx) => ({
        stepIndex: idx,
        text: step.voiceText || step.label || step.instruction || `Step ${idx + 1}`,
        audio: '',
        mode: step.mode,
        distance: step.distance,
        duration: step.duration,
      }));
      setVoiceInstructions(navSteps);

      if (voiceEnabled && navSteps.length > 0) {
        speakInstruction(0);
      }
    }

    stepDetectionRef.current = setInterval(() => {
      const loc = userLocation;
      if (loc) {
        detectCurrentStep(loc, activeRoute);
      }
    }, 5000);
  }, [routes, selectedRoute, segmentGeometries, voiceEnabled, userLocation, detectCurrentStep, speakInstruction, stops]);

  const stopNavigation = useCallback(() => {
    setNavigationMode(false);
    setCurrentStepIndex(0);
    setCurrentSegmentIndex(0);
    setVoiceInstructions([]);
    setIsSpeaking(false);
    speechSynthesis.cancel();

    if (stepDetectionRef.current !== null) {
      clearInterval(stepDetectionRef.current);
      stepDetectionRef.current = null;
    }
  }, []);

  const handleSearch = async () => {
    const src = source.trim();
    const dst = destination.trim();
    const filteredStops = stops.filter((s) => s && s.trim());

    const storedLabel = storedLiveLocation?.area || storedLiveLocation?.address || '';
    const canUseStoredOrigin = !!storedLiveLocation && (!src || src.toLowerCase() === storedLabel.toLowerCase());

    if (!dst || (!src && !canUseStoredOrigin)) {
      setError('Please enter both origin and destination.');
      return;
    }

    setError(null);
    setGeoError(null);
    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);
    setMapRoutes([]);
    setMapStops([]);
    setSegmentGeometries([]);
    stopNavigation();

    try {
      const originLabel = sourceCoords ? 'Current Location' : (src || storedLiveLocation?.area || storedLiveLocation?.address || 'Current location');
      const filteredStops = stops.filter((s) => s && s.trim());
      const allWaypoints = [originLabel, ...filteredStops, dst];

      console.log('User location:', userLocation);
      console.log('Source coords:', sourceCoords);
      console.log('Stops:', filteredStops);
      console.log('All waypoints:', allWaypoints);

      const [routeData, geoResult] = await Promise.allSettled([
        planRoute(originLabel, dst, undefined, filteredStops, sourceCoords ? { lat: sourceCoords.lat, lng: sourceCoords.lng } : undefined),
        Promise.all(
          allWaypoints.map(async (wp, wpIdx) => {
            if (wpIdx === 0 && sourceCoords) {
              return sourceCoords;
            }
            try {
              return await geocodeLocation(wp);
            } catch {
              return null;
            }
          })
        ),
      ]);

      if (routeData.status === 'fulfilled') {
        const resp = routeData.value;
        const backendRoutes = resp?.routes || [];
        const recId = resp?.recommended?.routeId;

        setRoutes(backendRoutes);
        setSelectedRoute(recId || backendRoutes[0]?.id || null);
        setDistanceKm(resp?.distanceKm || 0);
        setRecommended(resp?.recommended || null);
        setMapRoutes(buildRoutesFromBackend(backendRoutes, recId));

        if (resp.waypoints && resp.waypoints.length > 2) {
          setWaypoints(resp.waypoints);
        }

        const firstRoute = backendRoutes[0];
        if (firstRoute?.segmentGeometries) {
          // segmentGeometries from backend are raw OSRM [lng, lat] — MapComponent normalizes them
          const segs = firstRoute.segmentGeometries as [number, number][][];
          setSegmentGeometries(segs);
        }

        const geoCoords = geoResult.status === 'fulfilled' ? geoResult.value : [];
        const validCoords = geoCoords.filter(Boolean) as LatLng[];

        if (validCoords.length >= 2) {
          const newStops: MapStop[] = [];
          validCoords.forEach((coord, idx) => {
            const isStart = idx === 0;
            const isDest = idx === validCoords.length - 1;
            const isIntermediate = !isStart && !isDest;

            newStops.push({
              label: isStart
                ? (source || 'Start')
                : isDest
                  ? (destination || 'Destination')
                  : `Stop ${idx}: ${allWaypoints[idx]}`,
              position: [coord.lat, coord.lng],
              type: isStart ? 'start' : isDest ? 'destination' : 'stop',
            });
          });
          setMapStops(newStops);
        }
      } else {
        setError(getConnectionStateMessage(connState) || 'Could not connect to the backend. Please try again.');
      }

      if (geoResult.status === 'rejected') {
        setGeoError('Could not geocode one or more locations.');
      }
    } catch (err) {
      console.error('LiveMap: handleSearch error', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectRoute = (routeId: string) => {
    setSelectedRoute(routeId);
    if (navigationMode) {
      const route = routes.find((r) => r.id === routeId);
      if (route?.segmentGeometries) {
        const segs = (route.segmentGeometries as [number, number][][]).map((geom) =>
          normalizeCoordinates(geom)
        );
        setSegmentGeometries(segs);
      }
    }
  };

  const activeRoute = routes.find((r) => r.id === selectedRoute);
  const insights = recommended?.insights;
  const currentInstruction = voiceInstructions[currentStepIndex];
  const totalSteps = voiceInstructions.length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1200px] mx-auto">
      <motion.div variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">AI Route Optimizer</h1>
        <p className="text-gray-500 font-medium">Compare routes, analyze trade-offs, and let AI pick the best option</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
        {/* ── LEFT PANEL ── */}
        <div className="space-y-5">
          <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-5">Plan Your Journey</h3>

            {/* Origin */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} strokeWidth={2.5} className="text-blue-600" />
              </div>
              <input
                value={source}
                onChange={(e) => { setSource(e.target.value); setSourceCoords(null); setRoutes([]); setSelectedRoute(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter origin (e.g. Andheri / अंधेरी)"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Use Current Location Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUseCurrentLocation}
              className="ml-12 mt-2 mb-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Locate size={12} strokeWidth={2.5} />
              Use Current Location
            </motion.button>

            {/* Connector + Swap */}
            <div className="flex items-center justify-between pl-4 h-8 relative">
              <div className="border-l-2 border-dashed border-gray-200 h-full" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={handleSwap}
                className="w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ArrowUpDown size={13} strokeWidth={2.5} className="text-gray-500" />
              </motion.button>
            </div>

            {/* Intermediate Stops */}
            {stops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-3 mb-1 mt-1">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                  <Navigation size={13} strokeWidth={2.5} className="text-purple-500" />
                </div>
                <input
                  value={stop}
                  onChange={(e) => updateStop(idx, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Stop ${idx + 1} (e.g. Dadar / दादर)`}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeStop(idx)}
                  className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                >
                  <X size={12} className="text-red-500" />
                </motion.button>
              </div>
            ))}

            {/* Destination */}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <Flag size={15} strokeWidth={2.5} className="text-red-500" />
              </div>
              <input
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setRoutes([]); setSelectedRoute(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Enter destination (e.g. BKC)"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Add Stop Button */}
            {stops.length < 3 && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={addStop}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs font-semibold hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add Stop (A → B → C → D)
              </motion.button>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={loading}
              className="w-full mt-5 py-3.5 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:bg-[#234d38] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {connState === 'retrying' || connState === 'waking'
                    ? getConnectionStateMessage(connState)
                    : 'Analyzing routes…'}
                </>
              ) : (
                <>
                  <BarChart3 size={16} />
                  Analyze Routes
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Navigation Control Panel */}
          {routes.length > 0 && selectedRoute && (
            <motion.div variants={fadeUp} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Navigation size={14} className="text-[#1b3a2a]" />
                  Navigation
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`p-1.5 rounded-lg transition-colors ${voiceEnabled ? 'bg-[#1b3a2a] text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                </div>
              </div>

              {!navigationMode ? (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startNavigation}
                  className="w-full py-3 bg-[#1b3a2a] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#234d38] transition-all"
                >
                  <Play size={14} />
                  Start Journey
                </motion.button>
              ) : (
                <div className="space-y-3">
                  {currentInstruction && (
                    <div className="p-3 bg-[#1b3a2a]/5 rounded-xl border border-[#1b3a2a]/10">
                      <div className="flex items-center gap-2 mb-1">
                        <LocateFixed size={12} className="text-[#1b3a2a] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#1b3a2a] uppercase tracking-wider">
                          Step {currentStepIndex + 1} of {totalSteps}
                          {isSpeaking && <span className="ml-1 text-[#c5f02c]">● Speaking</span>}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{currentInstruction.text}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{currentInstruction.distance}</span>
                        <span className="text-xs text-gray-500">~{currentInstruction.duration} min</span>
                      </div>
                    </div>
                  )}

                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {voiceInstructions.map((instr, idx) => (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          idx === currentStepIndex
                            ? 'bg-[#1b3a2a] text-white'
                            : idx < currentStepIndex
                              ? 'bg-gray-50 text-gray-400 line-through'
                              : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {idx + 1}. {instr.text}
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={stopNavigation}
                    className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-all"
                  >
                    <Square size={14} />
                    Stop Navigation
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="bg-[#1b3a2a] rounded-[28px] p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#c5f02c]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5f02c]">AI Decision Engine</span>
              </div>
              <h4 className="font-bold text-sm mb-1">Smart Route Analysis</h4>
              <p className="text-white/60 text-xs font-medium leading-relaxed">
                Our AI evaluates multiple route options using real-time traffic, distance, and cost data to recommend the optimal choice.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-6 overflow-y-auto pr-2" style={{ scrollBehavior: 'smooth', maxHeight: 'calc(100vh - 140px)' }}>
          <motion.div variants={fadeUp} className="w-full" style={{ height: 420 }}>
            <MapComponent
              routes={mapRoutes}
              selectedRouteId={selectedRoute || undefined}
              sourceLabel={source}
              destinationLabel={destination}
              stops={mapStops}
              userLocation={userLocation}
              navigationMode={navigationMode}
              segmentGeometries={segmentGeometries}
              currentSegmentIndex={currentSegmentIndex}
              onUserLocationChange={handleUserLocationChange}
            />
          </motion.div>

          {geoError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-700">{geoError}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1b3a2a]/10 flex items-center justify-center">
                  <Loader2 size={24} className="text-[#1b3a2a] animate-spin" />
                </div>
                <p className="text-gray-500 font-medium text-sm">
                  {connState === 'retrying' || connState === 'waking'
                    ? getConnectionStateMessage(connState)
                    : 'Connecting...'}
                </p>
              </motion.div>
            )}

            {!loading && routes.length > 0 && (
              <motion.div key="results" variants={stagger} initial="hidden" animate="show" className="space-y-5">
                {/* Results Header */}
                <motion.div variants={fadeUp} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    <span className="font-bold text-gray-900">{routes.length}</span> routes analyzed
                    <span className="ml-2 text-gray-400">· ~{distanceKm} km corridor</span>
                    {waypoints.length > 2 && (
                      <span className="ml-2 text-purple-600 font-semibold">· {waypoints.length} stops</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600">Live</span>
                  </div>
                </motion.div>

                {/* AI Insight Banner */}
                {insights && (
                  <motion.div variants={fadeUp} className="bg-gradient-to-r from-[#1b3a2a] to-[#2c5f45] rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-[#c5f02c]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#c5f02c]">AI Recommendation</span>
                    </div>
                    <p className="text-sm font-medium text-white/90 leading-relaxed mb-3">{recommended?.explanation}</p>
                    <div className="flex flex-wrap gap-2">
                      {insights.timeSaved > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                          <TrendingDown size={11} className="text-[#c5f02c]" />
                          Saves {insights.timeSaved} min
                        </span>
                      )}
                      {insights.costSaved > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                          <Wallet size={11} className="text-[#c5f02c]" />
                          ₹{insights.costSaved} cheaper
                        </span>
                      )}
                      {insights.avoidedTraffic && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                          <Gauge size={11} className="text-[#c5f02c]" />
                          Avoids heavy traffic
                        </span>
                      )}
                      {insights.predictedDelay > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                          <AlertTriangle size={11} className="text-[#c5f02c]" />
                          +{insights.predictedDelay} min delay avoided
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Route Summary Cards — equal-width grid */}
                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
                  {routes.map((route) => {
                    const cfg = routeTypeConfig[route.type] || routeTypeConfig.comfort;
                    const isSelected = route.id === selectedRoute;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={route.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectRoute(route.id)}
                        className={`rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 ${
                          isSelected
                            ? 'border-2 border-[#1b3a2a]/30 bg-white shadow-lg ring-1 ring-[#1b3a2a]/10'
                            : 'border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                          <Icon size={13} className={isSelected ? 'text-[#1b3a2a]' : 'text-gray-400'} />
                          <span className="text-sm font-bold text-gray-900">{cfg.label}</span>
                          {isSelected && (
                            <span className="text-[9px] font-bold bg-[#1b3a2a] text-white px-1.5 py-0.5 rounded ml-auto">Active</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 tabular-nums">{route.durationMin}</span>
                            <span className="text-xs font-medium text-gray-400">min</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                            <span className="font-semibold">₹{route.estimatedCost}</span>
                            <span>{route.distanceKm} km</span>
                          </div>
                        </div>
                        <ResourceFlow resources={route.resources || []} compact />
                        <div className="flex items-center gap-1 mt-auto pt-2 border-t border-gray-50">
                          <Shield size={10} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600">{route.confidence}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Detailed Route Cards */}
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={route.id === selectedRoute}
                    onSelect={() => handleSelectRoute(route.id)}
                  />
                ))}

                {/* Selected Route Analysis Panel */}
                {activeRoute && (
                  <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-base text-gray-900 mb-5 flex items-center gap-2">
                      <BarChart3 size={16} className="text-[#1b3a2a]" />
                      Route Analysis — {routeTypeConfig[activeRoute.type]?.label || activeRoute.type}
                    </h4>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{activeRoute.durationMin} <span className="text-sm font-medium text-gray-400">min</span></p>
                        {activeRoute.predictedDelay > 0 && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">+{activeRoute.predictedDelay} min peak</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Distance</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{activeRoute.distanceKm} <span className="text-sm font-medium text-gray-400">km</span></p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">₹{activeRoute.estimatedCost}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Gauge size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Traffic</span>
                        </div>
                        {(() => {
                          const tc = trafficConfig[activeRoute.trafficLevel] || trafficConfig.medium;
                          return (
                            <>
                              <p className={`text-base font-bold ${tc.color}`}>{tc.label}</p>
                              {activeRoute.trafficLevel === 'high' && (
                                <p className="text-xs text-red-500 mt-1 font-medium">Expect delays</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Transport Mix</p>
                      <ResourceFlow resources={activeRoute.resources || []} />
                    </div>

                    <div className="mt-4 flex items-center gap-5 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <Shield size={13} className="text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-600">{activeRoute.confidence}%</span>
                        <span className="text-xs text-gray-400">AI confidence</span>
                      </div>
                      {activeRoute.transfers > 0 && (
                        <div className="flex items-center gap-1.5">
                          <ArrowUpDown size={13} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">{activeRoute.transfers} transfer{activeRoute.transfers > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {!loading && routes.length === 0 && !error && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                  <BarChart3 size={24} className="text-gray-300" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">No routes analyzed</h4>
                <p className="text-sm text-gray-400 font-medium">Enter origin and destination to compare AI-optimized routes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveMapScreen;
