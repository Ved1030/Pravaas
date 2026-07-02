const { generateRoutes } = require("../services/routeEngine");
const { translateToEnglish } = require("../services/language.service");
const logger = require("../utils/logger");

exports.planRoute = async (req, res) => {
  logger.debug("POST /api/route/plan hit");
  logger.debug("Request body:", req.body);

  const { source = "", destination = "", stops = [], sourceCoords = null } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ error: "source and destination are required" });
  }

  try {
    const { preferences } = req.body;

    const translatedSource = await translateToEnglish(source);
    const translatedDest = await translateToEnglish(destination);
    const translatedStops = await Promise.all(
      stops.filter((s) => s && s.trim()).map((s) => translateToEnglish(s))
    );

    logger.debug("Original source:", source, "→ Translated:", translatedSource);
    logger.debug("Original destination:", destination, "→ Translated:", translatedDest);
    if (sourceCoords) {
      logger.debug("Using source coordinates:", sourceCoords);
    }
    if (translatedStops.length > 0) {
      logger.debug("Translated stops:", translatedStops);
    }

    const result = await generateRoutes(translatedSource, translatedDest, preferences, translatedStops, sourceCoords);

    res.json(result);
  } catch (err) {
    logger.error("Route planning error:", err.message);
    res.status(500).json({ error: "Failed to plan route. Please try again.", details: err.message });
  }
};
