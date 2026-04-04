const express = require("express");
const router = express.Router();
const controller = require("../controllers/voice.controller");

router.post("/instructions", controller.getVoiceInstructions);

module.exports = router;
