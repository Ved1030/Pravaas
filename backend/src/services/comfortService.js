const logger = require("../utils/logger");
const { getCrowdComfortImpact } = require("./crowdService");

function calculateComfortScore(route, weatherImpact = 0, crowdData = []) {
  if (!route) return { score: 50, level: "moderate", factors: [] };

  const factors = [];
  let score = 100;

  const steps = route.steps || [];
  const totalDuration = route.totalTime || route.durationMin || 0;
  const transfers = route.transfers || 0;

  const walkingDistance = steps
    .filter((s) => s.mode === "walk")
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  const walkingRatio = totalDuration > 0 ? walkingDistance / totalDuration : 0;

  if (walkingRatio > 0.3) {
    const penalty = Math.round(walkingRatio * 40);
    score -= penalty;
    factors.push({ name: "Walking Distance", impact: -penalty, detail: `${walkingDistance} min walking` });
  } else if (walkingRatio > 0.15) {
    const penalty = Math.round(walkingRatio * 20);
    score -= penalty;
    factors.push({ name: "Walking Distance", impact: -penalty, detail: `${walkingDistance} min walking` });
  } else {
    factors.push({ name: "Walking Distance", impact: 0, detail: `${walkingDistance} min walking` });
  }

  if (transfers > 2) {
    const penalty = transfers * 5;
    score -= penalty;
    factors.push({ name: "Transfers", impact: -penalty, detail: `${transfers} transfers` });
  } else if (transfers > 0) {
    const penalty = transfers * 3;
    score -= penalty;
    factors.push({ name: "Transfers", impact: -penalty, detail: `${transfers} transfers` });
  } else {
    factors.push({ name: "Transfers", impact: 0, detail: "Direct route" });
  }

  const crowdComfortImpact = crowdData.reduce((sum, c) => sum + getCrowdComfortImpact(c), 0) / Math.max(crowdData.length, 1);
  if (crowdComfortImpact > 30) {
    score -= Math.round(crowdComfortImpact * 0.3);
    factors.push({ name: "Crowding", impact: -Math.round(crowdComfortImpact * 0.3), detail: "High crowding levels" });
  } else if (crowdComfortImpact > 10) {
    score -= Math.round(crowdComfortImpact * 0.2);
    factors.push({ name: "Crowding", impact: -Math.round(crowdComfortImpact * 0.2), detail: "Moderate crowding" });
  } else {
    factors.push({ name: "Crowding", impact: 0, detail: "Low crowding" });
  }

  if (totalDuration > 60) {
    const penalty = Math.round((totalDuration - 60) * 0.3);
    score -= penalty;
    factors.push({ name: "Duration", impact: -penalty, detail: `${totalDuration} min total` });
  } else if (totalDuration > 30) {
    const penalty = Math.round((totalDuration - 30) * 0.15);
    score -= penalty;
    factors.push({ name: "Duration", impact: -penalty, detail: `${totalDuration} min total` });
  } else {
    factors.push({ name: "Duration", impact: 0, detail: `${totalDuration} min total` });
  }

  if (weatherImpact > 5) {
    score -= weatherImpact * 1.5;
    factors.push({ name: "Weather", impact: -Math.round(weatherImpact * 1.5), detail: `Weather impact: +${weatherImpact} min` });
  } else if (weatherImpact > 0) {
    const wp = weatherImpact;
    score -= wp;
    factors.push({ name: "Weather", impact: -wp, detail: `Weather impact: +${weatherImpact} min` });
  } else {
    factors.push({ name: "Weather", impact: 0, detail: "Favorable conditions" });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level;
  if (score >= 80) level = "high";
  else if (score >= 60) level = "moderate";
  else level = "low";

  return { score, level, factors };
}

function getComfortColor(score) {
  if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-50", stroke: "#10b981", track: "#d1fae5" };
  if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-50", stroke: "#f59e0b", track: "#fef3c7" };
  if (score >= 40) return { text: "text-orange-600", bg: "bg-orange-50", stroke: "#f97316", track: "#fff7ed" };
  return { text: "text-red-600", bg: "bg-red-50", stroke: "#ef4444", track: "#fee2e2" };
}

function getComfortLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Uncomfortable";
}

module.exports = {
  calculateComfortScore,
  getComfortColor,
  getComfortLabel,
};
