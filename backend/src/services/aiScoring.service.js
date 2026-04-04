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
