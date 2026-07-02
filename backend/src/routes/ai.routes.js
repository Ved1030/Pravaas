const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");

router.post("/recommend-route", aiController.recommendRoute);
router.post("/leave-time", aiController.leaveTime);
router.get("/weather", aiController.weather);
router.get("/crowd", aiController.crowd);
router.post("/crowd", aiController.crowdForRoute);
router.post("/compare", aiController.compare);
router.post("/analyze", aiController.analyze);

module.exports = router;
