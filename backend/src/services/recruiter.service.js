const db = require("../config/database");

function generateCandidates() {
  const names = [
    "Priya Sharma", "Arjun Patel", "Neha Gupta", "Rahul Verma", "Ananya Singh",
    "Vikram Joshi", "Meera Reddy", "Karan Mehta", "Pooja Desai", "Amit Kumar",
    "Sneha Iyer", "Ravi Nair", "Deepa Menon", "Sanjay Rao", "Kavita Bhat",
  ];
  const roles = [
    "Software Engineer", "Product Manager", "Data Scientist", "UX Designer",
    "DevOps Engineer", "ML Engineer", "Frontend Developer", "Backend Developer",
    "QA Engineer", "Tech Lead",
  ];
  const statuses = ["on-way", "arrived", "completed", "no-show", "scheduled"];
  const confidences = ["high", "medium", "low"];

  return names.map((name, i) => {
    const status = statuses[i % statuses.length];
    const confidence = confidences[Math.floor(Math.random() * 3)];
    const delay = status === "on-way" ? Math.floor(Math.random() * 30) : 0;
    const eta = new Date(Date.now() + (delay + Math.floor(Math.random() * 20)) * 60000);

    return {
      id: `cand_${i + 1}`,
      name,
      role: roles[i % roles.length],
      status,
      eta: eta.toISOString(),
      etaFormatted: eta.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      arrivalConfidence: confidence,
      predictedDelay: delay,
      noShowRisk: confidence === "low" ? "high" : confidence === "medium" ? "medium" : "low",
      noShowProbability: confidence === "low" ? 0.75 : confidence === "medium" ? 0.4 : 0.1,
      interviewTime: new Date(Date.now() + (60 + i * 30) * 60000).toISOString(),
      interviewTimeFormatted: new Date(Date.now() + (60 + i * 30) * 60000).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      location: "Building A, Floor " + ((i % 5) + 1),
      interviewer: names[(i + 3) % names.length],
      recommendation: confidence === "low" ? "Consider reschedule to virtual" : confidence === "medium" ? "Send reminder message" : "No action needed",
      virtualSuggested: confidence === "low",
    };
  });
}

function getDashboard() {
  const candidates = generateCandidates();
  const today = candidates;

  const totalInterviews = today.length;
  const arrived = today.filter((c) => c.status === "arrived").length;
  const onWay = today.filter((c) => c.status === "on-way").length;
  const noShows = today.filter((c) => c.status === "no-show").length;
  const noShowRate = totalInterviews > 0 ? Math.round((noShows / totalInterviews) * 100) : 0;
  const avgDelay = Math.round(today.filter((c) => c.predictedDelay > 0).reduce((s, c) => s + c.predictedDelay, 0) / Math.max(onWay, 1));
  const avgArrivalTime = 22 + Math.floor(Math.random() * 10);

  const heatmapData = [
    { location: "Building A, Floor 1", interviews: 4, density: "high" },
    { location: "Building A, Floor 2", interviews: 3, density: "medium" },
    { location: "Building B, Floor 1", interviews: 2, density: "low" },
    { location: "Building A, Floor 3", interviews: 3, density: "medium" },
    { location: "Building B, Floor 2", interviews: 1, density: "low" },
  ];

  const timeline = today.map((c) => ({
    id: c.id,
    name: c.name,
    interviewTime: c.interviewTimeFormatted,
    status: c.status,
    eta: c.etaFormatted,
  }));

  return {
    candidates: today,
    summary: {
      totalInterviews,
      arrived,
      onWay,
      noShows,
      noShowRate,
      avgDelay,
      avgArrivalTime,
    },
    heatmapData,
    timeline,
  };
}

function getCandidates() {
  return generateCandidates();
}

function reschedule(candidateId, newTime) {
  db.insert("recruiter_dashboard", {
    action: "reschedule",
    candidateId,
    newTime,
    timestamp: new Date().toISOString(),
  });
  return { success: true, message: "Interview rescheduled", candidateId, newTime };
}

function suggestVirtual(candidateId) {
  db.insert("recruiter_dashboard", {
    action: "virtual_suggestion",
    candidateId,
    timestamp: new Date().toISOString(),
  });
  return { success: true, message: "Virtual interview suggested", candidateId };
}

module.exports = { getDashboard, getCandidates, reschedule, suggestVirtual };
