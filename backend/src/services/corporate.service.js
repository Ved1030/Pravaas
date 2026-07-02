const db = require("../config/database");

function generateEmployees() {
  const names = [
    "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Reddy", "Vikram Singh",
    "Neha Gupta", "Sanjay Mehta", "Kavita Iyer", "Deepak Nair", "Ananya Desai",
    "Rohan Joshi", "Meera Bhat", "Arjun Rao", "Pooja Menon", "Karan Verma",
    "Ishita Agarwal", "Nikhil Tiwari", "Shruti Pillai", "Aditya Kulkarni", "Divya Chatterjee",
  ];
  const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
  const statuses = ["arrived", "on-way", "late", "remote", "leave"];

  return names.map((name, i) => {
    const status = statuses[i % statuses.length];
    const delay = status === "late" ? Math.floor(Math.random() * 30) + 10 : 0;
    return {
      id: `emp_${i + 1}`,
      name,
      department: departments[i % departments.length],
      status,
      delay,
      arrivalTime: status === "arrived" ? `0${8 + (i % 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : null,
      commuteMode: ["metro", "bus", "auto", "car", "walk"][i % 5],
    };
  });
}

function getDashboard() {
  const employees = generateEmployees();
  const total = employees.length;
  const arrived = employees.filter((e) => e.status === "arrived").length;
  const onWay = employees.filter((e) => e.status === "on-way").length;
  const late = employees.filter((e) => e.status === "late").length;
  const remote = employees.filter((e) => e.status === "remote").length;
  const onLeave = employees.filter((e) => e.status === "leave").length;

  const attendanceRate = Math.round(((arrived + onWay + late) / total) * 100);
  const lateRate = Math.round((late / total) * 100);

  const peakHour = "09:00 - 09:30";
  const parkingOccupancy = Math.floor(Math.random() * 30) + 60;
  const rainImpact = "Moderate - 15% may be delayed";

  const hybridRecommendation = lateRate > 20
    ? "Consider extending hybrid work policy due to high commute delays"
    : "Current hybrid policy is effective";

  const commuteBreakdown = {
    metro: employees.filter((e) => e.commuteMode === "metro").length,
    bus: employees.filter((e) => e.commuteMode === "bus").length,
    auto: employees.filter((e) => e.commuteMode === "auto").length,
    car: employees.filter((e) => e.commuteMode === "car").length,
    walk: employees.filter((e) => e.commuteMode === "walk").length,
  };

  const travelHeatmap = [
    { zone: "Andheri", employees: 8, avgTime: 35 },
    { zone: "BKC", employees: 12, avgTime: 0 },
    { zone: "Dadar", employees: 5, avgTime: 25 },
    { zone: "Bandra", employees: 6, avgTime: 20 },
    { zone: "Powai", employees: 4, avgTime: 15 },
    { zone: "Thane", employees: 3, avgTime: 45 },
    { zone: "Navi Mumbai", employees: 2, avgTime: 50 },
  ];

  return {
    employees,
    summary: {
      total,
      arrived,
      onWay,
      late,
      remote,
      onLeave,
      attendanceRate,
      lateRate,
      peakHour,
      parkingOccupancy,
      rainImpact,
      hybridRecommendation,
    },
    commuteBreakdown,
    travelHeatmap,
  };
}

module.exports = { getDashboard };
