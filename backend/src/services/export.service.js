const db = require("../config/database");

function generatePDFReport(type, data) {
  const report = {
    id: `rpt_${Date.now()}`,
    type,
    format: "pdf",
    generatedAt: new Date().toISOString(),
    status: "completed",
    downloadUrl: `/api/reports/download/rpt_${Date.now()}.pdf`,
    size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
    pages: Math.floor(Math.random() * 10) + 3,
    summary: getReportSummary(type),
  };

  db.insert("reports", report);
  return report;
}

function generateCSVReport(type, data) {
  const report = {
    id: `rpt_${Date.now()}`,
    type,
    format: "csv",
    generatedAt: new Date().toISOString(),
    status: "completed",
    downloadUrl: `/api/reports/download/rpt_${Date.now()}.csv`,
    size: `${(Math.random() * 1 + 0.2).toFixed(1)} MB`,
    rows: Math.floor(Math.random() * 500) + 50,
    summary: getReportSummary(type),
  };

  db.insert("reports", report);
  return report;
}

function generateExcelReport(type, data) {
  const report = {
    id: `rpt_${Date.now()}`,
    type,
    format: "excel",
    generatedAt: new Date().toISOString(),
    status: "completed",
    downloadUrl: `/api/reports/download/rpt_${Date.now()}.xlsx`,
    size: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
    sheets: Math.floor(Math.random() * 4) + 1,
    summary: getReportSummary(type),
  };

  db.insert("reports", report);
  return report;
}

function getReportSummary(type) {
  const summaries = {
    journey: {
      title: "Journey Report",
      totalTrips: 72,
      avgTime: "30 min",
      totalSaved: "₹7,360",
      period: "Last 30 days",
    },
    analytics: {
      title: "Analytics Report",
      metrics: "Travel time, cost, CO2, comfort",
      period: "Last 30 days",
      insights: 12,
    },
    recruiter: {
      title: "Recruiter Report",
      totalInterviews: 45,
      noShowRate: "8%",
      avgArrivalTime: "22 min early",
      period: "Last 7 days",
    },
    employee: {
      title: "Employee Commute Report",
      totalEmployees: 200,
      attendanceRate: "94%",
      avgCommute: "35 min",
      period: "Last 30 days",
    },
  };

  return summaries[type] || summaries.journey;
}

function getReports() {
  return db.findAll("reports").slice(-20).reverse();
}

module.exports = { generatePDFReport, generateCSVReport, generateExcelReport, getReports };
