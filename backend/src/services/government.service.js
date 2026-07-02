function getDashboard() {
  const cityAnalytics = {
    population: 20700000,
    activeCommuters: 8500000,
    publicTransportUsers: 3200000,
    avgCommuteTime: 42,
    congestionIndex: 72,
    airQualityIndex: 156,
  };

  const trafficHeatmap = [
    { zone: "South Mumbai", congestion: 85, vehicles: 125000, avgSpeed: 12 },
    { zone: "Western Suburbs", congestion: 78, vehicles: 98000, avgSpeed: 18 },
    { zone: "Eastern Suburbs", congestion: 65, vehicles: 72000, avgSpeed: 22 },
    { zone: "Central Mumbai", congestion: 72, vehicles: 85000, avgSpeed: 15 },
    { zone: "Navi Mumbai", congestion: 45, vehicles: 45000, avgSpeed: 30 },
    { zone: "Thane", congestion: 55, vehicles: 52000, avgSpeed: 25 },
  ];

  const floodZones = [
    { id: "fz_1", area: "Hindmata", level: "high", waterLevel: 2.5, status: "active" },
    { id: "fz_2", area: "Sion", level: "medium", waterLevel: 1.2, status: "monitoring" },
    { id: "fz_3", area: "King Circle", level: "low", waterLevel: 0.5, status: "normal" },
    { id: "fz_4", area: "Worli", level: "medium", waterLevel: 1.0, status: "monitoring" },
  ];

  const metroCongestion = [
    { line: "Line 1 (Versova-AGNE)", occupancy: 85, status: "crowded", nextTrain: "2 min" },
    { line: "Line 2A (DN Nagar-Andheri West)", occupancy: 62, status: "moderate", nextTrain: "4 min" },
    { line: "Line 7A (Andheri East-DBC)", occupancy: 78, status: "crowded", nextTrain: "3 min" },
    { line: "Line 3 (Aqua Line)", occupancy: 45, status: "comfortable", nextTrain: "5 min" },
  ];

  const crowdDensity = [
    { location: "CST Station", density: "very-high", count: 15000, trend: "increasing" },
    { location: "Bandra Station", density: "high", count: 12000, trend: "stable" },
    { location: "Andheri Station", density: "high", count: 11000, trend: "decreasing" },
    { location: "Dadar Station", density: "very-high", count: 18000, trend: "increasing" },
  ];

  const roadClosures = [
    { id: "rc_1", road: "Marine Drive", reason: "VIP Movement", from: "10:00 AM", to: "12:00 PM", status: "active" },
    { id: "rc_2", road: "Pedder Road", reason: "Construction", from: "06:00 AM", to: "06:00 PM", status: "active" },
  ];

  const accidentClusters = [
    { location: "Western Express Highway km 12", count: 5, period: "last 30 days", severity: "high" },
    { location: "Eastern Freeway entry", count: 3, period: "last 30 days", severity: "medium" },
  ];

  const emergencyVehicles = [
    { id: "ev_1", type: "Ambulance", location: "Western Express", destination: "Breach Candy Hospital", eta: "12 min", status: "active" },
    { id: "ev_2", type: "Fire Truck", location: "Dadar", destination: "Lower Parel", eta: "18 min", status: "active" },
  ];

  const signalStatus = [
    { junction: "Hindmata Signal", status: "green", cycle: "90 sec", congestion: "high" },
    { junction: "Dadar TT Circle", status: "red", cycle: "120 sec", congestion: "medium" },
    { junction: "Bandra Linking Road", status: "green", cycle: "75 sec", congestion: "low" },
  ];

  return {
    cityAnalytics,
    trafficHeatmap,
    floodZones,
    metroCongestion,
    crowdDensity,
    roadClosures,
    accidentClusters,
    emergencyVehicles,
    signalStatus,
  };
}

module.exports = { getDashboard };
