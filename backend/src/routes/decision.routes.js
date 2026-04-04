const express = require("express");
const router = express.Router();
const controller = require("../controllers/decision.controller");

router.post("/recommend", controller.getRecommendation);

module.exports = router;