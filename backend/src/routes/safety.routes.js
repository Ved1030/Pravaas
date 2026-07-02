const express = require("express");
const router = express.Router();
const safetyController = require("../controllers/safety.controller");

router.get("/alerts", safetyController.getSafetyAlerts);
router.post("/score", safetyController.getSafetyScore);
router.post("/safe-route", safetyController.getSafeRoute);

module.exports = router;
