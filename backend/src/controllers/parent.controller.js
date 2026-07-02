const parentService = require("../services/parent.service");

exports.dashboard = async (req, res) => {
  try {
    const data = parentService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load parent dashboard", details: err.message });
  }
};
