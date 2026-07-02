export type TransportMode = 'metro' | 'bus' | 'walk' | 'auto' | 'ferry' | 'cycle';
export type DisruptionSeverity = 'minor' | 'major' | 'shutdown';
export type JourneyStatus = 'on-time' | 'delayed' | 'disrupted';

export interface RouteSegment {
  mode: TransportMode;
  duration: number;
  label: string;
  detail?: string;
}

export interface SavedRoute {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  modeLabel: string;
  duration: number;
  cost: number;
}

export interface RouteResult {
  id: string;
  badge: string;
  badgeColor: string;
  from: string;
  to: string;
  totalTime: number;
  cost: number;
  segments: RouteSegment[];
  crowd: 'HIGH' | 'MODERATE' | 'LOW';
  confidence: number;
  isRecommended?: boolean;
  savedTime?: number;
  explanation?: string;
  trafficLevel?: "low" | "medium" | "high";
  predictedDelay?: number;
  insights?: {
    timeSaved: number;
    costSaved: number;
    avoidedTraffic: boolean;
    predictedDelay: number;
  };
  aiData?: AIRecommendationResponse;
}

export interface Disruption {
  id: string;
  route: string;
  delay: number;
  severity: DisruptionSeverity;
  reason: string;
  affectedStations: string[];
  timestamp: string;
  type: 'delay' | 'cancellation';
}

export interface JourneyHistoryItem {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  modeLabel: string;
  duration: number;
  cost: number;
  date: string;
  time: string;
  status: JourneyStatus;
  rerouted?: boolean;
}

export interface AIWeatherData {
  condition: string;
  label: string;
  icon: string;
  impact: number;
  color: string;
  bg: string;
  temperature: number;
  humidity: number;
  impacts: string[];
  visibility: string;
  timestamp: string;
  routeImpact?: {
    totalDelay: number;
    segments: { mode: string; originalDuration: number; delayImpact: number; impactLevel: string }[];
  };
}

export interface AICrowdData {
  level: string;
  label: string;
  color: string;
  bg: string;
  dot: string;
  score: number;
  occupancyPercentage: number;
  timestamp: string;
  stepIndex?: number;
  mode?: string;
  location?: string;
}

export interface AIDelayPrediction {
  probability: number;
  level: string;
  factors: { name: string; impact: number; detail: string }[];
  estimatedDelay: number;
  label: string;
  color: { text: string; bg: string };
}

export interface AIComfortData {
  score: number;
  level: string;
  factors: { name: string; impact: number; detail: string }[];
}

export interface AIRecommendationResponse {
  recommendedRouteId: string;
  recommendedRoute: {
    id: string;
    type: string;
    label: string;
    totalTime: number;
    cost: number;
    trafficLevel: string;
    transfers: number;
  };
  confidence: number;
  explanation: string;
  reasons: string[];
  delayPrediction: AIDelayPrediction;
  comfort: AIComfortData;
  weather: AIWeatherData;
  crowd: AICrowdData[];
  insights: {
    timeSaved: number;
    costSaved: number;
    avoidedTraffic: boolean;
    predictedDelay: number;
  };
  scoring: { routeId: string; score: number }[];
  timestamp: string;
}

export interface AILeaveTimeResponse {
  currentTime: string;
  leaveBy: string;
  arriveBy: string;
  leaveByFormatted: string;
  arriveByFormatted: string;
  totalDuration: number;
  bufferMinutes: number;
  reasons: string[];
  weather: AIWeatherData;
  trafficLevel: string;
  route: {
    id: string;
    type: string;
    label: string;
    totalTime: number;
    estimatedCost: number;
  };
  recommendation: {
    confidence: number;
    explanation: string;
  };
}

export interface AICompareResponse {
  comparisons: {
    routeId: string;
    type: string;
    label: string;
    metrics: {
      travelTime: { value: number; unit: string };
      cost: { value: number; unit: string };
      distance: { value: number; unit: string };
      trafficLevel: string;
      transfers: number;
      walkingDistance: { value: number; unit: string };
      crowd: { average: number; segments: AICrowdData[] };
      comfort: AIComfortData;
      delayRisk: AIDelayPrediction;
      weatherImpact: number;
      confidence: number;
    };
  }[];
  winners: Record<string, string>;
  weather: AIWeatherData;
  generatedAt: string;
}

export type NotificationType =
  | "accident"
  | "metro_delay"
  | "crowd"
  | "traffic"
  | "signal_failure"
  | "road_closure"
  | "prediction";

export type NotificationSeverity = "high" | "medium" | "low";

export interface NotificationAlert {
  id: string | number;
  type: NotificationType;
  title: string;
  location: string;
  distance: number;
  severity: NotificationSeverity;
  message: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  confidence?: number;
}

export interface NotificationsResponse {
  alerts: NotificationAlert[];
  userLocation: { lat: number; lng: number };
  radius: number;
  total: number;
}

// === PHASE 2 TYPES ===

export type JourneyStageStatus = 'upcoming' | 'current' | 'completed';

export interface JourneyStage {
  mode: TransportMode | 'cab' | 'train' | 'drive';
  label: string;
  distance: string;
  duration: number;
  status: JourneyStageStatus;
  eta?: string;
  actualDuration?: number;
}

export interface LiveTracking {
  id: string;
  userId: string;
  status: 'active' | 'completed';
  currentStageIndex: number;
  stages: JourneyStage[];
  routeData: any;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  remainingTime: number;
  delay?: number;
  lateArrival: boolean;
  updatedAt: string;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  location: { lat: number; lng: number; address?: string };
  journeyDetails?: any;
  contacts?: string[];
  status: 'active' | 'resolved';
  timestamp: string;
  resolvedAt?: string;
}

export interface SafetyAlert {
  id: number;
  type: 'heavy_crowd' | 'accident' | 'construction' | 'flooding' | 'crime_alert' | 'political_gathering' | 'road_blocked' | 'unsafe_area';
  title: string;
  description: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  coordinates: { lat: number; lng: number };
  distance: number;
  timestamp: string;
}

export interface SafetyScore {
  score: number;
  factors: string[];
  womenSafeMode: boolean;
}

export interface SafeRouteResponse {
  originalRoute: any;
  safeRoute: any;
  safetyScore: number;
  originalScore: number;
  improvement: number;
  womenSafeMode: boolean;
}

export interface SmartNotification {
  id: string;
  userId: string;
  type: 'leave_now' | 'rain_ahead' | 'metro_delayed' | 'heavy_traffic' | 'route_changed' | 'destination_nearby' | 'journey_completed' | 'emergency_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface JourneySummaryData {
  id: string;
  userId: string;
  route: any;
  travelTime: number;
  moneySpent: number;
  moneySaved: number;
  co2Saved: number;
  safetyScore: number;
  comfortScore: number;
  confidence: number;
  delay: number;
  walkingDistance: number;
  aiSuggestions: string[];
  date: string;
  journeyHealthScore?: number;
}

export interface VoiceCommand {
  action: 'navigate' | 'plan_route' | 'share_journey' | 'current_location' | 'check_late' | 'nearby' | 'unknown';
  destination?: string;
  preference?: string;
  type?: string;
  response: string;
}

export interface SharedRoute {
  id: string;
  userId: string;
  journeyId: string;
  shareCode: string;
  active: boolean;
  currentLocation?: { lat: number; lng: number };
  eta?: string;
  progress?: number;
  createdAt: string;
  expiresAt?: string;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
  notifyOnStart: boolean;
  notifyOnArrival: boolean;
  shareLiveLocation: boolean;
  createdAt: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  voiceNavigation: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  colorBlindSupport: boolean;
}

export interface JourneyHealthScore {
  overall: number;
  safety: number;
  comfort: number;
  weather: number;
  traffic: number;
  stress: number;
  crowd: number;
  walking: number;
}
