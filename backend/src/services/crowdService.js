const logger = require("../utils/logger");

const CROWD_LEVELS = ["low", "medium", "high", "very_high"];

const crowdConfig = {
  low: { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500", score: 10 },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500", score: 40 },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-500", score: 70 },
  very_high: { label: "Very High", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", score: 90 },
};

const peakHourCrowd = {
  "06:00-09:00": { base: "high", range: ["high", "very_high"] },
  "09:00-11:00": { base: "medium", range: ["medium", "high"] },
  "11:00-16:00": { base: "low", range: ["low", "medium"] },
  "16:00-19:00": { base: "high", range: ["high", "very_high"] },
  "19:00-21:00": { base: "medium", range: ["medium", "high"] },
  "21:00-06:00": { base: "low", range: ["low", "low"] },
};

function getCurrentCrowdPeriod() {
  const now = new Date();
  const hour = now.getHours();
  const min = now.getMinutes();
  const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

  for (const [period, config] of Object.entries(peakHourCrowd)) {
    const [start, end] = period.split("-");
    if (timeStr >= start && timeStr < end) {
      return config;
    }
    if (end < start && (timeStr >= start || timeStr < end)) {
      return config;
    }
  }

  return { base: "low", range: ["low", "medium"] };
}

function getCrowdLevel(mode, location) {
  const period = getCurrentCrowdPeriod();
  const range = period.range;

  const dayOfWeek = new Date().getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let idx;
  if (isWeekend) {
    idx = 0;
  } else if (mode === "metro") {
    idx = Math.floor(Math.random() * range.length);
  } else if (mode === "bus") {
    idx = Math.min(Math.floor(Math.random() * range.length), range.length - 1);
  } else if (mode === "walk") {
    idx = 0;
  } else {
    idx = Math.min(Math.floor(Math.random() * range.length), range.length - 1);
  }

  const level = range[idx];
  const config = crowdConfig[level] || crowdConfig.low;

  return {
    level,
    label: config.label,
    color: config.color,
    bg: config.bg,
    dot: config.dot,
    score: config.score,
    occupancyPercentage: config.score + Math.round(Math.random() * 20),
    timestamp: new Date().toISOString(),
  };
}

function getCrowdForRoute(routeSteps) {
  if (!routeSteps || routeSteps.length === 0) return [];

  return routeSteps.map((step) => {
    const mode = step.mode || "walk";
    const location = step.label || "unknown";
    return {
      stepIndex: step.stepIndex || 0,
      mode,
      location,
      ...getCrowdLevel(mode, location),
    };
  });
}

function getCrowdComfortImpact(crowdData) {
  if (!crowdData) return 0;
  const level = crowdData.level || "low";
  const impactMap = { low: 0, medium: 15, high: 35, very_high: 50 };
  return impactMap[level] || 0;
}

module.exports = {
  getCrowdLevel,
  getCrowdForRoute,
  getCrowdComfortImpact,
  CROWD_LEVELS,
  crowdConfig,
};
