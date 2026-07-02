const analyticsService = require("../services/analytics.service");

exports.getAnalytics = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;
    const data = analyticsService.getAnalytics(period);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analytics", details: err.message });
  }
};
