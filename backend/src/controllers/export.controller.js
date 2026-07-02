const exportService = require("../services/export.service");

exports.exportPDF = async (req, res) => {
  try {
    const { type = "journey", data } = req.body;
    const report = exportService.generatePDFReport(type, data);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "PDF export failed", details: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const { type = "journey", data } = req.body;
    const report = exportService.generateCSVReport(type, data);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "CSV export failed", details: err.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { type = "journey", data } = req.body;
    const report = exportService.generateExcelReport(type, data);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: "Excel export failed", details: err.message });
  }
};

exports.reports = async (req, res) => {
  try {
    const reports = exportService.getReports();
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ error: "Failed to load reports", details: err.message });
  }
};
