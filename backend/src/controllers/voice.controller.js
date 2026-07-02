const asyncHandler = require("../middlewares/asyncHandler");
const { generateVoiceInstructionsForRoute } = require("../services/routeEngine");
const voiceService = require("../services/voice.service");
const logger = require("../utils/logger");

exports.getVoiceInstructions = async (req, res) => {
  logger.debug("POST /api/voice/instructions hit");

  const { route } = req.body;

  if (!route || !route.steps) {
    return res.status(400).json({ error: "route with steps is required" });
  }

  try {
    const instructions = await generateVoiceInstructionsForRoute(route);
    res.json({ instructions });
  } catch (err) {
    logger.error("Voice instruction error:", err.message);
    res.status(500).json({ error: "Failed to generate voice instructions.", details: err.message });
  }
};

exports.processCommand = asyncHandler(async (req, res) => {
  const { userId, command, context } = req.body;
  const result = await voiceService.processCommand(userId, { command, context });
  res.json({ success: true, data: result });
});

exports.logInteraction = asyncHandler(async (req, res) => {
  const { userId, command, response } = req.body;
  const log = await voiceService.logVoiceInteraction(userId, command, response);
  res.json({ success: true, data: log });
});
