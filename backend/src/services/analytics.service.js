const db = require("../config/database");

function getAnalytics(period = "weekly") {
  const weeklyData = {
    trips: 18,
    totalTravelTime: 540,
    avgTravelTime: 30,
    moneySaved: 1840,
    co2Saved: 28.5,
    confidenceTrend: [82, 85, 79, 88, 91, 86, 84],
    comfortTrend: [75, 78, 72, 80, 85, 77, 81],
    safetyTrend: [90, 92, 88, 94, 96, 91, 93],
    delayTrend: [5, 8, 12, 3, 2, 7, 4],
    modeBreakdown: { metro: 10, bus: 4, walk: 2, auto: 2 },
    dailyTrips: [
      { day: "Mon", trips: 3, time: 85, cost: 90 },
      { day: "Tue", trips: 2, time: 55, cost: 60 },
      { day: "Wed", trips: 4, time: 120, cost: 100 },
      { day: "Thu", trips: 3, time: 95, cost: 75 },
      { day: "Fri", trips: 4, time: 110, cost: 95 },
      { day: "Sat", trips: 1, time: 25, cost: 30 },
      { day: "Sun", trips: 1, time: 50, cost: 45 },
    ],
  };

  const monthlyData = {
    trips: 72,
    totalTravelTime: 2160,
    avgTravelTime: 30,
    moneySaved: 7360,
    co2Saved: 114,
    confidenceTrend: [82, 85, 79, 88, 91, 86, 84, 80, 87, 89, 92, 88, 85, 90, 83, 88, 91, 86, 84, 80, 87, 89, 92, 88, 85, 90, 83, 88, 91, 86],
    comfortTrend: Array(30).fill(0).map(() => 65 + Math.floor(Math.random() * 25)),
    safetyTrend: Array(30).fill(0).map(() => 85 + Math.floor(Math.random() * 12)),
    delayTrend: Array(30).fill(0).map(() => Math.floor(Math.random() * 15)),
    modeBreakdown: { metro: 40, bus: 16, walk: 10, auto: 6 },
  };

  const data = period === "monthly" ? monthlyData : weeklyData;

  return {
    period,
    ...data,
    summary: {
      totalTrips: data.trips,
      avgTravelTime: data.avgTravelTime,
      moneySaved: data.moneySaved,
      co2Saved: data.co2Saved,
      bestDay: "Wednesday",
      worstDay: "Tuesday",
    },
    trends: {
      confidence: data.confidenceTrend,
      comfort: data.comfortTrend,
      safety: data.safetyTrend,
      delay: data.delayTrend,
    },
  };
}

module.exports = { getAnalytics };
