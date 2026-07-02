function getDashboard() {
  const classes = [
    { id: "cls_1", name: "Mathematics", time: "08:00", endTime: "08:45", room: "Room 201", teacher: "Mr. Sharma", status: "completed" },
    { id: "cls_2", name: "Physics", time: "09:00", endTime: "09:45", room: "Lab 3", teacher: "Mrs. Iyer", status: "completed" },
    { id: "cls_3", name: "English", time: "10:00", endTime: "10:45", room: "Room 105", teacher: "Ms. Patel", status: "current" },
    { id: "cls_4", name: "Chemistry", time: "11:00", endTime: "11:45", room: "Lab 1", teacher: "Dr. Verma", status: "upcoming" },
    { id: "cls_5", name: "Computer Science", time: "12:00", endTime: "12:45", room: "Computer Lab", teacher: "Mr. Gupta", status: "upcoming" },
    { id: "cls_6", name: "Lunch Break", time: "12:45", endTime: "13:30", room: "Cafeteria", teacher: "", status: "upcoming" },
    { id: "cls_7", name: "History", time: "13:30", endTime: "14:15", room: "Room 302", teacher: "Mrs. Reddy", status: "upcoming" },
  ];

  const attendancePrediction = 92;
  const busTracking = {
    busId: "SCHOOL-BUS-07",
    driver: "Ramesh Kumar",
    driverPhone: "+91 98765 43210",
    status: "on-route",
    currentLocation: "MG Road, 2km from school",
    eta: "07:45 AM",
    stops: [
      { name: "Sector 5", time: "07:15", status: "completed", students: 8 },
      { name: "Sector 8", time: "07:25", status: "completed", students: 6 },
      { name: "Main Road", time: "07:35", status: "current", students: 4 },
      { name: "School Gate", time: "07:50", status: "upcoming", students: 0 },
    ],
  };

  const upcomingExam = {
    subject: "Mathematics",
    date: "2026-07-10",
    day: "Thursday",
    time: "10:00 AM",
    duration: "3 hours",
    venue: "Exam Hall A",
    route: {
      from: "Home",
      to: "Exam Hall A",
      suggestedLeave: "08:30 AM",
      mode: "Bus + Walk",
      duration: "35 min",
    },
  };

  const weatherAlert = {
    active: true,
    type: "rain",
    message: "Heavy rain expected between 2 PM - 5 PM. Carry umbrella.",
    severity: "medium",
  };

  const leaveReminder = {
    pending: 2,
    approved: 5,
    nextHoliday: "Independence Day - August 15",
  };

  const journeyProgress = {
    status: "in-school",
    currentActivity: "Attending English class",
    nextClass: "Chemistry at 11:00 AM",
    safeArrival: true,
    arrivalTime: "07:48 AM",
  };

  return {
    classes,
    attendancePrediction,
    busTracking,
    upcomingExam,
    weatherAlert,
    leaveReminder,
    journeyProgress,
    safeArrival: true,
  };
}

module.exports = { getDashboard };
