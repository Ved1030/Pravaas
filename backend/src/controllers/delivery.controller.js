const deliveryService = require("../services/delivery.service");

exports.dashboard = async (req, res) => {
  try {
    const data = deliveryService.getDashboard();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to load delivery dashboard", details: err.message });
  }
};
