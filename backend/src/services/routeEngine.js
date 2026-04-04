const { fetchOSRMRoutes, geocode, fetchMultiStopRoute } = require("./route.service");
const { generateResources } = require("./route.service");
const pricing = require("./pricing.service");
const { transportData } = require("../utils/dataLoader");
const { getBestRoute, generateInsights, determinePreference, calculateConfidence, WEIGHTS } = require("./aiScoring.service");
const { generateVoiceInstruction } = require("./language.service");

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

  const hour = new Date().getHours();
  const isPeakHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  const trafficLevel = distanceKm < 5 ? "low" : distanceKm <= 10 ? "medium" : "high";
  // Per-route confidence: fastest scores high on time reliability
  const confidence = Math.round(88 - (isPeakHour ? 6 : 0) - (trafficLevel === "high" ? 4 : 0));

  return {
    id: "fastest",
    type: "fastest",
    label: "Fastest",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    totalTime,
    estimatedCost: cost,
    confidence,
    trafficLevel,
    predictedDelay: (() => {
      const m = isPeakHour ? (hour >= 17 ? 0.25 : 0.20) : 0;
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

  const cheapHour = new Date().getHours();
  const cheapIsPeak = (cheapHour >= 8 && cheapHour <= 11) || (cheapHour >= 17 && cheapHour <= 21);
  const cheapTrafficLevel = distanceKm < 5 ? "low" : distanceKm <= 15 ? "medium" : "high";
  // Cheapest scores lower on reliability due to multiple transfers
  const cheapConfidence = Math.round(76 - (cheapIsPeak ? 5 : 0) - (cheapTrafficLevel === "high" ? 3 : 0));

  return {
    id: "cheapest",
    type: "cheapest",
    label: "Cheapest",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin: Math.round(totalTime * 1.15),
    totalTime,
    estimatedCost: cost,
    confidence: cheapConfidence,
    trafficLevel: cheapTrafficLevel,
    predictedDelay: (() => {
      const m = cheapIsPeak ? (cheapHour >= 17 ? 0.25 : 0.20) : 0;
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

  const comfortHour = new Date().getHours();
  const comfortIsPeak = (comfortHour >= 8 && comfortHour <= 11) || (comfortHour >= 17 && comfortHour <= 21);
  const comfortTrafficLevel = distanceKm < 5 ? "low" : distanceKm <= 10 ? "medium" : "high";
  // Comfort (cab) scores high on reliability but lower during surge
  const comfortConfidence = Math.round(82 - (comfortIsPeak ? 4 : 0) - (comfortTrafficLevel === "high" ? 5 : 0));

  return {
    id: "comfort",
    type: "comfort",
    label: "Comfort",
    geometry,
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMin,
    totalTime,
    estimatedCost: cabFare,
    confidence: comfortConfidence,
    trafficLevel: comfortTrafficLevel,
    predictedDelay: (() => {
      const m = comfortIsPeak ? (comfortHour >= 17 ? 0.25 : 0.20) : 0;
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

/**
 * Build navigation steps from OSRM turn-by-turn data.
 */
function buildNavigationSteps(osrmSteps, segmentLabel) {
  if (!osrmSteps || osrmSteps.length === 0) {
    return [{
      mode: "drive",
      label: segmentLabel || "Continue to destination",
      instruction: segmentLabel || "Continue to destination",
      duration: 0,
      distance: "0 m",
      cost: 0,
      voiceText: segmentLabel || "Continue to destination",
    }];
  }

  return osrmSteps.map((s) => {
    const distKm = s.distance / 1000;
    const distStr = s.distance > 1000
      ? `${(distKm).toFixed(1)} km`
      : `${Math.round(s.distance)} m`;

    let instruction = s.instruction || "Continue";
    let voiceText = instruction;

    if (s.mode === "road") {
      if (s.name) {
        voiceText = `Continue on ${s.name} for ${distStr}`;
      } else {
        voiceText = `Drive for ${distStr}`;
      }
    } else if (s.mode === "walk") {
      voiceText = `Walk for ${distStr}`;
    }

    return {
      mode: s.mode === "road" ? "cab" : "walk",
      label: instruction,
      instruction,
      duration: Math.max(1, s.duration),
      distance: distStr,
      cost: 0,
      voiceText,
    };
  });
}

/**
 * Generate routes with multi-stop support.
 * If stops are provided, uses fetchMultiStopRoute.
 */
async function generateRoutes(source, destination, preferences, stops = [], sourceCoords = null) {
  const allWaypoints = [source, ...stops.filter((s) => s && s.trim()), destination];

  if (allWaypoints.length > 2) {
    return generateMultiStopRoutes(allWaypoints, preferences, sourceCoords);
  }

  const origin = sourceCoords || await geocode(source);
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
    waypoints: [source, destination],
    stopLabels: [],
  };
}

/**
 * Generate multi-stop routes (A -> B -> C -> D).
 * Fetches OSRM for each segment and merges results.
 */
async function generateMultiStopRoutes(waypoints, preferences, sourceCoords = null) {
  const resolvedWaypoints = [...waypoints];
  if (sourceCoords) {
    resolvedWaypoints[0] = sourceCoords;
  }

  const multiStopData = await fetchMultiStopRoute(resolvedWaypoints, "driving");

  const totalDistanceKm = multiStopData.totalDistanceKm;
  const totalDurationMin = multiStopData.totalDurationMin;

  const stopLabels = waypoints.slice(1, -1);

  const types = ["fastest", "cheapest", "comfort"];
  const routes = types.map((type, idx) => {
    const segMultiplier = type === "fastest" ? 0.9 : type === "cheapest" ? 1.15 : 1.0;
    const durationMin = Math.round(totalDurationMin * segMultiplier);
    const cost = type === "cheapest"
      ? Math.round(10 + totalDistanceKm * 0.8)
      : type === "comfort"
        ? Math.round(80 + totalDistanceKm * 9)
        : Math.round(40 + totalDistanceKm * 2.5);

    const navSteps = [];
    multiStopData.segments.forEach((seg, segIdx) => {
      const segmentLabel = segIdx === 0
        ? `Head towards ${waypoints[segIdx + 1]}`
        : segIdx === multiStopData.segments.length - 1
          ? `Continue to ${waypoints[waypoints.length - 1]}`
          : `Continue to ${waypoints[segIdx + 1]}`;

      const segSteps = buildNavigationSteps(seg.steps, segmentLabel);
      navSteps.push(...segSteps);
    });

    const msHour = new Date().getHours();
    const msIsPeak = (msHour >= 8 && msHour <= 11) || (msHour >= 17 && msHour <= 21);
    const msTrafficLevel = totalDistanceKm < 5 ? "low" : totalDistanceKm <= 10 ? "medium" : "high";
    const baseConf = type === "fastest" ? 88 : type === "cheapest" ? 76 : 82;
    const routeConfidence = Math.round(baseConf - (msIsPeak ? 5 : 0) - (msTrafficLevel === "high" ? 4 : 0));

    return {
      id: type,
      type,
      label: type === "fastest" ? "Fastest" : type === "cheapest" ? "Cheapest" : "Comfort",
      geometry: multiStopData.mergedGeometry,
      distanceKm: Math.round(totalDistanceKm * 10) / 10,
      durationMin,
      totalTime: durationMin,
      estimatedCost: cost,
      confidence: routeConfidence,
      trafficLevel: msTrafficLevel,
      predictedDelay: (() => {
        const m = msIsPeak ? (msHour >= 17 ? 0.25 : 0.20) : 0;
        return Math.round(durationMin * m);
      })(),
      transfers: type === "comfort" ? 0 : type === "cheapest" ? stopLabels.length : Math.max(1, stopLabels.length - 1),
      tags: type === "fastest" ? ["Fastest Route"] : type === "cheapest" ? ["Budget Friendly"] : ["Smooth Ride"],
      resources: generateResources(type, durationMin, totalDistanceKm),
      steps: navSteps,
      segmentGeometries: multiStopData.segments.map((s) => s.geometry),
      stopCoordinates: multiStopData.segments.map((s) => ({ from: s.fromCoord, to: s.toCoord })),
    };
  });

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
    explanation: insights.reason || `AI recommends the ${bestRoute.type} route for your multi-stop journey.`,
    insights: {
      timeSaved: insights.timeSaved || 0,
      costSaved: insights.costSaved || 0,
      avoidedTraffic: insights.avoidedTraffic || false,
      predictedDelay: insights.predictedDelay || 0,
    },
  };

  return {
    source: waypoints[0],
    destination: waypoints[waypoints.length - 1],
    distanceKm: totalDistanceKm,
    routes,
    recommended,
    waypoints,
    stopLabels,
  };
}

/**
 * Generate voice instructions for all steps of a route.
 */
async function generateVoiceInstructionsForRoute(route) {
  if (!route || !route.steps) return [];

  const instructions = [];
  for (const step of route.steps) {
    const voiceText = step.voiceText || step.label || step.instruction || "";
    if (!voiceText) continue;

    const audioOrText = await generateVoiceInstruction({ instruction: voiceText });
    instructions.push({
      stepIndex: instructions.length,
      text: voiceText,
      audio: audioOrText,
      mode: step.mode,
      distance: step.distance,
      duration: step.duration,
    });
  }

  return instructions;
}

module.exports = { generateRoutes, generateMultiStopRoutes, generateVoiceInstructionsForRoute, simulateDelay };
