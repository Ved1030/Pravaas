const express = require("express");
const router = express.Router();
const insightController = require("../controllers/insight.controller");

router.get("/", insightController.insights);
router.get("/predictive-alerts", insightController.predictiveAlerts);

module.exports = router;
