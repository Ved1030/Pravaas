const haversineDistance = (lat1, lng1, lat2, lng2) => {
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
};

const ALERT_TEMPLATES = [
  {
    type: "accident",
    title: "Accident reported",
    severity: "high",
    message: "Heavy traffic due to accident",
    locations: [
      { name: "Andheri East", lat: 19.1136, lng: 72.8697 },
      { name: "Bandra West", lat: 19.0596, lng: 72.8295 },
      { name: "Powai", lat: 19.1176, lng: 72.9060 },
      { name: "Worli", lat: 19.0176, lng: 72.8162 },
    ],
  },
  {
    type: "metro_delay",
    title: "Metro delay",
    severity: "medium",
    message: "5 min delay on Line 1",
    locations: [
      { name: "Ghatkopar", lat: 19.0862, lng: 72.9081 },
      { name: "Kurla", lat: 19.0728, lng: 72.8826 },
      { name: "Chembur", lat: 19.0626, lng: 72.8991 },
      { name: "Mankhurd", lat: 19.0430, lng: 72.9340 },
    ],
  },
  {
    type: "crowd",
    title: "High crowd density",
    severity: "medium",
    message: "Crowded station during peak hours",
    locations: [
      { name: "Dadar", lat: 19.0196, lng: 72.8434 },
      { name: "CSMT", lat: 18.9398, lng: 72.8354 },
      { name: "Borivali", lat: 19.2307, lng: 72.8567 },
      { name: "Thane", lat: 19.1876, lng: 72.9776 },
    ],
  },
  {
    type: "traffic",
    title: "Heavy traffic",
    severity: "high",
    message: "Congestion on major road",
    locations: [
      { name: "Western Express Highway", lat: 19.1020, lng: 72.8740 },
      { name: "Eastern Express Highway", lat: 19.0650, lng: 72.8750 },
      { name: "SV Road", lat: 19.1350, lng: 72.8450 },
      { name: "Linking Road", lat: 19.0540, lng: 72.8310 },
    ],
  },
  {
    type: "signal_failure",
    title: "Signal failure",
    severity: "high",
    message: "Train services affected",
    locations: [
      { name: "Khar Road", lat: 19.0710, lng: 72.8340 },
      { name: "Santacruz", lat: 19.0825, lng: 72.8417 },
    ],
  },
  {
    type: "road_closure",
    title: "Road closure",
    severity: "medium",
    message: "Road closed for maintenance",
    locations: [
      { name: "Marine Drive", lat: 18.9432, lng: 72.8234 },
      { name: "Cuffe Parade", lat: 18.9147, lng: 72.8119 },
    ],
  },
];

const PREDICTION_TEMPLATES = [
  {
    type: "prediction",
    title: "Delay expected",
    location: "Western Line",
    message: "High probability of delay in next 15 mins",
    confidence: 0.82,
    severity: "high",
    coordinates: { lat: 19.0500, lng: 72.8400 },
  },
  {
    type: "prediction",
    title: "Crowd surge warning",
    location: "Central Line",
    message: "Expected crowd surge in next 30 mins at Dadar",
    confidence: 0.75,
    severity: "medium",
    coordinates: { lat: 19.0196, lng: 72.8434 },
  },
  {
    type: "prediction",
    title: "Rain impact likely",
    location: "Harbour Line",
    message: "Possible slowdown due to weather in next 45 mins",
    confidence: 0.68,
    severity: "medium",
    coordinates: { lat: 19.0330, lng: 72.8600 },
  },
  {
    type: "prediction",
    title: "Peak hour congestion",
    location: "Metro Line 1",
    message: "Congestion expected in next 20 mins",
    confidence: 0.90,
    severity: "low",
    coordinates: { lat: 19.0862, lng: 72.9081 },
  },
];

function generateNearbyAlerts(userLocation) {
  const { lat, lng } = userLocation;
  const alerts = [];
  let id = 1;

  for (const template of ALERT_TEMPLATES) {
    const numLocations = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...template.locations].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numLocations);

    for (const loc of selected) {
      const distance = parseFloat(
        haversineDistance(lat, lng, loc.lat, loc.lng).toFixed(1)
      );

      alerts.push({
        id: id++,
        type: template.type,
        title: template.title,
        location: loc.name,
        distance,
        severity: template.severity,
        message: template.message,
        coordinates: { lat: loc.lat, lng: loc.lng },
        timestamp: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

function predictDelays(userLocation) {
  const { lat, lng } = userLocation;
  const predictions = [];

  const numPredictions = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...PREDICTION_TEMPLATES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numPredictions);

  for (const pred of selected) {
    const distance = parseFloat(
      haversineDistance(lat, lng, pred.coordinates.lat, pred.coordinates.lng).toFixed(1)
    );

    predictions.push({
      id: `pred-${pred.location.toLowerCase().replace(/\s+/g, "-")}`,
      type: pred.type,
      title: pred.title,
      location: pred.location,
      distance,
      severity: pred.severity,
      message: pred.message,
      confidence: pred.confidence,
      coordinates: pred.coordinates,
      timestamp: new Date().toISOString(),
    });
  }

  return predictions;
}

function getAllNotifications(userLocation) {
  const alerts = generateNearbyAlerts(userLocation);
  const predictions = predictDelays(userLocation);
  const combined = [...alerts, ...predictions];

  const severityOrder = { high: 0, medium: 1, low: 2 };

  combined.sort((a, b) => {
    const sevDiff = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
    if (sevDiff !== 0) return sevDiff;
    return a.distance - b.distance;
  });

  return combined;
}

function filterByDistance(notifications, maxKm = 5) {
  return notifications.filter((n) => n.distance <= maxKm);
}

module.exports = {
  generateNearbyAlerts,
  predictDelays,
  getAllNotifications,
  filterByDistance,
};
