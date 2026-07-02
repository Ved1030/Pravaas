const express = require("express");
const router = express.Router();
const journeySummaryController = require("../controllers/journeySummary.controller");

router.get("/", journeySummaryController.getSummary);
router.get("/all", journeySummaryController.getSummaries);
router.post("/generate", journeySummaryController.generateSummary);

module.exports = router;
