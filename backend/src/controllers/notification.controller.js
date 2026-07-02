const asyncHandler = require("../middlewares/asyncHandler");
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

exports.createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, data } = req.body;
  const notification = await notificationService.createNotification(userId, { type, title, message, data });
  res.json({ success: true, data: notification });
});

exports.markRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.body;
  const result = await notificationService.markRead(notificationId);
  res.json({ success: true, data: result });
});

exports.generateNotifications = asyncHandler(async (req, res) => {
  const { journeyTrackingId, weatherData, trafficData } = req.body;
  const notifications = await notificationService.generateSmartNotifications(journeyTrackingId, weatherData, trafficData);
  res.json({ success: true, data: notifications });
});
