# Smart Commute AI Upgrade — Implementation Plan

## Backend Files (Steps 1-3)

### 1. `backend/src/services/route.service.js`

**Replace entire file with:**

```js
const routes = require("../data/routes.json");
const { calculateTotalTime } = require("../utils/calculateTime");
const { calculateTotalCost } = require("../utils/calculateCost");

const OSRM_BASE = "http://router.project-osrm.org/route/v1";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

async function geocode(query) {
  const url = `${NOMINATIM_BASE}?format=json&limit=1&q=${encodeURIComponent(query + ", Mumbai, India")}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (!data.length) throw new Error(`Location not found: "${query}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function fetchOSRMRoute(origin, destination, profile = "driving") {
  const { lat: oLat, lng: oLng } = typeof origin === "object" ? origin : await geocode(origin);
  const { lat: dLat, lng: dLng } = typeof destination === "object" ? destination : await geocode(destination);

  const url = `${OSRM_BASE}/${profile}/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== "Ok" || !json.routes || !json.routes.length) {
    throw new Error(`OSRM returned no route for ${profile}: ${json.code}`);
  }

  const route = json.routes[0];
  const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    geometry,
    distanceKm: route.distance / 1000,
    durationSec: route.duration,
  };
}

function simulateTraffic(distanceKm) {
  if (distanceKm < 5) return "low";
  if (distanceKm <= 10) return "medium";
  return "high";
}

function applyTrafficAdjustment(durationMin, trafficLevel) {
  let multiplier = 1.0;
  if (trafficLevel === "medium") {
    multiplier = 1.10 + Math.random() * 0.10;
  } else if (trafficLevel === "high") {
    multiplier = 1.25 + Math.random() * 0.15;
  }
  return Math.round(durationMin * multiplier);
}

function predictDelay(durationMin) {
  const hour = new Date().getHours();
  let peakMultiplier = 0;
  if (hour >= 8 && hour <= 11) peakMultiplier = 0.20;
  else if (hour >= 17 && hour <= 21) peakMultiplier = 0.25;
  return Math.round(durationMin * peakMultiplier);
}

function buildTransitRoute(osrmResult, routeType, seed) {
  const baseDurationMin = Math.round(osrmResult.durationSec / 60);
  const distanceKm = Math.round(osrmResult.distanceKm * 10) / 10;
  const trafficLevel = simulateTraffic(distanceKm);
  const adjustedDuration = applyTrafficAdjustment(baseDurationMin, trafficLevel);
  const predictedDelay = predictDelay(adjustedDuration);

  let steps, totalTime, estimatedCost, transfers;

  if (routeType === "fastest") {
    const metroTime = Math.round(adjustedDuration * 0.65);
    const autoTime = Math.round(adjustedDuration * 0.25);
    const walkTime = Math.max(2, adjustedDuration - metroTime - autoTime);
    steps = [
      { mode: "walk", icon: "🚶", label: "Walk to Metro Station", duration: walkTime, distance: "0.2 km" },
      { mode: "metro", icon: "🚇", label: `Metro (Line ${1 + (seed % 4)})`, duration: metroTime, distance: `${Math.round(distanceKm * 0.7)} km` },
      { mode: "auto", icon: "🛺", label: "Auto Rickshaw", duration: autoTime, distance: `${(distanceKm * 0.15).toFixed(1)} km` },
    ];
    totalTime = walkTime + metroTime + autoTime;
    estimatedCost = 40 + Math.round(distanceKm * 2.5);
    transfers = 2;
  } else if (routeType === "cheapest") {
    const busTime = Math.round(adjustedDuration * 0.55);
    const trainTime = Math.round(adjustedDuration * 0.30);
    const walkTime = Math.max(5, adjustedDuration - busTime - trainTime);
    steps = [
      { mode: "walk", icon: "🚶", label: "Walk to Bus Stop", duration: 5, distance: "0.5 km" },
      { mode: "bus", icon: "🚌", label: `Bus Route ${300 + (seed % 50)}`, duration: busTime, distance: `${Math.round(distanceKm * 0.55)} km` },
      { mode: "train", icon: "🚆", label: "Local Train", duration: trainTime, distance: `${Math.round(distanceKm * 0.35)} km` },
      { mode: "walk", icon: "🚶", label: "Walk to destination", duration: Math.max(3, walkTime - 5), distance: "0.4 km" },
    ];
    totalTime = 5 + busTime + trainTime + Math.max(3, walkTime - 5);
    estimatedCost = 10 + Math.round(distanceKm * 0.8);
    transfers = 3;
  } else {
    steps = [
      { mode: "cab", icon: "🚗", label: "Cab (AC, Direct)", duration: adjustedDuration, distance: `${distanceKm} km` },
    ];
    totalTime = adjustedDuration;
    estimatedCost = 80 + Math.round(distanceKm * 9);
    transfers = 0;
  }

  return {
    geometry: osrmResult.geometry,
    distanceKm,
    baseDuration: baseDurationMin,
    totalTime,
    estimatedCost,
    trafficLevel,
    predictedDelay,
    steps,
    transfers,
  };
}

exports.getAllRoutes = () => {
  return routes.map((route) => {
    const totalTime = calculateTotalTime(route.steps);
    const totalCost = calculateTotalCost(route.steps);
    return { ...route, totalTime, totalCost, delay: 0, crowd: 0 };
  });
};

exports.geocode = geocode;
exports.fetchOSRMRoute = fetchOSRMRoute;
exports.simulateTraffic = simulateTraffic;
exports.applyTrafficAdjustment = applyTrafficAdjustment;
exports.predictDelay = predictDelay;
exports.buildTransitRoute = buildTransitRoute;
```

---

### 2. `backend/src/services/aiScoring.service.js`

**Replace entire file with:**

```js
const WEIGHTS = {
  fastest: { time: 0.6, cost: 0.2, transfer: 0.1, disruption: 0.1 },
  cheapest: { time: 0.2, cost: 0.6, transfer: 0.1, disruption: 0.1 },
  comfort: { time: 0.3, cost: 0.1, transfer: 0.4, disruption: 0.2 },
};

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function calculateScore(route, weights) {
  const duration = route.totalTime || 0;
  const cost = route.estimatedCost || 0;
  const transfers = route.transfers || 0;
  const disruptionDelay = route.delayFactor || 0;
  const trafficPenalty = { low: 0, medium: 0.1, high: 0.2 }[route.trafficLevel] || 0;
  const predictionPenalty = route.predictedDelay ? route.predictedDelay / 60 : 0;
  return (
    (weights.time * duration) +
    (weights.cost * cost) +
    (weights.transfer * transfers * 10) +
    (weights.disruption * disruptionDelay * 5) +
    trafficPenalty +
    predictionPenalty
  );
}

function getBestRoute(routes, preference = 'fastest') {
  if (!routes || routes.length === 0) return null;
  if (routes.length === 1) {
    return { best: routes[0], secondBest: null, worst: routes[0], scores: [{ routeId: routes[0].id, score: 0 }] };
  }

  const weights = WEIGHTS[preference] || WEIGHTS.fastest;
  const durations = routes.map(r => r.totalTime || 0);
  const costs = routes.map(r => r.estimatedCost || 0);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const maxPredictedDelay = Math.max(...routes.map(r => r.predictedDelay || 0), 1);

  const scoredRoutes = routes.map(route => {
    const normalizedDuration = normalize(route.totalTime || 0, minDuration, maxDuration);
    const normalizedCost = normalize(route.estimatedCost || 0, minCost, maxCost);
    const transfers = route.transfers || 0;
    const disruptionDelay = route.delayFactor || 0;
    const trafficPenalty = { low: 0, medium: 0.1, high: 0.2 }[route.trafficLevel] || 0;
    const predictionPenalty = normalize(route.predictedDelay || 0, 0, maxPredictedDelay) * 0.15;

    const score =
      (weights.time * normalizedDuration) +
      (weights.cost * normalizedCost) +
      (weights.transfer * (transfers / Math.max(routes.length - 1, 1))) +
      (weights.disruption * (disruptionDelay / 10)) +
      trafficPenalty +
      predictionPenalty;

    return { ...route, score };
  });

  scoredRoutes.sort((a, b) => a.score - b.score);
  const best = scoredRoutes[0];
  const secondBest = scoredRoutes[1];
  const worst = scoredRoutes[scoredRoutes.length - 1];

  return { best, secondBest, worst, scores: scoredRoutes.map(r => ({ routeId: r.id, score: r.score })) };
}

function generateInsights(routes, bestRoute) {
  if (!routes || routes.length <= 1 || !bestRoute) {
    return { timeSaved: 0, costSaved: 0, avoidedTraffic: false, predictedDelay: 0, reason: "AI recommends this route as the best option for your journey." };
  }

  const others = routes.filter(r => r.id !== bestRoute.id);
  let maxTimeSaved = 0, maxCostSaved = 0, avoidedTraffic = false, maxPredictedDelay = 0;

  for (const other of others) {
    const tDiff = (other.totalTime || 0) - (bestRoute.totalTime || 0);
    const cDiff = (other.estimatedCost || 0) - (bestRoute.estimatedCost || 0);
    if (tDiff > maxTimeSaved) maxTimeSaved = tDiff;
    if (cDiff > maxCostSaved) maxCostSaved = cDiff;
    if ((other.trafficLevel === "high" || other.trafficLevel === "medium") && bestRoute.trafficLevel !== "high") avoidedTraffic = true;
    if ((other.predictedDelay || 0) > maxPredictedDelay) maxPredictedDelay = other.predictedDelay || 0;
  }

  const parts = [];
  if (maxTimeSaved > 0) parts.push(`saves ${maxTimeSaved} minutes`);
  if (avoidedTraffic) parts.push("avoids heavy traffic zones");
  if (maxCostSaved > 0) parts.push(`reduces cost by ₹${maxCostSaved}`);
  if (bestRoute.trafficLevel === "low") parts.push("travels through low-traffic areas");

  let reason = `AI recommends this route as it ${parts.join(", ")}.`;
  if (maxPredictedDelay > 0) reason += ` Predicted congestion adds +${maxPredictedDelay} min on alternate routes.`;

  return { timeSaved: maxTimeSaved, costSaved: maxCostSaved, avoidedTraffic, predictedDelay: maxPredictedDelay, reason };
}

function generateExplanation(routes, bestRoute) {
  return generateInsights(routes, bestRoute).reason;
}

function calculateTimeSaved(bestRoute, worstRoute) {
  if (!bestRoute || !worstRoute) return 0;
  return Math.max(0, Math.round(worstRoute.totalTime - bestRoute.totalTime));
}

function calculateConfidence(bestScore, secondBestScore) {
  if (!secondBestScore || secondBestScore === 0) return 85;
  const rawConfidence = ((secondBestScore - bestScore) / secondBestScore) * 100;
  return Math.max(70, Math.min(98, Math.round(rawConfidence)));
}

function determinePreference(speed, cost, comfort) {
  if (speed >= cost && speed >= comfort) return 'fastest';
  if (cost >= speed && cost >= comfort) return 'cheapest';
  return 'comfort';
}

module.exports = { calculateScore, getBestRoute, calculateTimeSaved, calculateConfidence, generateExplanation, generateInsights, determinePreference, WEIGHTS };
```

---

### 3. `backend/src/controllers/routePlan.controller.js`

**Replace entire file with:**

```js
const aiScoring = require("../services/aiScoring.service");
const { fetchOSRMRoute, buildTransitRoute, geocode } = require("../services/route.service");

exports.planRoute = async (req, res) => {
  console.log("POST /api/route/plan hit");
  console.log("Request body:", req.body);

  const { source = "", destination = "", speed = 70, cost = 50, comfort = 30 } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ error: "source and destination are required" });
  }

  try {
    const origin = await geocode(source);
    const dest = await geocode(destination);
    const osrmResult = await fetchOSRMRoute(origin, dest, "driving");

    const combinedStr = `${source}${destination}`.toLowerCase();
    let seed = 0;
    for (let i = 0; i < combinedStr.length; i++) {
      seed = (seed * 31 + combinedStr.charCodeAt(i)) % 100;
    }

    const routeTypes = ["fastest", "cheapest", "comfort"];
    const routeLabels = { fastest: "⚡ Fastest", cheapest: "💸 Cheapest", comfort: "😌 Comfort" };
    const routeTags = {
      fastest: ["Fastest", "AI Pick"],
      cheapest: ["Budget", "Eco-Friendly"],
      comfort: ["Zero Transfers", "Door to Door"],
    };

    const builtRoutes = routeTypes.map((type) => {
      const transit = buildTransitRoute(osrmResult, type, seed);
      return {
        id: type,
        label: routeLabels[type],
        type,
        totalTime: transit.totalTime,
        estimatedCost: transit.estimatedCost,
        transfers: transit.transfers,
        delayFactor: type === "comfort" ? 1 : type === "fastest" ? 2 : 3,
        lastMile: type === "fastest" ? `Auto recommended for last ${(transit.distanceKm * 0.15).toFixed(1)} km` : null,
        steps: transit.steps,
        requiresCab: type === "comfort",
        tags: routeTags[type],
        trafficLevel: transit.trafficLevel,
        predictedDelay: transit.predictedDelay,
        geometry: transit.geometry,
        distanceKm: transit.distanceKm,
      };
    });

    const preference = aiScoring.determinePreference(speed, cost, comfort);
    const { best, secondBest, worst, scores } = aiScoring.getBestRoute(builtRoutes, preference);

    const savedTime = Math.max(0, Math.round(worst.totalTime - best.totalTime));

    let confidence = 85;
    if (secondBest && best.score !== undefined && secondBest.score !== undefined && secondBest.score > 0) {
      const rawConfidence = ((secondBest.score - best.score) / secondBest.score) * 100;
      confidence = Math.max(70, Math.min(98, Math.round(rawConfidence)));
    }

    const explanation = aiScoring.generateExplanation(builtRoutes, best);
    const insights = aiScoring.generateInsights(builtRoutes, best);

    const scoredRoutes = builtRoutes.map((route) => {
      const scoreEntry = scores.find((s) => s.routeId === route.id);
      const routeScore = scoreEntry ? scoreEntry.score : 0;
      return {
        ...route,
        confidence: route.id === best.id ? confidence : Math.max(70, Math.min(98, Math.round(100 - routeScore * 50))),
      };
    });

    res.json({
      source,
      destination,
      distanceKm: osrmResult.distanceKm,
      generatedAt: new Date().toISOString(),
      routes: scoredRoutes,
      recommended: {
        routeId: best.id,
        savedTime,
        confidence,
        explanation,
        insights: {
          timeSaved: insights.timeSaved,
          costSaved: insights.costSaved,
          avoidedTraffic: insights.avoidedTraffic,
          predictedDelay: insights.predictedDelay,
        },
      },
    });
  } catch (err) {
    console.error("Route planning error:", err);
    res.status(500).json({ error: "Failed to plan route. Please try again.", details: err.message });
  }
};
```

---

## Frontend Files (Steps 4-8)

### 4. `frontend/src/lib/api.ts`

**Add to `BackendRoute` interface:**
```ts
trafficLevel: "low" | "medium" | "high";
predictedDelay: number;
geometry: [number, number][];
```

**Add to `AIRecommendation` interface:**
```ts
insights: {
  timeSaved: number;
  costSaved: number;
  avoidedTraffic: boolean;
  predictedDelay: number;
};
```

### 5. `frontend/src/lib/types.ts`

**Add to `RouteResult` interface:**
```ts
trafficLevel?: "low" | "medium" | "high";
predictedDelay?: number;
insights?: {
  timeSaved: number;
  costSaved: number;
  avoidedTraffic: boolean;
  predictedDelay: number;
};
```

### 6. `frontend/src/components/MapComponent.tsx`

**Update `MapRoute` interface:**
```ts
export interface MapRoute {
  type: 'fastest' | 'cheapest' | 'comfort';
  color: string;
  positions: [number, number][];
  trafficLevel?: "low" | "medium" | "high";
  isRecommended?: boolean;
}
```

**Update legend:**
```ts
const LEGEND_ITEMS = [
  { color: '#22c55e', label: 'Low Traffic' },
  { color: '#f97316', label: 'Medium Traffic' },
  { color: '#ef4444', label: 'High Traffic' },
];
```

**Update polyline rendering logic:**
```tsx
{routes.map((route) => {
  const isBest = route.isRecommended;
  return (
    <Polyline
      key={route.type}
      positions={route.positions}
      pathOptions={{
        color: route.color,
        weight: isBest ? 6 : 3,
        opacity: isBest ? 1 : 0.5,
        dashArray: isBest ? undefined : "6,6",
      }}
    />
  );
})}
```

### 7. `frontend/src/components/screens/LiveMapScreen.tsx`

**Replace `buildRoutes()` function** — remove fake polylines, use backend geometry.

**Update `handleSearch()`** to extract geometry + trafficLevel from backend response and pass to `MapComponent`.

### 8. `frontend/src/components/screens/PlannerScreen.tsx`

**Update `adaptBackendRoute()`** to pass through `trafficLevel`, `predictedDelay`, and `insights`.

**Enhance explanation display** (around line 395) — add insight pills:
```tsx
{isRecommended && insights && (
  <div className="flex flex-wrap gap-2 mt-2">
    {insights.timeSaved > 0 && (
      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
        ⚡ Saves {insights.timeSaved} min
      </span>
    )}
    {insights.avoidedTraffic && (
      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
        🚦 Avoids heavy traffic
      </span>
    )}
    {insights.costSaved > 0 && (
      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
        ₹{insights.costSaved} cheaper
      </span>
    )}
    {insights.predictedDelay > 0 && (
      <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded-lg">
        +{insights.predictedDelay} min delay avoided
      </span>
    )}
  </div>
)}
```

---

## Execution Order

1. ✅ Backend: `route.service.js` — OSRM + traffic + prediction
2. ✅ Backend: `aiScoring.service.js` — traffic/prediction penalties + generateInsights
3. ✅ Backend: `routePlan.controller.js` — async OSRM routing + enhanced response
4. Frontend: `api.ts` — new types
5. Frontend: `types.ts` — new fields
6. Frontend: `MapComponent.tsx` — traffic-based styling
7. Frontend: `LiveMapScreen.tsx` — OSRM geometry
8. Frontend: `PlannerScreen.tsx` — enhanced explanation
