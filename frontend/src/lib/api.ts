const BASE_URL = 'http://localhost:5000/api';

export interface RouteResource {
  type: 'walk' | 'metro' | 'bus' | 'train' | 'cab' | 'auto';
  duration: number;
  label: string;
}

export interface RouteStep {
  mode: 'walk' | 'metro' | 'bus' | 'train' | 'cab' | 'auto';
  label: string;
  duration: number;
  distance: string;
  cost: number;
  delay?: number;
}

export interface BackendRoute {
  id: string;
  type: 'fastest' | 'cheapest' | 'comfort';
  label: string;
  durationMin: number;
  totalTime: number;
  estimatedCost: number;
  confidence: number;
  transfers: number;
  tags: string[];
  trafficLevel: "low" | "medium" | "high";
  predictedDelay: number;
  geometry: [number, number][];
  distanceKm: number;
  resources: RouteResource[];
  steps: RouteStep[];
}

export interface AIRecommendation {
  routeId: string;
  savedTime: number;
  confidence: number;
  explanation: string;
  insights: {
    timeSaved: number;
    costSaved: number;
    avoidedTraffic: boolean;
    predictedDelay: number;
  };
}

export interface RoutePlanResponse {
  source: string;
  destination: string;
  distanceKm: number;
  generatedAt?: string;
  routes: BackendRoute[];
  recommended: AIRecommendation;
}

export async function planRoute(source: string, destination: string, preferences?: { speed: number; cost: number; comfort: number }): Promise<RoutePlanResponse> {
  const res = await fetch(`${BASE_URL}/route/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, destination, preferences }),
  });
  if (!res.ok) throw new Error(`planRoute failed: ${res.status}`);
  const data = await res.json();
  return data as RoutePlanResponse;
}

export async function simulateDisruption(delay: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/disruption/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delay }),
  });
  if (!res.ok) throw new Error(`simulateDisruption failed: ${res.status}`);
  return res.json();
}

export async function simulateDisruptionByMode(mode: 'train' | 'bus' | 'metro'): Promise<any> {
  const res = await fetch(`${BASE_URL}/disruption/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`simulateDisruptionByMode failed: ${res.status}`);
  return res.json();
}

export interface DisruptionStep {
  mode: string;
  label: string;
  duration: number;
  distance: string;
  cost: number;
  delayMinutes: number;
  impactLevel: string;
  time?: number;
}

export interface SwitchOption {
  mode: string;
  reason: string;
  estimatedTimeMin: number;
}

export interface LastMileOption {
  mode: string;
  time: number;
  cost: number;
}

export interface DisruptionSummary {
  totalDelay: number;
  affectedStepsCount: number;
  originalTime: number;
  newTime: number;
}

export interface DisruptedRoute {
  steps: DisruptionStep[];
  totalTime: number;
  totalDelay: number;
  distanceKm?: number;
  geometry?: [number, number][];
  type?: string;
  id?: string;
  label?: string;
  estimatedCost?: number;
}

export interface DisruptionResponse {
  alert: string;
  issueType?: string;
  source: string;
  destination: string;
  currentLocation?: string;
  disruptedRoute: DisruptedRoute;
  disruptedSteps: DisruptionStep[];
  switchOptions: SwitchOption[];
  lastMile: LastMileOption[];
  summary: DisruptionSummary;
}

export async function handleDisruption(input: {
  source: string;
  destination: string;
  currentLocation?: string;
  issueType?: string;
  preferences?: { speed: number; cost: number; comfort: number };
}): Promise<DisruptionResponse> {
  const res = await fetch(`${BASE_URL}/disruption`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`handleDisruption failed: ${res.status}`);
  return res.json();
}

export async function getAllRoutes(): Promise<any[]> {
  const res = await fetch(`${BASE_URL}/routes`);
  if (!res.ok) throw new Error(`getAllRoutes failed: ${res.status}`);
  return res.json();
}
