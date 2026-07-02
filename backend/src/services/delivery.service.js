function getDashboard() {
  const orders = [
    { id: "ord_1", customer: "Rahul M.", items: 3, pickup: "MG Road Restaurant", drop: "Sector 14, Apt 5B", distance: 4.2, payment: 85, status: "pending", priority: "normal" },
    { id: "ord_2", customer: "Priya K.", items: 1, pickup: "Central Mall Food Court", drop: "Sunrise Apartments", distance: 2.8, payment: 65, status: "assigned", priority: "express" },
    { id: "ord_3", customer: "Amit S.", items: 5, pickup: "Green Valley Market", drop: "Hill View Colony", distance: 6.1, payment: 120, status: "pending", priority: "normal" },
    { id: "ord_4", customer: "Neha P.", items: 2, pickup: "Spice Garden", drop: "Lake View Tower", distance: 3.5, payment: 75, status: "pending", priority: "normal" },
    { id: "ord_5", customer: "Vikram R.", items: 1, pickup: "Quick Mart", drop: "Sunrise Apartments", distance: 1.8, payment: 45, status: "delivered", priority: "normal" },
  ];

  const traffic = {
    level: "medium",
    congestedAreas: ["MG Road", "Sector 5 Circle", "Main Market"],
    estimatedDelay: 8,
    bestTimeToTravel: "Before 11:00 AM or after 2:00 PM",
  };

  const incomePrediction = {
    today: 580,
    thisWeek: 3850,
    thisMonth: 15200,
    avgPerOrder: 78,
    tips: 320,
    bonus: 150,
    projectedMonthly: 16500,
  };

  const fuelEstimate = {
    currentPrice: 102.50,
    dailyEstimate: 180,
    weeklyEstimate: 1100,
    monthlyEstimate: 4500,
    efficiency: "32 km/l",
    totalDistanceToday: 28.5,
  };

  const bestZones = [
    { name: "MG Road", orders: 12, avgPayment: 95, distance: 2.1 },
    { name: "Central Mall Area", orders: 8, avgPayment: 70, distance: 1.5 },
    { name: "Sector 14", orders: 6, avgPayment: 85, distance: 3.2 },
    { name: "Sunrise Colony", orders: 5, avgPayment: 60, distance: 1.8 },
    { name: "Lake View Area", orders: 4, avgPayment: 75, distance: 2.5 },
  ];

  const peakHours = [
    { hour: "12:00 - 13:00", demand: "high", surge: 1.5 },
    { hour: "13:00 - 14:00", demand: "high", surge: 1.3 },
    { hour: "19:00 - 20:00", demand: "high", surge: 1.8 },
    { hour: "20:00 - 21:00", demand: "medium", surge: 1.2 },
    { hour: "10:00 - 11:00", demand: "medium", surge: 1.0 },
  ];

  const analytics = {
    totalDeliveries: 245,
    avgDeliveryTime: 22,
    onTimeRate: 94,
    customerRating: 4.7,
    totalEarnings: 18500,
    avgDistance: 3.8,
  };

  return {
    orders,
    traffic,
    incomePrediction,
    fuelEstimate,
    bestZones,
    peakHours,
    analytics,
  };
}

module.exports = { getDashboard };
