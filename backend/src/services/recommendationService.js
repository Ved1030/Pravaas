const logger = require("../utils/logger");
const { getCurrentWeather, getWeatherImpactForRoute } = require("./weatherService");
const { getCrowdLevel, getCrowdForRoute } = require("./crowdService");
const { calculateComfortScore } = require("./comfortService");
const { predictDelay } = require("./predictionService");
const { getBestRoute, generateInsights, calculateConfidence, determinePreference, WEIGHTS } = require("./aiScoring.service");

function generateRecommendationReasons(route, weatherData, delayPrediction, comfortData) {
  const reasons = [];
  const score = [];

  if (route.trafficLevel === "low") {
    reasons.push("✓ Lowest traffic congestion");
    score.push(8);
  } else if (route.trafficLevel === "medium") {
    reasons.push("✓ Moderate traffic conditions");
    score.push(4);
  }

  if (delayPrediction.level === "very_low" || delayPrediction.level === "low") {
    reasons.push("✓ Lowest probability of delay");
    score.push(9);
  }

  if (comfortData.score >= 80) {
    reasons.push("✓ Most comfortable journey");
    score.push(7);
  } else if (comfortData.score >= 60) {
    reasons.push("✓ Comfortable journey");
    score.push(4);
  }

  if (weatherData.impact === 0) {
    reasons.push("✓ Favorable weather conditions");
    score.push(6);
  } else if (weatherData.impact <= 3) {
    reasons.push("✓ Minor weather impact only");
    score.push(3);
  }

  if (route.type === "fastest" || route.type === "comfort") {
    const walkingSteps = (route.steps || []).filter((s) => s.mode === "walk");
    const totalWalk = walkingSteps.reduce((s, st) => s + (st.duration || 0), 0);
    if (totalWalk <= 10) {
      reasons.push("✓ Less walking distance");
      score.push(5);
    }
  }

  if (route.transfers <= 1) {
    reasons.push("✓ Fewer transfers");
    score.push(6);
  } else if (route.transfers === 0) {
    reasons.push("✓ Direct route, no transfers");
    score.push(8);
  }

  const hour = new Date().getHours();
  if (hour >= 18 || hour <= 6) {
    if (route.type === "comfort") {
      reasons.push("✓ Safer option after sunset");
      score.push(7);
    }
  }

  if (delayPrediction.estimatedDelay <= (route.totalTime || route.durationMin || 0) * 0.05) {
    reasons.push("✓ Fastest considering current traffic");
    score.push(9);
  }

  reasons.sort((a, b) => score[reasons.indexOf(b)] - score[reasons.indexOf(a)]);

  return reasons.slice(0, 5);
}

function recommendRoute(routes, preferences) {
  if (!routes || routes.length === 0) {
    return { error: "No routes to analyze" };
  }

  const preference = preferences
    ? determinePreference(preferences.speed, preferences.cost, preferences.comfort)
    : "fastest";

  const scoredResult = getBestRoute(routes, preference);
  const bestRoute = scoredResult?.best || routes[0];

  const weatherData = getCurrentWeather();

  const weatherImpact = getWeatherImpactForRoute(bestRoute.steps || [], weatherData);

  const crowdData = getCrowdForRoute(bestRoute.steps || []);

  const delayPrediction = predictDelay(bestRoute, weatherImpact.totalDelay, crowdData);

  const comfortData = calculateComfortScore(bestRoute, weatherImpact.totalDelay, crowdData);

  const reasons = generateRecommendationReasons(bestRoute, weatherData, delayPrediction, comfortData);

  const confidence = scoredResult?.best && scoredResult?.secondBest
    ? calculateConfidence(scoredResult.best.score, scoredResult.secondBest.score)
    : 85;

  const insights = generateInsights(routes, bestRoute);

  return {
    recommendedRouteId: bestRoute.id,
    recommendedRoute: {
      id: bestRoute.id,
      type: bestRoute.type,
      label: bestRoute.label,
      totalTime: bestRoute.totalTime || bestRoute.durationMin,
      cost: bestRoute.estimatedCost,
      trafficLevel: bestRoute.trafficLevel,
      transfers: bestRoute.transfers || 0,
    },
    confidence,
    explanation: insights.reason || `AI recommends the ${bestRoute.type} route based on current conditions.`,
    reasons,
    delayPrediction,
    comfort: comfortData,
    weather: {
      ...weatherData,
      routeImpact: {
        totalDelay: weatherImpact.totalDelay,
        segments: weatherImpact.segments,
      },
    },
    crowd: crowdData,
    insights: {
      timeSaved: insights.timeSaved || 0,
      costSaved: insights.costSaved || 0,
      avoidedTraffic: insights.avoidedTraffic || false,
      predictedDelay: insights.predictedDelay || 0,
    },
    scoring: scoredResult?.scores || [],
    timestamp: new Date().toISOString(),
  };
}

function calculateLeaveTime(route, preferences) {
  if (!route) return { error: "No route data" };

  const now = new Date();
  const weatherData = getCurrentWeather();
  const totalDuration = route.totalTime || route.durationMin || 0;
  const trafficLevel = route.trafficLevel || "low";

  let bufferMinutes = 0;

  if (trafficLevel === "high") bufferMinutes += 10;
  else if (trafficLevel === "medium") bufferMinutes += 5;

  if (weatherData.impact > 0) bufferMinutes += weatherData.impact;

  const hour = now.getHours();
  const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  if (isPeak) bufferMinutes += 10;

  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) bufferMinutes = Math.max(0, bufferMinutes - 5);

  const arriveBy = new Date(now.getTime() + (totalDuration + bufferMinutes) * 60000);
  const leaveBy = new Date(now.getTime() + bufferMinutes * 60000);

  const reasons = [];
  if (trafficLevel === "high") reasons.push("Heavy traffic expected");
  if (weatherData.impact > 0) reasons.push(`${weatherData.label} expected (${weatherData.impact} min buffer)`);
  if (isPeak) reasons.push("Peak hour travel");

  return {
    currentTime: now.toISOString(),
    leaveBy: leaveBy.toISOString(),
    arriveBy: arriveBy.toISOString(),
    leaveByFormatted: leaveBy.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    arriveByFormatted: arriveBy.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    totalDuration,
    bufferMinutes,
    reasons: reasons.length > 0 ? reasons : ["Smooth traffic expected"],
    weather: weatherData,
    trafficLevel,
  };
}

module.exports = {
  recommendRoute,
  calculateLeaveTime,
  generateRecommendationReasons,
};
