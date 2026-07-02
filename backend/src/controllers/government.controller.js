const governmentService = require("../services/government.service");

exports.dashboard = async (req, res) => {
  try {
    const data = governmentService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load government dashboard", details: err.message });
  }
};
