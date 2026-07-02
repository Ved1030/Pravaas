import type { NotificationsResponse, LiveTracking, EmergencyEvent, SafetyAlert, SafetyScore, SafeRouteResponse, SmartNotification, JourneySummaryData, VoiceCommand, SharedRoute, TrustedContact, AccessibilitySettings, JourneyHealthScore } from './types';
import { apiGet, apiPost, checkBackendHealth, onConnectionStateChange, getConnectionState, getConnectionStateMessage } from '@/services/api';
export type { ConnectionState } from '@/services/api';

export { checkBackendHealth, onConnectionStateChange, getConnectionState, getConnectionStateMessage };

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
  trafficLevel: 'low' | 'medium' | 'high';
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

export async function aiRecommendRoute(source: string, destination: string, preferences?: { speed: number; cost: number; comfort: number }, stops?: string[]): Promise<any> {
  return apiPost('/ai/recommend-route', { source, destination, preferences, stops });
}

export async function aiLeaveTime(source: string, destination: string, preferences?: { speed: number; cost: number; comfort: number }, stops?: string[]): Promise<any> {
  return apiPost('/ai/leave-time', { source, destination, preferences, stops });
}

export async function aiGetWeather(): Promise<any> {
  return apiGet('/ai/weather');
}

export async function aiGetCrowd(mode?: string, location?: string): Promise<any> {
  const params = new URLSearchParams();
  if (mode) params.append('mode', mode);
  if (location) params.append('location', location);
  return apiGet(`/ai/crowd?${params.toString()}`);
}

export async function aiCompare(source: string, destination: string, preferences?: { speed: number; cost: number; comfort: number }, stops?: string[]): Promise<any> {
  return apiPost('/ai/compare', { source, destination, preferences, stops });
}

export async function aiAnalyze(route: any): Promise<any> {
  return apiPost('/ai/analyze', { route });
}

export async function getNotifications(lat: number, lng: number, radius?: number): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius) params.append('radius', String(radius));
  return apiGet(`/notifications?${params.toString()}`);
}

// === PHASE 2 API FUNCTIONS ===

// Journey Tracking
export async function startJourney(routeData: any): Promise<LiveTracking> {
  return apiPost('/journey/start', routeData);
}

export async function endJourney(trackingId: string): Promise<LiveTracking> {
  return apiPost('/journey/end', { trackingId });
}

export async function updateJourneyProgress(trackingId: string, currentStageIndex: number): Promise<LiveTracking> {
  return apiPost('/journey/progress', { trackingId, currentStageIndex });
}

export async function getLiveTracking(trackingId: string): Promise<LiveTracking> {
  const params = new URLSearchParams({ trackingId });
  return apiGet(`/journey/live?${params.toString()}`);
}

export async function getUserTracking(userId: string): Promise<LiveTracking[]> {
  const params = new URLSearchParams({ userId });
  return apiGet(`/journey/user?${params.toString()}`);
}

// Emergency
export async function createEmergency(data: { location: any; journeyDetails?: any; contacts?: string[] }): Promise<EmergencyEvent> {
  return apiPost('/emergency', data);
}

export async function resolveEmergency(emergencyId: string): Promise<EmergencyEvent> {
  return apiPost('/emergency/resolve', { emergencyId });
}

export async function getEmergency(emergencyId: string): Promise<EmergencyEvent> {
  const params = new URLSearchParams({ id: emergencyId });
  return apiGet(`/emergency?${params.toString()}`);
}

// Safety
export async function getSafetyAlerts(lat: number, lng: number, radius?: number): Promise<SafetyAlert[]> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (radius) params.append('radius', String(radius));
  return apiGet(`/safety/alerts?${params.toString()}`);
}

export async function getSafetyScore(route: any, womenSafeMode: boolean): Promise<SafetyScore> {
  return apiPost('/safety/score', { route, womenSafeMode });
}

export async function getSafeRoute(route: any, womenSafeMode: boolean): Promise<SafeRouteResponse> {
  return apiPost('/safety/safe-route', { route, womenSafeMode });
}

// Notifications
export async function createNotification(notification: { type: string; title: string; message: string }): Promise<SmartNotification> {
  return apiPost('/notifications', notification);
}

export async function markNotificationRead(notificationId: string): Promise<SmartNotification> {
  return apiPost('/notifications/mark-read', { notificationId });
}

export async function generateNotifications(trackingId: string): Promise<SmartNotification[]> {
  return apiPost('/notifications/generate', { trackingId });
}

// Journey Summary
export async function getJourneySummary(summaryId: string): Promise<JourneySummaryData> {
  const params = new URLSearchParams({ id: summaryId });
  return apiGet(`/journey-summary?${params.toString()}`);
}

export async function getJourneySummaries(userId: string): Promise<JourneySummaryData[]> {
  const params = new URLSearchParams({ userId });
  return apiGet(`/journey-summary/all?${params.toString()}`);
}

export async function generateJourneySummary(trackingId: string): Promise<JourneySummaryData> {
  return apiPost('/journey-summary/generate', { trackingId });
}

// Voice
export async function processVoiceCommand(command: string, context?: any): Promise<VoiceCommand> {
  return apiPost('/voice/command', { command, context });
}

// Location Sharing
export async function createShareLink(journeyId: string): Promise<SharedRoute> {
  return apiPost('/share/create', { journeyId });
}

export async function getSharedJourney(shareCode: string): Promise<any> {
  return apiGet(`/share/${shareCode}`);
}

export async function stopSharing(shareCode: string): Promise<SharedRoute> {
  return apiPost('/share/stop', { shareCode });
}

// Accessibility
export async function getAccessibilitySettings(userId: string): Promise<AccessibilitySettings> {
  const params = new URLSearchParams({ userId });
  return apiGet(`/accessibility/settings?${params.toString()}`);
}

export async function updateAccessibilitySettings(userId: string, settings: AccessibilitySettings): Promise<AccessibilitySettings> {
  return apiPost('/accessibility/settings', { userId, settings });
}

// Trusted Contacts (local operations + backend sync)
export async function getTrustedContacts(userId: string): Promise<TrustedContact[]> {
  const stored = localStorage.getItem(`fc_contacts_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

export async function saveTrustedContact(userId: string, contact: TrustedContact): Promise<TrustedContact> {
  const stored = localStorage.getItem(`fc_contacts_${userId}`);
  const contacts: TrustedContact[] = stored ? JSON.parse(stored) : [];
  contact.id = contact.id || `contact_${Date.now()}`;
  const idx = contacts.findIndex(c => c.id === contact.id);
  if (idx >= 0) contacts[idx] = contact;
  else contacts.push(contact);
  localStorage.setItem(`fc_contacts_${userId}`, JSON.stringify(contacts));
  return contact;
}

export async function deleteTrustedContact(userId: string, contactId: string): Promise<boolean> {
  const stored = localStorage.getItem(`fc_contacts_${userId}`);
  if (!stored) return false;
  const contacts: TrustedContact[] = JSON.parse(stored);
  const filtered = contacts.filter(c => c.id !== contactId);
  localStorage.setItem(`fc_contacts_${userId}`, JSON.stringify(filtered));
  return true;
}

// Journey Health Score
export function calculateJourneyHealth(data: {
  safetyScore: number;
  comfortScore: number;
  weather?: number;
  traffic?: string;
  crowd?: string;
  walkingDistance?: number;
}): JourneyHealthScore {
  const weather = data.weather || 75;
  const trafficMap: Record<string, number> = { low: 90, medium: 65, high: 40 };
  const traffic = trafficMap[data.traffic || 'medium'] || 65;
  const crowdMap: Record<string, number> = { LOW: 85, MODERATE: 65, HIGH: 45 };
  const crowd = crowdMap[data.crowd || 'MODERATE'] || 65;
  const walking = data.walkingDistance ? Math.max(40, 100 - data.walkingDistance * 2) : 80;
  const stress = Math.round((traffic + (data.safetyScore || 50)) / 2);
  const overall = Math.round(
    (data.safetyScore || 50) * 0.25 +
    (data.comfortScore || 50) * 0.2 +
    weather * 0.15 +
    traffic * 0.15 +
    (100 - (100 - stress) * 0.5) * 0.1 +
    crowd * 0.1 +
    walking * 0.05
  );
  return {
    overall: Math.min(100, Math.max(0, overall)),
    safety: data.safetyScore || 50,
    comfort: data.comfortScore || 50,
    weather,
    traffic,
    stress,
    crowd,
    walking,
  };
}
