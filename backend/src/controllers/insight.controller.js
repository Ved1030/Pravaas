const insightService = require("../services/insight.service");

exports.insights = async (req, res) => {
  try {
    const data = insightService.getInsights();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load insights", details: err.message });
  }
};

exports.predictiveAlerts = async (req, res) => {
  try {
    const data = insightService.getPredictiveAlerts();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load predictive alerts", details: err.message });
  }
};
