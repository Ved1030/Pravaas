import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const BASE_MARKER = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img';
const SHADOW = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';
const ICON_SIZE: [number, number] = [25, 41];
const ICON_ANCHOR: [number, number] = [12, 41];
const SHADOW_SIZE: [number, number] = [41, 41];

const blueIcon = new L.Icon({
  iconUrl: `${BASE_MARKER}/marker-icon-2x-blue.png`,
  shadowUrl: SHADOW,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

const redIcon = new L.Icon({
  iconUrl: `${BASE_MARKER}/marker-icon-2x-red.png`,
  shadowUrl: SHADOW,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

export interface LatLng { lat: number; lng: number; }

export interface MapRoute {
  id: string;
  type: 'fastest' | 'cheapest' | 'comfort';
  color: string;
  positions: [number, number][];
}

interface MapComponentProps {
  routes: MapRoute[];
  selectedRouteId?: string;
  sourceLabel?: string;
  destinationLabel?: string;
}

export function normalizeCoordinates(raw: [number, number][]): [number, number][] {
  if (!raw || raw.length === 0) return [];
  const [first] = raw;
  const needsSwap = Math.abs(first[0]) > 50;
  if (needsSwap) {
    return raw.map(([a, b]) => [b, a]);
  }
  return raw;
}

function FlyToMarkers({ allPositions }: { allPositions: [number, number][] }) {
  const map = useMap();
  const prevKey = useRef('');

  useEffect(() => {
    const key = allPositions.map((p) => p.join(',')).join('|');
    if (key === prevKey.current || allPositions.length === 0) return;
    prevKey.current = key;
    const bounds = L.latLngBounds(allPositions);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [allPositions, map]);

  return null;
}

const TYPE_COLORS: Record<string, string> = {
  fastest: '#22c55e',
  cheapest: '#3b82f6',
  comfort: '#f97316',
};

const MUMBAI: [number, number] = [19.076, 72.8777];

export default function MapComponent({
  routes,
  selectedRouteId,
  sourceLabel,
  destinationLabel,
}: MapComponentProps) {
  const allPositions = (routes || []).flatMap((r) => r?.positions || []);
  const selectedRoute = (routes || []).find((r) => r.id === selectedRouteId);
  const fallbackRoute = (routes || [])[0];
  const activeRoute = selectedRoute || fallbackRoute;

  const startPos = activeRoute?.positions?.[0]
    ? { lat: activeRoute.positions[0][0], lng: activeRoute.positions[0][1] }
    : null;
  const endPos = activeRoute?.positions?.[activeRoute.positions.length - 1]
    ? { lat: activeRoute.positions[activeRoute.positions.length - 1][0], lng: activeRoute.positions[activeRoute.positions.length - 1][1] }
    : null;

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-[24px] overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={MUMBAI}
        zoom={12}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToMarkers allPositions={allPositions} />

        {[...(routes || [])]
          .sort((a, b) =>
            a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0
          )
          .map((route) => {
            if (!route || !route.positions || route.positions.length === 0) return null;
            const isSelected = route.id === selectedRouteId;
            const routeColor = TYPE_COLORS[route.type] || route.color || '#888';

            return (
              <Polyline
                key={route.id}
                positions={route.positions}
                pathOptions={{
                  color: isSelected ? routeColor : '#94a3b8',
                  weight: isSelected ? 6 : 2,
                  opacity: isSelected ? 1 : 0.35,
                  dashArray: isSelected ? undefined : '6,6',
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            );
          })}

        {startPos && (
          <Marker position={[startPos.lat, startPos.lng]} icon={blueIcon}>
            <Popup>
              <div className="text-sm font-semibold">
                Start: {sourceLabel || 'Origin'}
              </div>
            </Popup>
          </Marker>
        )}

        {endPos && (
          <Marker position={[endPos.lat, endPos.lng]} icon={redIcon}>
            <Popup>
              <div className="text-sm font-semibold">
                Destination: {destinationLabel || 'Destination'}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {(routes || []).length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Routes</p>
          {Object.entries(TYPE_COLORS).map(([type, color]) => {
            const route = (routes || []).find((r) => r.type === type);
            const isSelected = route?.id === selectedRouteId;
            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-5 h-1.5 rounded-full"
                  style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.35 }}
                />
                <span className="text-xs font-semibold text-gray-700 capitalize">{type}</span>
                {isSelected && <span className="text-[9px] font-bold bg-[#1b3a2a] text-white px-1 py-0.5 rounded">Active</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
