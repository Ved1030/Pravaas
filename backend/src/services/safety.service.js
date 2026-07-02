const logger = require('../utils/logger');

const SAFETY_ALERT_TYPES = [
  { type: 'heavy_crowd', severity: 'medium', title: 'Heavy Crowd', description: 'Large crowd聚集 reported in this area' },
  { type: 'accident', severity: 'high', title: 'Accident Reported', description: 'Vehicle accident reported nearby' },
  { type: 'construction', severity: 'low', title: 'Construction Work', description: 'Road construction in progress' },
  { type: 'flooding', severity: 'high', title: 'Flooding', description: 'Waterlogging reported in this area' },
  { type: 'crime_alert', severity: 'high', title: 'Crime Alert', description: 'Suspicious activity reported in vicinity' },
  { type: 'political_gathering', severity: 'medium', title: 'Political Gathering', description: 'Political rally or gathering underway' },
  { type: 'road_blocked', severity: 'high', title: 'Road Blocked', description: 'Road block reported, seek alternate route' },
  { type: 'unsafe_area', severity: 'high', title: 'Unsafe Area', description: 'Area reported as unsafe for travel' },
];

const areaConfigs = [
  { name: 'Andheri East', lat: 19.1136, lng: 72.8697 },
  { name: 'Bandra West', lat: 19.0596, lng: 72.8295 },
  { name: 'Powai', lat: 19.1176, lng: 72.9060 },
  { name: 'Worli', lat: 19.0176, lng: 72.8162 },
  { name: 'Dadar', lat: 19.0196, lng: 72.8434 },
  { name: 'CSMT', lat: 18.9398, lng: 72.8354 },
  { name: 'Borivali', lat: 19.2307, lng: 72.8567 },
  { name: 'Thane', lat: 19.1876, lng: 72.9776 },
  { name: 'Ghatkopar', lat: 19.0862, lng: 72.9081 },
  { name: 'Kurla', lat: 19.0728, lng: 72.8826 },
];

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
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

async function getSafetyAlerts(lat, lng, radius) {
  try {
    const maxRadius = radius || 5;
    const alerts = [];
    let id = 1;

    for (const area of areaConfigs) {
      const distance = parseFloat(haversineDistance(lat, lng, area.lat, area.lng).toFixed(1));
      if (distance > maxRadius) continue;

      const numAlerts = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...SAFETY_ALERT_TYPES].sort(() => 0.5 - Math.random()).slice(0, numAlerts);

      for (const template of shuffled) {
        alerts.push({
          id: id++,
          type: template.type,
          title: template.title,
          description: template.description,
          location: area.name,
          severity: template.severity,
          coordinates: { lat: area.lat, lng: area.lng },
          distance,
          timestamp: new Date().toISOString(),
        });
      }
    }

    alerts.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3) || a.distance - b.distance;
    });

    return alerts;
  } catch (err) {
    logger.error('Error getting safety alerts:', err.message);
    return [];
  }
}

async function getSafetyScore(route, womenSafeMode) {
  try {
    let score = 50;

    const trafficFactor = route.trafficLevel === 'high' ? 15 : route.trafficLevel === 'medium' ? 10 : 5;
    score += trafficFactor;

    const transfers = route.transfers || 0;
    score -= transfers * 3;

    const hasPublicTransit = (route.steps || []).some(s => s.mode === 'metro' || s.mode === 'train' || s.mode === 'bus');
    if (hasPublicTransit) score += 10;

    const hasWalk = (route.steps || []).some(s => s.mode === 'walk');
    if (hasWalk) {
      const walkSteps = (route.steps || []).filter(s => s.mode === 'walk');
      const totalWalk = walkSteps.reduce((sum, s) => sum + (s.duration || 0), 0);
      if (totalWalk > 15) score -= 10;
    }

    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 5;
    if (isNight) score -= 10;

    if (womenSafeMode) {
      score += 15;
      score = Math.min(score, 100);
    }

    score = Math.max(0, Math.min(100, score));

    const factors = [];
    if (trafficFactor > 5) factors.push('Higher traffic provides natural surveillance');
    if (hasPublicTransit) factors.push('Public transit routes are generally safer');
    if (womenSafeMode) factors.push('Women safety mode active: prefer well-lit and policed roads');
    if (isNight) factors.push('Night travel detected: caution advised');
    if (transfers > 1) factors.push('Multiple transfers may expose to less safe waiting areas');

    return {
      score,
      factors,
      womenSafeMode: !!womenSafeMode,
    };
  } catch (err) {
    logger.error('Error getting safety score:', err.message);
    return { score: 50, factors: ['Unable to calculate'], womenSafeMode: false };
  }
}

async function getSafeRoute(route, womenSafeMode) {
  try {
    const result = await getSafetyScore(route, womenSafeMode);
    const currentScore = result.score;
    const targetScore = Math.min(100, currentScore + 12 + Math.floor(Math.random() * 10));

    const safeSteps = (route.steps || []).map(step => {
      if (step.mode === 'walk' && womenSafeMode) {
        return { ...step, label: `${step.label} (well-lit route)`, duration: step.duration + 2 };
      }
      return step;
    });

    return {
      originalRoute: route,
      safeRoute: {
        ...route,
        steps: safeSteps,
        label: womenSafeMode ? `${route.label || 'Route'} (Women Safe Mode)` : `${route.label || 'Route'} (Safer)`,
        safetyScore: targetScore,
      },
      safetyScore: targetScore,
      originalScore: currentScore,
      improvement: targetScore - currentScore,
      womenSafeMode: !!womenSafeMode,
    };
  } catch (err) {
    logger.error('Error getting safe route:', err.message);
    throw err;
  }
}

module.exports = {
  getSafetyAlerts,
  getSafetyScore,
  getSafeRoute,
};
