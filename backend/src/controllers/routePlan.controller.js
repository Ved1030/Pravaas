const { generateRoutes } = require("../services/routeEngine");
const { translateToEnglish } = require("../services/language.service");

exports.planRoute = async (req, res) => {
  console.log("POST /api/route/plan hit");
  console.log("Request body:", req.body);

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

    console.log("Original source:", source, "→ Translated:", translatedSource);
    console.log("Original destination:", destination, "→ Translated:", translatedDest);
    if (sourceCoords) {
      console.log("Using source coordinates:", sourceCoords);
    }
    if (translatedStops.length > 0) {
      console.log("Translated stops:", translatedStops);
    }

    const result = await generateRoutes(translatedSource, translatedDest, preferences, translatedStops, sourceCoords);

    res.json(result);
  } catch (err) {
    console.error("Route planning error:", err);
    res.status(500).json({ error: "Failed to plan route. Please try again.", details: err.message });
  }
};
