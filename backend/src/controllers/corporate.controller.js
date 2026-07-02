const corporateService = require("../services/corporate.service");

exports.dashboard = async (req, res) => {
  try {
    const data = corporateService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load corporate dashboard", details: err.message });
  }
};
