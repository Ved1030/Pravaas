const healthcareService = require("../services/healthcare.service");

exports.dashboard = async (req, res) => {
  try {
    const data = healthcareService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load healthcare dashboard", details: err.message });
  }
};
