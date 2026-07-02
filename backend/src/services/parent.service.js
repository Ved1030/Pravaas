function getDashboard() {
  const children = [
    {
      id: "child_1",
      name: "Aarav Sharma",
      age: 12,
      grade: "7th Standard",
      school: "Delhi Public School",
      journey: {
        status: "in-transit",
        mode: "School Bus",
        busId: "BUS-12",
        driver: "Suresh Patel",
        driverPhone: "+91 98765 12345",
        currentLocation: "Near Sector 14, 3km from school",
        eta: "08:15 AM",
        departureTime: "07:30 AM",
        progress: 65,
        stops: [
          { name: "Home", time: "07:30", status: "completed" },
          { name: "Sector 10", time: "07:40", status: "completed" },
          { name: "Sector 14", time: "07:50", status: "current" },
          { name: "School Gate", time: "08:15", status: "upcoming" },
        ],
      },
      safeArrival: false,
      lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: "child_2",
      name: "Ananya Sharma",
      age: 9,
      grade: "4th Standard",
      school: "St. Mary's School",
      journey: {
        status: "arrived",
        mode: "Walking",
        currentLocation: "School",
        eta: null,
        departureTime: "07:45 AM",
        progress: 100,
        arrivalTime: "08:02 AM",
      },
      safeArrival: true,
      lastUpdated: new Date(Date.now() - 120 * 60000).toISOString(),
    },
  ];

  const emergencyAlerts = [
    {
      id: "ea_1",
      type: "delay",
      title: "Bus Delayed",
      message: "School Bus BUS-12 is running 10 minutes late due to traffic",
      severity: "medium",
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      read: false,
    },
  ];

  const arrivalNotifications = [
    { childId: "child_2", message: "Ananya safely arrived at school at 08:02 AM", time: "08:02 AM", read: true },
    { childId: "child_1", message: "Aarav's bus departed from home at 07:30 AM", time: "07:30 AM", read: true },
  ];

  const shareSettings = {
    shareWith: ["+91 98765 67890"],
    autoShare: true,
    notifyOnDeparture: true,
    notifyOnArrival: true,
    liveTrackingEnabled: true,
  };

  return {
    children,
    emergencyAlerts,
    arrivalNotifications,
    shareSettings,
  };
}

module.exports = { getDashboard };
