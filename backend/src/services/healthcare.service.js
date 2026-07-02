function getDashboard() {
  const emergencyStaff = [
    { id: "doc_1", name: "Dr. Priya Sharma", role: "Cardiologist", status: "on-way", eta: "15 min", delay: 5, location: "Western Express Highway" },
    { id: "doc_2", name: "Dr. Amit Patel", role: "Neurologist", status: "arrived", eta: null, delay: 0, location: "Hospital" },
    { id: "doc_3", name: "Dr. Neha Gupta", role: "Surgeon", status: "on-way", eta: "25 min", delay: 12, location: "BKC Flyover" },
    { id: "doc_4", name: "Nurse Kavita", role: "ICU Nurse", status: "arrived", eta: null, delay: 0, location: "Hospital" },
    { id: "doc_5", name: "Dr. Sanjay Rao", role: "Emergency Physician", status: "delayed", eta: "40 min", delay: 20, location: "Andheri Station" },
    { id: "doc_6", name: "Dr. Meera Reddy", role: "Anesthesiologist", status: "on-way", eta: "10 min", delay: 0, location: "Near Hospital" },
  ];

  const hospitalArrival = {
    totalStaff: 48,
    arrived: 35,
    onWay: 10,
    delayed: 2,
    onLeave: 1,
    shiftStart: "08:00 AM",
    criticalCoverage: "85%",
    erWaitTime: 18,
  };

  const ambulancePriority = [
    { id: "amb_1", type: "Cardiac Emergency", location: "Sector 12", eta: "8 min", priority: "critical", route: "Via Highway - Clear" },
    { id: "amb_2", type: "Accident Victim", location: "MG Road Junction", eta: "12 min", priority: "high", route: "Via Main Road - Moderate Traffic" },
  ];

  const alternativeRoutes = [
    { from: "Andheri", to: "Hospital", primary: { time: 25, distance: 12, traffic: "high" }, alternative: { time: 18, distance: 15, traffic: "low", via: "JV Link Road" } },
    { from: "BKC", to: "Hospital", primary: { time: 15, distance: 6, traffic: "medium" }, alternative: { time: 12, distance: 8, traffic: "low", via: "Bandra-Kurla Complex Road" } },
  ];

  const trafficAlerts = [
    { id: "ta_1", type: "accident", location: "Western Express Highway", severity: "high", message: "Multi-vehicle accident blocking 2 lanes", affected: true, delay: 15 },
    { id: "ta_2", type: "construction", location: "SV Road", severity: "medium", message: "Road work between IIT Junction and Andheri", affected: false, delay: 5 },
  ];

  return {
    emergencyStaff,
    hospitalArrival,
    ambulancePriority,
    alternativeRoutes,
    trafficAlerts,
  };
}

module.exports = { getDashboard };
