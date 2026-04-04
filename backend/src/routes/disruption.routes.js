const express = require("express");
const router = express.Router();
const controller = require("../controllers/disruption.controller");

router.post("/simulate", controller.simulateDelay);
router.post("/", controller.handleDisruption);

module.exports = router;
