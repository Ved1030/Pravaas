const { generateVoiceInstructionsForRoute } = require("../services/routeEngine");

exports.getVoiceInstructions = async (req, res) => {
  console.log("POST /api/voice/instructions hit");

  const { route } = req.body;

  if (!route || !route.steps) {
    return res.status(400).json({ error: "route with steps is required" });
  }

  try {
    const instructions = await generateVoiceInstructionsForRoute(route);
    res.json({ instructions });
  } catch (err) {
    console.error("Voice instruction error:", err);
    res.status(500).json({ error: "Failed to generate voice instructions.", details: err.message });
  }
};
