const logger = require("../utils/logger");

function predictDelay(route, weatherImpact = 0, crowdData = []) {
  if (!route) return { probability: 0, level: "low", factors: [], estimatedDelay: 0 };

  const factors = [];
  let probability = 0;

  const trafficLevel = route.trafficLevel || "low";
  const trafficMap = { low: 5, medium: 20, high: 40 };
  const trafficProb = trafficMap[trafficLevel] || 5;
  probability += trafficProb;
  factors.push({ name: "Traffic", impact: trafficProb, detail: `${trafficLevel.toUpperCase()} traffic` });

  if (weatherImpact > 5) {
    const weatherProb = Math.min(weatherImpact * 3, 30);
    probability += weatherProb;
    factors.push({ name: "Weather", impact: weatherProb, detail: `Weather adds +${weatherImpact} min` });
  } else if (weatherImpact > 0) {
    const weatherProb = weatherImpact * 2;
    probability += weatherProb;
    factors.push({ name: "Weather", impact: Math.round(weatherProb), detail: `Minor weather impact` });
  }

  const highCrowdSegments = crowdData.filter((c) => c.level === "high" || c.level === "very_high");
  if (highCrowdSegments.length > 0) {
    const crowdProb = Math.min(highCrowdSegments.length * 8, 25);
    probability += crowdProb;
    factors.push({ name: "Crowding", impact: crowdProb, detail: `${highCrowdSegments.length} crowded segments` });
  }

  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  if (isPeak) {
    probability += 15;
    factors.push({ name: "Peak Hour", impact: 15, detail: "Traveling during peak hours" });
  }

  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    probability -= 5;
  }

  if (route.transfers > 2) {
    const transferProb = route.transfers * 3;
    probability += transferProb;
    factors.push({ name: "Transfers", impact: transferProb, detail: `${route.transfers} transfers increase risk` });
  }

  probability = Math.max(0, Math.min(99, Math.round(probability)));

  let level;
  if (probability <= 15) level = "very_low";
  else if (probability <= 30) level = "low";
  else if (probability <= 55) level = "medium";
  else level = "high";

  const duration = route.totalTime || route.durationMin || 1;
  const estimatedDelay = Math.round(duration * (probability / 100));

  return {
    probability,
    level,
    factors,
    estimatedDelay,
    label: getDelayLabel(level),
    color: getDelayColor(level),
  };
}

function getDelayLabel(level) {
  const labels = {
    very_low: "Very Low",
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[level] || "Low";
}

function getDelayColor(level) {
  const colors = {
    very_low: { text: "text-emerald-600", bg: "bg-emerald-50" },
    low: { text: "text-green-600", bg: "bg-green-50" },
    medium: { text: "text-amber-600", bg: "bg-amber-50" },
    high: { text: "text-red-600", bg: "bg-red-50" },
  };
  return colors[level] || colors.low;
}

module.exports = {
  predictDelay,
  getDelayLabel,
  getDelayColor,
};
