import type { SavedRoute, RouteResult, JourneyHistoryItem, Disruption, RouteSegment } from './types';

export const savedRoutes: SavedRoute[] = [
  { id: '1', from: 'HOME', to: 'OFFICE', mode: 'metro', modeLabel: '🚇 METRO', duration: 28, cost: 30 },
  { id: '2', from: 'ANDHERI', to: 'DADAR', mode: 'bus', modeLabel: '🚌 BUS', duration: 22, cost: 15 },
  { id: '3', from: 'CST', to: 'BANDRA', mode: 'metro', modeLabel: '🚇+🚌 MULTI', duration: 40, cost: 25 },
];

export const activeJourneySegments: RouteSegment[] = [
  { mode: 'walk', duration: 4, label: 'WALK · 4M', detail: 'Head north on SV Road to Andheri Station' },
  { mode: 'metro', duration: 18, label: 'METRO L1 · 18M', detail: 'Board at Platform 2, exit at BKC' },
  { mode: 'walk', duration: 6, label: 'WALK · 6M', detail: 'Walk to BKC Gate 2' },
];

export const routeResults: RouteResult[] = [
  {
    id: '1', badge: '⚡ FASTEST', badgeColor: 'accent',
    from: 'ANDHERI', to: 'BKC', totalTime: 28, cost: 30,
    segments: [
      { mode: 'walk', duration: 4, label: 'WALK · 4M', detail: 'Head north on SV Road to Andheri Station entrance' },
      { mode: 'metro', duration: 18, label: 'METRO L1 · 18M', detail: 'Board Line 1 at Platform 2, ride to BKC Station' },
      { mode: 'walk', duration: 6, label: 'WALK · 6M', detail: 'Exit Gate 2, walk south to destination' },
    ],
    crowd: 'HIGH', confidence: 87,
  },
  {
    id: '2', badge: '₹ CHEAPEST', badgeColor: 'success',
    from: 'ANDHERI', to: 'BKC', totalTime: 34, cost: 18,
    segments: [
      { mode: 'walk', duration: 5, label: 'WALK · 5M', detail: 'Walk to bus stop on SV Road' },
      { mode: 'bus', duration: 22, label: 'BUS #308 · 22M', detail: 'Board #308 towards BKC, alight at BKC Complex' },
      { mode: 'walk', duration: 3, label: 'WALK · 3M', detail: 'Walk to destination' },
    ],
    crowd: 'MODERATE', confidence: 92,
  },
  {
    id: '3', badge: '🪑 COMFORT', badgeColor: 'muted',
    from: 'ANDHERI', to: 'BKC', totalTime: 38, cost: 55,
    segments: [
      { mode: 'walk', duration: 8, label: 'WALK · 8M', detail: 'Walk to auto stand near station' },
      { mode: 'auto', duration: 15, label: 'AUTO · 15M', detail: 'Direct auto rickshaw via Western Express Highway' },
      { mode: 'walk', duration: 4, label: 'WALK · 4M', detail: 'Walk from drop to BKC office' },
    ],
    crowd: 'LOW', confidence: 95,
  },
];

export const disruptions: Disruption[] = [
  {
    id: '1', route: 'METRO LINE 1', delay: 8, severity: 'major',
    reason: 'SIGNAL FAILURE', affectedStations: ['ANDHERI', 'GHATKOPAR'],
    timestamp: '3 MIN AGO', type: 'delay',
  },
  {
    id: '2', route: 'BUS #340', delay: 0, severity: 'shutdown',
    reason: 'VEHICLE BREAKDOWN', affectedStations: ['DADAR', 'BANDRA'],
    timestamp: '12 MIN AGO', type: 'cancellation',
  },
];

export const journeyHistory: JourneyHistoryItem[] = [
  { id: '1', from: 'ANDHERI', to: 'BKC', mode: 'metro', modeLabel: 'METRO + WALK', duration: 28, cost: 30, date: '27 MAR', time: '09:04', status: 'on-time' },
  { id: '2', from: 'HOME', to: 'OFFICE', mode: 'metro', modeLabel: 'METRO', duration: 32, cost: 30, date: '26 MAR', time: '08:55', status: 'delayed' },
  { id: '3', from: 'DADAR', to: 'BANDRA', mode: 'bus', modeLabel: 'BUS #308', duration: 18, cost: 12, date: '26 MAR', time: '17:30', status: 'on-time' },
  { id: '4', from: 'ANDHERI', to: 'CST', mode: 'metro', modeLabel: 'METRO L1', duration: 45, cost: 40, date: '25 MAR', time: '09:10', status: 'on-time' },
  { id: '5', from: 'BKC', to: 'ANDHERI', mode: 'auto', modeLabel: 'AUTO', duration: 22, cost: 65, date: '25 MAR', time: '18:45', status: 'on-time' },
  { id: '6', from: 'HOME', to: 'OFFICE', mode: 'metro', modeLabel: 'METRO + WALK', duration: 35, cost: 30, date: '24 MAR', time: '09:02', status: 'delayed' },
  { id: '7', from: 'ANDHERI', to: 'DADAR', mode: 'bus', modeLabel: 'BUS #340', duration: 28, cost: 15, date: '24 MAR', time: '14:20', status: 'disrupted', rerouted: true },
  { id: '8', from: 'CST', to: 'BANDRA', mode: 'metro', modeLabel: 'METRO + BUS', duration: 40, cost: 25, date: '23 MAR', time: '10:15', status: 'on-time' },
  { id: '9', from: 'BANDRA', to: 'ANDHERI', mode: 'bus', modeLabel: 'BUS #209', duration: 20, cost: 10, date: '22 MAR', time: '19:00', status: 'on-time' },
  { id: '10', from: 'HOME', to: 'OFFICE', mode: 'metro', modeLabel: 'METRO', duration: 27, cost: 30, date: '21 MAR', time: '08:50', status: 'on-time' },
];

export const weeklyTrips = [
  { day: 'MON', trips: 3, mode: 'metro' as const },
  { day: 'TUE', trips: 2, mode: 'metro' as const },
  { day: 'WED', trips: 4, mode: 'bus' as const },
  { day: 'THU', trips: 2, mode: 'metro' as const },
  { day: 'FRI', trips: 3, mode: 'metro' as const },
  { day: 'SAT', trips: 1, mode: 'bus' as const },
  { day: 'SUN', trips: 0, mode: 'walk' as const },
];
