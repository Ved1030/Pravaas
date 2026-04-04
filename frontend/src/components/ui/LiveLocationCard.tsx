import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, WifiOff, Crosshair, Maximize2 } from 'lucide-react';
import L from 'leaflet';

// Fix Vite broken icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Shared session key — LiveMapScreen reads this
export const LIVE_LOCATION_KEY = 'riq_live_location';

// Types
interface LocationState {
  lat: number;
  lng: number;
  accuracy: number;
  address: string;
  area: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface Props {
  onNavigate: (screen: string) => void;
}

type LiveLocationPayload = {
  lat: number;
  lng: number;
  area: string;
  address?: string;
  accuracy?: number;
  timestamp: number;
};

// Pulsing blue dot divIcon
const buildPulsingIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div class="riq-dot-wrap">
        <div class="riq-ring"></div>
        <div class="riq-core"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

// Nominatim reverse geocode
async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; area: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const a = data.address ?? {};
    const street = a.road ?? a.pedestrian ?? '';
    const area = a.suburb ?? a.neighbourhood ?? a.city_district ?? a.town ?? a.city ?? 'Unknown area';
    const city = a.city ?? a.town ?? '';
    const address = [street, city].filter(Boolean).join(', ') || area;
    return { address, area };
  } catch {
    return { address: 'Location found', area: 'Current position' };
  }
}

// Framer variants
const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// Component
const LiveLocationCard = ({ onNavigate }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [location, setLocation] = useState<LocationState | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [hovering, setHovering] = useState(false);

  const persistLiveLocation = useCallback((payload: LiveLocationPayload) => {
    sessionStorage.setItem(LIVE_LOCATION_KEY, JSON.stringify(payload));
  }, []);

  // Build mini-map (all interaction disabled — preview only)
  const buildMap = useCallback((lat: number, lng: number, accuracy: number) => {
    if (!containerRef.current) return;

    mapRef.current?.remove();
    mapRef.current = null;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      boxZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Accuracy ring
    L.circle([lat, lng], {
      radius: Math.min(accuracy, 120),
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4 4',
    }).addTo(map);

    // Pulsing marker
    L.marker([lat, lng], { icon: buildPulsingIcon() }).addTo(map);

    mapRef.current = map;
  }, []);

  // Click handler: save coords → navigate to LiveMapScreen
  const handleOpenMap = useCallback(() => {
    if (!location) return;

    persistLiveLocation({
      lat: location.lat,
      lng: location.lng,
      area: location.area,
      address: location.address,
      accuracy: location.accuracy,
      timestamp: Date.now(),
    });

    onNavigate('map');
  }, [location, onNavigate, persistLiveLocation]);

  // Fetch GPS position
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        const [geo] = await Promise.all([
          reverseGeocode(latitude, longitude),
          Promise.resolve(buildMap(latitude, longitude, accuracy)),
        ]);

        const loc: LocationState = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          address: geo.address,
          area: geo.area,
        };

        setLocation(loc);
        setStatus('success');

        persistLiveLocation({
          lat: latitude,
          lng: longitude,
          area: geo.area,
          address: geo.address,
          accuracy: Math.round(accuracy),
          timestamp: Date.now(),
        });
      },
      (err) => {
        const msg: Record<number, string> = {
          1: 'Location access denied. Please allow it in browser settings.',
          2: 'Position unavailable. Please try again.',
          3: 'Location request timed out.',
        };
        setErrorMsg(msg[err.code] ?? 'Could not fetch location.');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
    );
  }, [buildMap, persistLiveLocation]);

  useEffect(() => {
    fetchLocation();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [fetchLocation]);

  const isLoading = status === 'idle' || status === 'loading';
  const isError = status === 'error';
  const isSuccess = status === 'success';
  const isClickable = isSuccess && !!location;

  return (
    <>
      <style>{`
        .riq-dot-wrap { position:relative; width:24px; height:24px; }
        .riq-ring {
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:24px; height:24px; border-radius:50%;
          background:rgba(59,130,246,0.35);
          animation:riq-pulse 1.8s ease-out infinite;
        }
        .riq-core {
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:12px; height:12px; border-radius:50%;
          background:#3b82f6; border:2.5px solid #fff;
          box-shadow:0 2px 10px rgba(59,130,246,0.55);
        }
        @keyframes riq-pulse {
          0%   { transform:translate(-50%,-50%) scale(0.7); opacity:1; }
          100% { transform:translate(-50%,-50%) scale(2.6); opacity:0; }
        }
        .leaflet-control-attribution { display:none!important; }
      `}</style>

      <motion.div
        variants={fadeUp}
        className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-gray-100"
      >
        <div
          className={`relative h-[190px] bg-gray-50 select-none ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={isClickable ? handleOpenMap : undefined}
          onMouseEnter={() => isClickable && setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ opacity: isSuccess ? 1 : 0, transition: 'opacity 0.45s ease' }}
          />

          {isClickable && (
            <motion.div
              initial={false}
              animate={{ opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none"
              style={{
                background: 'rgba(10,15,46,0.48)',
                backdropFilter: 'blur(2px)',
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={hovering ? { scale: 1.08 } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className="w-12 h-12 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center"
                >
                  <Maximize2 size={20} className="text-white" />
                </motion.div>
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">
                  Open Full Map
                </span>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-gray-50 gap-3">
              <div className="relative w-10 h-10">
                <div className="w-10 h-10 rounded-full border-2 border-gray-100" />
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Finding location…
              </p>
            </div>
          )}

          {isError && (
            <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-gray-50 gap-3 px-6 text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <WifiOff size={18} className="text-red-400" />
              </div>
              <p className="text-xs font-medium text-gray-500 leading-snug">{errorMsg}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchLocation();
                }}
                className="text-[11px] font-bold text-blue-500 hover:text-blue-600 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {isSuccess && (
            <div className="absolute top-3 left-3 z-[500] pointer-events-none flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live</span>
            </div>
          )}

          {isSuccess && (
            <div className="absolute top-3 right-3 z-[500] pointer-events-none">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border shadow-sm transition-all duration-200"
                style={{
                  background: hovering ? 'rgba(59,130,246,0.9)' : 'rgba(255,255,255,0.9)',
                  borderColor: hovering ? 'rgba(59,130,246,0.4)' : 'rgba(229,231,235,1)',
                }}
              >
                <Maximize2 size={12} style={{ color: hovering ? '#fff' : '#9ca3af' }} />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-[400]" />
        </div>

        <div
          className={`px-5 pt-3 pb-5 ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={isClickable ? handleOpenMap : undefined}
          onMouseEnter={() => isClickable && setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={15} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Current Location
                </p>

                {isLoading && (
                  <div className="space-y-1.5 mt-1">
                    <div className="h-3.5 w-32 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                )}

                {isError && <p className="text-sm font-bold text-gray-400">Unavailable</p>}

                {isSuccess && location && (
                  <>
                    <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                      {location.area}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-tight">
                      {location.address}
                    </p>
                    <p className="text-[10px] font-mono text-gray-300 mt-1">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchLocation();
              }}
              disabled={isLoading}
              title="Refresh location"
              className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center
                         hover:bg-blue-50 hover:border-blue-100 transition-colors flex-shrink-0 mt-0.5
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw size={13} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {isSuccess && location && (
            <div className="mt-3 flex items-center gap-1.5">
              <Crosshair size={11} className="text-gray-300" />
              <span className="text-[10px] font-semibold text-gray-400">
                GPS active · ±{location.accuracy}m accuracy
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default LiveLocationCard;