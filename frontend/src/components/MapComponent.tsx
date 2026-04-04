import { useEffect, useRef, useState } from 'react';
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

const greenIcon = new L.Icon({
  iconUrl: `${BASE_MARKER}/marker-icon-2x-green.png`,
  shadowUrl: SHADOW,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

const orangeIcon = new L.Icon({
  iconUrl: `${BASE_MARKER}/marker-icon-2x-orange.png`,
  shadowUrl: SHADOW,
  iconSize: ICON_SIZE,
  iconAnchor: ICON_ANCHOR,
  shadowSize: SHADOW_SIZE,
});

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.5);z-index:2;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:rgba(59,130,246,0.2);border-radius:50%;animation:userPulse 2s ease-in-out infinite;z-index:1;"></div>
    </div>
    <style>@keyframes userPulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.6}50%{transform:translate(-50%,-50%) scale(1.4);opacity:0.2}}</style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export interface LatLng { lat: number; lng: number; }

export interface MapRoute {
  id: string;
  type: 'fastest' | 'cheapest' | 'comfort';
  color: string;
  positions: [number, number][];
}

export interface MapStop {
  label: string;
  position: [number, number];
  icon?: L.Icon<L.IconOptions>;
  type?: 'start' | 'stop' | 'destination';
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface MapComponentProps {
  routes: MapRoute[];
  selectedRouteId?: string;
  sourceLabel?: string;
  destinationLabel?: string;
  stops?: MapStop[];
  userLocation?: UserLocation | null;
  navigationMode?: boolean;
  segmentGeometries?: [number, number][][];
  currentSegmentIndex?: number;
  onUserLocationChange?: (loc: UserLocation) => void;
}

/**
 * Converts OSRM raw [lng, lat] coordinates to Leaflet [lat, lng] format.
 * OSRM GeoJSON uses [longitude, latitude] per spec.
 * Leaflet Polyline/Marker expects [latitude, longitude].
 *
 * Detection heuristic: if first coord's x-value > 50, it's a longitude (e.g. Mumbai lng ≈ 72.8).
 * Mumbai latitude ≈ 19 (< 50), longitude ≈ 72.8 (> 50).
 */
export function normalizeCoordinates(raw: [number, number][]): [number, number][] {
  if (!raw || raw.length === 0) return [];
  const [first] = raw;
  // If first element looks like a longitude (> 50), swap to [lat, lng] for Leaflet
  const isLngFirst = Math.abs(first[0]) > 50;
  if (isLngFirst) {
    return raw.map(([lng, lat]) => [lat, lng]);
  }
  // Already in [lat, lng] format
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

function UserLocationTracker({ onUserLocationChange }: {
  onUserLocationChange?: (loc: UserLocation) => void;
}) {
  const map = useMap();
  const watchIdRef = useRef<number | null>(null);
  const onUserLocationChangeRef = useRef(onUserLocationChange);

  useEffect(() => {
    onUserLocationChangeRef.current = onUserLocationChange;
  }, [onUserLocationChange]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        onUserLocationChangeRef.current?.(loc);
        map.flyTo([loc.lat, loc.lng], 14, { animate: true, duration: 0.6 });
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [map]);

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
  stops = [],
  userLocation = null,
  navigationMode = false,
  segmentGeometries,
  currentSegmentIndex = 0,
  onUserLocationChange,
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
        <UserLocationTracker
          onUserLocationChange={onUserLocationChange}
        />

        {segmentGeometries && segmentGeometries.length > 0
          ? segmentGeometries.map((geom, idx) => {
              // normalizeCoordinates converts OSRM [lng,lat] → Leaflet [lat,lng]
              const normalized = normalizeCoordinates(geom);
              console.log(`Segment ${idx} normalized coords (first 3):`, normalized.slice(0, 3));
              if (normalized.length < 2) return null;
              const isActive = navigationMode && idx === currentSegmentIndex;
              const isPast = navigationMode && idx < currentSegmentIndex;
              return (
                <Polyline
                  key={`segment-${idx}`}
                  positions={normalized}
                  pathOptions={{
                    color: isPast ? '#94a3b8' : isActive ? '#22c55e' : '#94a3b8',
                    weight: isActive ? 6 : 3,
                    opacity: isPast ? 0.25 : isActive ? 1 : 0.4,
                    dashArray: isActive ? undefined : '6,6',
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              );
            })
          : [...(routes || [])]
              .sort((a, b) =>
                a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0
              )
              .map((route) => {
                if (!route || !route.positions || route.positions.length < 2) return null;
                const isSelected = route.id === selectedRouteId;
                const routeColor = TYPE_COLORS[route.type] || route.color || '#888';
                console.log(`Route ${route.id} positions (first 3):`, route.positions.slice(0, 3));

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

        {stops.length > 0
          ? stops.map((stop, idx) => {
              let icon: L.Icon<L.IconOptions> = orangeIcon;
              if (stop.type === 'start') icon = blueIcon;
              else if (stop.type === 'destination') icon = redIcon;
              else if (stop.icon) icon = stop.icon;

              return (
                <Marker key={`stop-${idx}`} position={stop.position} icon={icon}>
                  <Popup>
                    <div className="text-sm font-semibold">{stop.label}</div>
                  </Popup>
                </Marker>
              );
            })
          : (
              <>
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
              </>
            )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-sm font-semibold">You are here</div>
              {userLocation.accuracy && (
                <div className="text-xs text-gray-500 mt-1">
                  Accuracy: {Math.round(userLocation.accuracy)}m
                </div>
              )}
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
