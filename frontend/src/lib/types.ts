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
