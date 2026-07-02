const express = require("express");
const router = express.Router();
const controller = require("../controllers/voice.controller");

router.post("/instructions", controller.getVoiceInstructions);
router.post("/command", controller.processCommand);
router.post("/log", controller.logInteraction);

module.exports = router;
