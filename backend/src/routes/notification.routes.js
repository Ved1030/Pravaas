const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);
router.post("/mark-read", notificationController.markRead);
router.post("/generate", notificationController.generateNotifications);

module.exports = router;
