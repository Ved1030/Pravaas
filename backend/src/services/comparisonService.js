const logger = require("../utils/logger");
const { getCurrentWeather, getWeatherImpactForRoute } = require("./weatherService");
const { getCrowdForRoute } = require("./crowdService");
const { calculateComfortScore } = require("./comfortService");
const { predictDelay } = require("./predictionService");

function compareRoutes(routes) {
  if (!routes || routes.length < 2) {
    return { error: "Need at least 2 routes to compare" };
  }

  const weatherData = getCurrentWeather();
  const comparisons = routes.map((route) => {
    const crowdData = getCrowdForRoute(route.steps || []);
    const weatherImpact = getWeatherImpactForRoute(route.steps || [], weatherData);
    const delayPrediction = predictDelay(route, weatherImpact.totalDelay, crowdData);
    const comfort = calculateComfortScore(route, weatherImpact.totalDelay, crowdData);

    return {
      routeId: route.id,
      type: route.type,
      label: route.label,
      metrics: {
        travelTime: { value: route.totalTime || route.durationMin || 0, unit: "min" },
        cost: { value: route.estimatedCost || 0, unit: "₹" },
        distance: { value: route.distanceKm || 0, unit: "km" },
        trafficLevel: route.trafficLevel || "low",
        transfers: route.transfers || 0,
        walkingDistance: {
          value: (route.steps || [])
            .filter((s) => s.mode === "walk")
            .reduce((sum, s) => sum + (s.distance ? parseFloat(s.distance) : s.duration || 0), 0),
          unit: "min",
        },
        crowd: {
          average: crowdData.length > 0
            ? Math.round(crowdData.reduce((s, c) => s + c.score, 0) / crowdData.length)
            : 0,
          segments: crowdData,
        },
        comfort: comfort,
        delayRisk: delayPrediction,
        weatherImpact: weatherImpact.totalDelay,
        confidence: route.confidence || 85,
      },
    };
  });

  const winners = {};
  const metricKeys = ["travelTime", "cost", "transfers", "walkingDistance", "delayRisk.probability", "comfort.score"];

  metricKeys.forEach((key) => {
    const values = comparisons.map((c) => {
      if (key === "delayRisk.probability") return c.metrics.delayRisk.probability;
      if (key === "comfort.score") return -c.metrics.comfort.score;
      const parts = key.split(".");
      let val = c.metrics;
      parts.forEach((p) => { val = val[p]; });
      return typeof val === "number" ? val : Infinity;
    });

    const bestVal = Math.min(...values);
    const bestIdx = values.indexOf(bestVal);
    if (bestIdx >= 0) {
      if (key === "comfort.score") {
        winners["Most Comfortable"] = comparisons[bestIdx].routeId;
      } else if (key === "delayRisk.probability") {
        winners["Lowest Delay Risk"] = comparisons[bestIdx].routeId;
      } else if (key === "travelTime") {
        winners["Fastest"] = comparisons[bestIdx].routeId;
      } else if (key === "cost") {
        winners["Cheapest"] = comparisons[bestIdx].routeId;
      } else {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
        winners[label] = comparisons[bestIdx].routeId;
      }
    }
  });

  const confidenceValues = comparisons.map((c) => c.metrics.confidence);
  const bestConfidence = Math.max(...confidenceValues);
  const bestConfidenceIdx = confidenceValues.indexOf(bestConfidence);
  if (bestConfidenceIdx >= 0) {
    winners["Best Overall"] = comparisons[bestConfidenceIdx].routeId;
  }

  return {
    comparisons,
    winners,
    weather: weatherData,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  compareRoutes,
};
