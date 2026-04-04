const { fetchOSRMRoutes, geocode } = require("./route.service");
const pricing = require("./pricing.service");
const { transportData } = require("../utils/dataLoader");
const { getBestRoute, generateInsights, determinePreference, calculateConfidence, WEIGHTS } = require("./aiScoring.service");

const OSRM_BASE = "http://router.project-osrm.org/route/v1";

function simulateDelay(mode) {
  switch (mode) {
    case "train":
      return Math.floor(Math.random() * 6) + 3;
    case "bus":
      return Math.floor(Math.random() * 5) + 2;
    case "metro":
      return Math.floor(Math.random() * 3) + 1;
    default:
      return 0;
  }
}

function findNearestStation(coord, lineStations) {
  if (!lineStations || lineStations.length === 0) return null;
  return lineStations[0];
}

function checkStationProximity(query, allStations) {
  const normalized = query.trim().toLowerCase();
  for (const [lineName, stations] of Object.entries(allStations)) {
    const stationList = Array.isArray(stations) ? stations : stations.stations || [];
    for (const station of stationList) {
      if (station.toLowerCase().includes(normalized) || normalized.includes(station.toLowerCase())) {
        return { line: lineName, station, stations: stationList };
      }
    }
  }
  return null;
}

function buildFastestRoute(origin, destination, distanceKm, durationMin, geometry) {
  const walkToStation = Math.max(3, Math.round(durationMin * 0.08));
  const walkFromStation = Math.max(3, Math.round(durationMin * 0.08));
  const metroDuration = durationMin - walkToStation - walkFromStation;

  const metroFare = pricing.getMetroFare(origin, destination);
  const autoFare = pricing.getAutoFare(distanceKm * 0.3);

  let cost, steps;

  if (metroFare !== null) {
    cost = metroFare + 5;
    const metroDelay = simulateDelay("metro");
    steps = [
      {
        mode: "walk",
        label: "Walk to metro station",
        duration: walkToStation,
        distance: `${(distanceKm * 0.1).toFixed(1)} km`,
        cost: 0,
      },
      {
        mode: "metro",
        label: "Metro to destination area",
        duration: metroDuration + metroDelay,
        distance: `${(distanceKm * 0.8).toFixed(1)} km`,
        cost: metroFare,
        delay: metroDelay,
      },
      {
        mode: "walk",
        label: "Walk to destination",
        duration: walkFromStation,
        distance: `${(distanceKm * 0.1).toFixed(1)} km`,
        cost: 0,
      },
    ];
  } else {
    cost = autoFare;
    steps = [
      {
        mode: "walk",
        label: "Walk to pickup point",
        duration: walkToStation,
        distance: `${(distanceKm * 0.05).toFixed(1)} km`,
        cost: 0,
      },
      {
        mode: "auto",
        label: "Auto to destination",
        duration: durationMin - walkToStation,
        distance: `${distanceKm.toFixed(1)} km`,
        cost: autoFare,
      },
    ];
  }

  const totalTime = steps.reduce((sum, s) => sum + s.duration, 0);

  return {
    id: "fastest",
    type: "fastest",
    label: "Fastest",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    totalTime,
    estimatedCost: cost,
    trafficLevel: distanceKm < 5 ? "low" : distanceKm <= 10 ? "medium" : "high",
    predictedDelay: (() => {
      const hour = new Date().getHours();
      const m = (hour >= 8 && hour <= 11) ? 0.20 : (hour >= 17 && hour <= 21) ? 0.25 : 0;
      return Math.round(durationMin * m);
    })(),
    transfers: steps.filter((s) => s.mode !== "walk").length - 1,
    tags: ["Fastest Route"],
    resources: steps.filter((s) => s.duration > 0).map((s) => ({
      type: s.mode,
      duration: s.duration,
      label: s.label,
    })),
    steps,
  };
}

function buildCheapestRoute(origin, destination, distanceKm, durationMin, geometry) {
  const walkToStop = Math.max(3, Math.round(durationMin * 0.08));
  const walkFromStop = Math.max(3, Math.round(durationMin * 0.08));

  const busFare = pricing.getBusFare(distanceKm);
  const trainFare = pricing.getTrainFare(distanceKm);
  const busDuration = Math.round(durationMin * 0.45);
  const trainDuration = Math.round(durationMin * 0.35);
  const walkRemainder = Math.max(2, durationMin - walkToStop - busDuration - trainDuration - walkFromStop);

  const busDelay = simulateDelay("bus");
  const trainDelay = simulateDelay("train");

  const steps = [
    {
      mode: "walk",
      label: "Walk to bus stop",
      duration: walkToStop,
      distance: `${(distanceKm * 0.05).toFixed(1)} km`,
      cost: 0,
    },
    {
      mode: "bus",
      label: "Bus to transit hub",
      duration: busDuration + busDelay,
      distance: `${(distanceKm * 0.4).toFixed(1)} km`,
      cost: busFare,
      delay: busDelay,
    },
    {
      mode: "train",
      label: "Local train to destination area",
      duration: trainDuration + trainDelay,
      distance: `${(distanceKm * 0.45).toFixed(1)} km`,
      cost: trainFare,
      delay: trainDelay,
    },
    {
      mode: "walk",
      label: "Walk to destination",
      duration: walkRemainder + walkFromStop,
      distance: `${(distanceKm * 0.1).toFixed(1)} km`,
      cost: 0,
    },
  ];

  const cost = busFare + trainFare;
  const totalTime = steps.reduce((sum, s) => sum + s.duration, 0);

  return {
    id: "cheapest",
    type: "cheapest",
    label: "Cheapest",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.round(totalTime * 1.15),
    totalTime,
    estimatedCost: cost,
    trafficLevel: distanceKm < 5 ? "low" : distanceKm <= 15 ? "medium" : "high",
    predictedDelay: (() => {
      const hour = new Date().getHours();
      const m = (hour >= 8 && hour <= 11) ? 0.20 : (hour >= 17 && hour <= 21) ? 0.25 : 0;
      return Math.round(totalTime * m);
    })(),
    transfers: 1,
    tags: ["Budget Friendly"],
    resources: steps.filter((s) => s.duration > 0).map((s) => ({
      type: s.mode,
      duration: s.duration,
      label: s.label,
    })),
    steps,
  };
}

function buildComfortRoute(origin, destination, distanceKm, durationMin, geometry) {
  const isPeak = (() => {
    const hour = new Date().getHours();
    return (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  })();

  const cabFare = pricing.getCabFare(distanceKm, isPeak);
  const cabDelay = 0;

  const steps = [
    {
      mode: "cab",
      label: "Direct cab ride",
      duration: durationMin,
      distance: `${distanceKm.toFixed(1)} km`,
      cost: cabFare,
      delay: cabDelay,
    },
  ];

  const totalTime = durationMin;

  return {
    id: "comfort",
    type: "comfort",
    label: "Comfort",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    totalTime,
    estimatedCost: cabFare,
    trafficLevel: distanceKm < 5 ? "low" : distanceKm <= 10 ? "medium" : "high",
    predictedDelay: (() => {
      const hour = new Date().getHours();
      const m = (hour >= 8 && hour <= 11) ? 0.20 : (hour >= 17 && hour <= 21) ? 0.25 : 0;
      return Math.round(durationMin * m);
    })(),
    transfers: 0,
    tags: ["Smooth Ride"],
    resources: steps.filter((s) => s.duration > 0).map((s) => ({
      type: s.mode,
      duration: s.duration,
      label: s.label,
    })),
    steps,
  };
}

async function generateRoutes(source, destination, preferences) {
  const origin = await geocode(source);
  const dest = await geocode(destination);

  const osrmRoutes = await fetchOSRMRoutes(origin, dest, "driving");

  if (!osrmRoutes || osrmRoutes.length === 0) {
    throw new Error("No routes found from OSRM");
  }

  const distanceKm = osrmRoutes[0].distanceKm;
  const durationMin = osrmRoutes[0].durationMin;

  const routes = [];

  for (const osrmRoute of osrmRoutes) {
    const routeType = osrmRoute.type;
    let route;

    if (routeType === "fastest") {
      route = buildFastestRoute(source, destination, osrmRoute.distanceKm, osrmRoute.durationMin, osrmRoute.geometry);
    } else if (routeType === "cheapest") {
      route = buildCheapestRoute(source, destination, osrmRoute.distanceKm, osrmRoute.durationMin, osrmRoute.geometry);
    } else {
      route = buildComfortRoute(source, destination, osrmRoute.distanceKm, osrmRoute.durationMin, osrmRoute.geometry);
    }

    routes.push(route);
  }

  while (routes.length < 3) {
    if (!routes.find((r) => r.type === "fastest")) {
      routes.push(buildFastestRoute(source, destination, distanceKm, durationMin, osrmRoutes[0]?.geometry || []));
    } else if (!routes.find((r) => r.type === "cheapest")) {
      routes.push(buildCheapestRoute(source, destination, distanceKm, durationMin, osrmRoutes[0]?.geometry || []));
    } else if (!routes.find((r) => r.type === "comfort")) {
      routes.push(buildComfortRoute(source, destination, distanceKm, durationMin, osrmRoutes[0]?.geometry || []));
    } else {
      break;
    }
  }

  const preference = preferences
    ? determinePreference(preferences.speed, preferences.cost, preferences.comfort)
    : "fastest";

  const scoredResult = getBestRoute(routes, preference);
  const bestRoute = scoredResult?.best || routes[0];
  const insights = generateInsights(routes, bestRoute);

  const confidence = scoredResult?.best && scoredResult?.secondBest
    ? calculateConfidence(scoredResult.best.score, scoredResult.secondBest.score)
    : 85;

  const recommended = {
    routeId: bestRoute.id,
    savedTime: Math.max(0, Math.round(
      Math.max(...routes.map((r) => r.totalTime)) - bestRoute.totalTime
    )),
    confidence,
    explanation: insights.reason || `AI recommends the ${bestRoute.type} route based on current conditions.`,
    insights: {
      timeSaved: insights.timeSaved || 0,
      costSaved: insights.costSaved || 0,
      avoidedTraffic: insights.avoidedTraffic || false,
      predictedDelay: insights.predictedDelay || 0,
    },
  };

  return {
    source,
    destination,
    distanceKm,
    routes,
    recommended,
  };
}

module.exports = { generateRoutes, simulateDelay };
