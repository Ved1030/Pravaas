function getInsights() {
  const dailyInsights = [
    {
      id: "ins_1",
      type: "time-saving",
      icon: "clock",
      title: "Time Master",
      message: "You saved 48 minutes this week by choosing optimal routes.",
      detail: "Your metro preference saved an average of 12 minutes per trip compared to bus alternatives.",
      impact: "high",
      date: new Date().toISOString(),
    },
    {
      id: "ins_2",
      type: "cost-saving",
      icon: "wallet",
      title: "Smart Saver",
      message: "Metro reduced your travel cost by ₹230 this week.",
      detail: "Choosing metro over cab for 5 trips saved you ₹230 total. That's ₹920 per month!",
      impact: "high",
      date: new Date().toISOString(),
    },
    {
      id: "ins_3",
      type: "weather-warning",
      icon: "cloud-rain",
      title: "Weather Alert",
      message: "Avoid Route A tomorrow due to predicted rain between 2-5 PM.",
      detail: "Heavy rainfall is expected in Western suburbs. Consider leaving 15 minutes earlier or taking the underground metro.",
      impact: "medium",
      date: new Date().toISOString(),
    },
    {
      id: "ins_4",
      type: "behavior",
      icon: "trending-up",
      title: "Pattern Detected",
      message: "You usually leave 18 minutes later than recommended.",
      detail: "Your average departure is 8:48 AM, but optimal is 8:30 AM. Leaving earlier could save 10 minutes daily.",
      impact: "medium",
      date: new Date().toISOString(),
    },
    {
      id: "ins_5",
      type: "eco",
      icon: "leaf",
      title: "Eco Impact",
      message: "You've saved 28.5kg of CO2 this month.",
      detail: "That's equivalent to planting 2 trees! Keep using public transport to reduce your carbon footprint.",
      impact: "low",
      date: new Date().toISOString(),
    },
    {
      id: "ins_6",
      type: "safety",
      icon: "shield",
      title: "Safety Score",
      message: "Your safety score is 94/100 this month.",
      detail: "You've consistently chosen safe routes and traveled during safe hours. Great job!",
      impact: "low",
      date: new Date().toISOString(),
    },
  ];

  const weeklySummary = {
    totalSaved: { time: 48, money: 230, co2: 28.5 },
    topInsight: "Metro is your most efficient mode - 40% faster than bus",
    actionItem: "Try leaving at 8:30 AM instead of 8:48 AM for optimal commute",
    improvement: "+12% efficiency compared to last week",
  };

  return { dailyInsights, weeklySummary };
}

function getPredictiveAlerts() {
  const alerts = [
    {
      id: "pa_1",
      type: "rain",
      title: "Rain Expected Tomorrow",
      message: "Heavy rain predicted between 2 PM - 6 PM in Western suburbs",
      severity: "medium",
      predictedTime: "2026-07-04T14:00:00Z",
      confidence: 85,
      recommendation: "Carry umbrella, consider leaving 15 min earlier",
      affectedRoutes: ["Andheri to BKC", "Bandra to Dadar"],
    },
    {
      id: "pa_2",
      type: "traffic",
      title: "Heavy Traffic Expected",
      message: "Metro Line 1 maintenance scheduled for Saturday. Expect bus congestion.",
      severity: "high",
      predictedTime: "2026-07-05T08:00:00Z",
      confidence: 92,
      recommendation: "Use auto or plan alternative route via Line 2A",
      affectedRoutes: ["Versova to Ghatkopar"],
    },
    {
      id: "pa_3",
      type: "metro-delay",
      title: "Metro Delay Risk",
      message: "Signal maintenance on Line 1 between 10 AM - 2 PM on Friday",
      severity: "medium",
      predictedTime: "2026-07-04T10:00:00Z",
      confidence: 78,
      recommendation: "Board before 9:30 AM or after 2 PM",
      affectedRoutes: ["All Line 1 stations"],
    },
    {
      id: "pa_4",
      type: "festival",
      title: "Festival Crowd Expected",
      message: "Guru Purnima celebrations may cause crowd at major temples and stations",
      severity: "low",
      predictedTime: "2026-07-10T06:00:00Z",
      confidence: 70,
      recommendation: "Avoid Dadar and CST stations during morning hours",
      affectedRoutes: ["Central line stations"],
    },
    {
      id: "pa_5",
      type: "road-closure",
      title: "Road Closure Alert",
      message: "Marine Drive closed for marathon on Sunday 5 AM - 10 AM",
      severity: "medium",
      predictedTime: "2026-07-06T05:00:00Z",
      confidence: 100,
      recommendation: "Use internal roads or metro to reach South Mumbai",
      affectedRoutes: ["South Mumbai routes via Marine Drive"],
    },
  ];

  return { alerts };
}

module.exports = { getInsights, getPredictiveAlerts };
