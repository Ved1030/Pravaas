import type { NotificationsResponse } from './types';
import { apiGet, apiPost, checkBackendHealth, onConnectionStateChange, getConnectionState } from '@/services/api';

export { checkBackendHealth, onConnectionStateChange, getConnectionState };

export interface RouteResource {
  type: 'walk' | 'metro' | 'bus' | 'train' | 'cab' | 'auto';
  duration: number;
  label: string;
}

export interface RouteStep {
  mode: 'walk' | 'metro' | 'bus' | 'train' | 'cab' | 'auto' | 'drive';
  label: string;
  duration: number;
  distance: string;
  cost: number;
  delay?: number;
  instruction?: string;
  voiceText?: string;
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
  segmentGeometries?: [number, number][][];
  stopCoordinates?: { from: { lat: number; lng: number }; to: { lat: number; lng: number } }[];
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
  waypoints?: string[];
  stopLabels?: string[];
}

export async function planRoute(source: string, destination: string, preferences?: { speed: number; cost: number; comfort: number }, stops?: string[], sourceCoords?: { lat: number; lng: number }): Promise<RoutePlanResponse> {
  return apiPost('/route/plan', { source, destination, preferences, stops, sourceCoords });
}

export async function simulateDisruption(delay: number): Promise<any> {
  return apiPost('/disruption/simulate', { delay });
}

export async function simulateDisruptionByMode(mode: 'train' | 'bus' | 'metro'): Promise<any> {
  return apiPost('/disruption/simulate', { mode });
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

export interface SmartSwitch {
  mode: string;
  label: string;
  timeSaved: number;
  costSaved: number;
  confidence: number;
  reason: string;
  alternativeRoute: any;
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
  smartSwitch?: SmartSwitch | null;
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
  return apiPost('/disruption', input);
}

export async function getAllRoutes(): Promise<any[]> {
  return apiGet('/routes');
}

export interface VoiceInstruction {
  stepIndex: number;
  text: string;
  audio: string;
  mode: string;
  distance: string;
  duration: number;
}

export async function getVoiceInstructions(route: BackendRoute): Promise<{ instructions: VoiceInstruction[] }> {
  return apiPost('/voice/instructions', { route });
}

export async function getNotifications(lat: number, lng: number, radius?: number): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius) params.append('radius', String(radius));
  return apiGet(`/notifications?${params.toString()}`);
}
