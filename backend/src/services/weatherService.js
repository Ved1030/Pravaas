const logger = require("../utils/logger");

const weatherConditions = [
  { condition: "clear", label: "Clear", icon: "sun", impact: 0, color: "text-yellow-500", bg: "bg-yellow-50" },
  { condition: "cloudy", label: "Cloudy", icon: "cloud", impact: 0, color: "text-gray-500", bg: "bg-gray-50" },
  { condition: "light_rain", label: "Light Rain", icon: "cloud-rain", impact: 3, color: "text-blue-500", bg: "bg-blue-50" },
  { condition: "heavy_rain", label: "Heavy Rain", icon: "cloud-rain", impact: 7, color: "text-indigo-600", bg: "bg-indigo-50" },
  { condition: "fog", label: "Fog", icon: "cloud-fog", impact: 5, color: "text-gray-400", bg: "bg-gray-100" },
  { condition: "haze", label: "Haze", icon: "cloud-fog", impact: 2, color: "text-yellow-600", bg: "bg-yellow-50" },
  { condition: "thunderstorm", label: "Thunderstorm", icon: "cloud-lightning", impact: 10, color: "text-purple-600", bg: "bg-purple-50" },
  { condition: "heatwave", label: "Heat Wave", icon: "sun", impact: 4, color: "text-orange-600", bg: "bg-orange-50" },
  { condition: "windy", label: "Windy", icon: "wind", impact: 2, color: "text-teal-500", bg: "bg-teal-50" },
];

const routeImpactMessages = {
  heavy_rain: ["Reduced visibility", "Slower traffic", "Waterlogging possible"],
  light_rain: ["Slightly wet roads", "Minor delays possible"],
  fog: ["Poor visibility", "Reduced metro/bus speed"],
  thunderstorm: ["Services may be halted", "Severe delays expected"],
  heatwave: ["Uncomfortable waiting", "AC recommended"],
  windy: ["Slight walking difficulty", "Safe for metro/bus"],
  haze: ["Moderate visibility", "Minor impact"],
};

function getCurrentWeather() {
  const hour = new Date().getHours();
  const isMonsoon = Math.random() > 0.6;

  let conditions;
  if (isMonsoon) {
    conditions = ["light_rain", "heavy_rain", "thunderstorm", "cloudy"];
  } else if (hour >= 11 && hour <= 15) {
    conditions = ["clear", "heatwave", "haze"];
  } else if (hour >= 5 && hour <= 8) {
    conditions = ["fog", "haze", "clear"];
  } else {
    conditions = ["clear", "cloudy", "windy"];
  }

  const chosen = conditions[Math.floor(Math.random() * conditions.length)];
  const conditionData = weatherConditions.find((w) => w.condition === chosen) || weatherConditions[0];

  const impacts = routeImpactMessages[chosen] || ["No significant weather impact"];

  const temperature = Math.round(22 + Math.random() * 14);
  const humidity = Math.round(50 + Math.random() * 40);

  return {
    condition: chosen,
    label: conditionData.label,
    icon: conditionData.icon,
    impact: conditionData.impact,
    color: conditionData.color,
    bg: conditionData.bg,
    temperature,
    humidity,
    impacts,
    visibility: chosen === "fog" ? `${Math.round(0.5 + Math.random() * 1.5)} km` : `${Math.round(5 + Math.random() * 10)} km`,
    timestamp: new Date().toISOString(),
  };
}

function getWeatherImpactForRoute(routeSteps, weather) {
  if (!routeSteps || !weather) return { totalDelay: 0, segments: [] };

  const impact = weather.impact || 0;
  const segments = routeSteps.map((step) => {
    const mode = step.mode || "walk";
    const duration = step.duration || 0;
    let delayImpact = 0;

    if (mode === "walk" || mode === "auto") {
      delayImpact = Math.round(duration * (impact / 100));
    } else if (mode === "bus") {
      delayImpact = Math.round(duration * (impact / 80));
    } else if (mode === "metro" || mode === "train") {
      delayImpact = Math.round(duration * (impact / 120));
    } else if (mode === "cab") {
      delayImpact = Math.round(duration * (impact / 90));
    }

    return {
      mode,
      originalDuration: duration,
      delayImpact,
      impactLevel: delayImpact > 5 ? "high" : delayImpact > 2 ? "medium" : "low",
    };
  });

  return {
    totalDelay: segments.reduce((s, seg) => s + seg.delayImpact, 0),
    segments,
    weather,
  };
}

function getWeatherCacheKey(location) {
  return `weather_${location}`;
}

module.exports = {
  getCurrentWeather,
  getWeatherImpactForRoute,
  getWeatherCacheKey,
  weatherConditions,
};
