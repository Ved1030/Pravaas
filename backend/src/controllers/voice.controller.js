const { generateVoiceInstructionsForRoute } = require("../services/routeEngine");
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
