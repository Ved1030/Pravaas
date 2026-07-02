const express = require("express");
const router = express.Router();
const journeyTrackingController = require("../controllers/journeyTracking.controller");

router.post("/start", journeyTrackingController.startJourney);
router.post("/end", journeyTrackingController.endJourney);
router.post("/progress", journeyTrackingController.updateProgress);
router.get("/live", journeyTrackingController.getLiveTracking);
router.get("/user", journeyTrackingController.getUserTracking);

module.exports = router;
