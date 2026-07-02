const notificationService = require("../services/notification.service");
const logger = require("../utils/logger");

exports.getNotifications = (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "lat and lng query parameters are required",
      });
    }

    const userLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    };

    if (isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      return res.status(400).json({
        error: "Invalid lat or lng values",
      });
    }

    const maxRadius = radius ? parseFloat(radius) : 5;
    const allNotifications = notificationService.getAllNotifications(userLocation);
    const filtered = notificationService.filterByDistance(allNotifications, maxRadius);

    res.json({
      alerts: filtered,
      userLocation,
      radius: maxRadius,
      total: filtered.length,
    });
  } catch (error) {
    logger.error("Notification fetch failed:", error.message);
    res.status(500).json({
      error: "Failed to fetch notifications",
      message: error.message,
    });
  }
};
