const disruptionService = require("../services/disruption.service");
const { simulateDelay, generateRoutes } = require("../services/routeEngine");
const logger = require("../utils/logger");

exports.simulateDelay = (req, res) => {
  const { delay, mode } = req.body;

  if (mode) {
    const delayMin = simulateDelay(mode);
    return res.json({
      alert: `⚠️ ${mode} disruption detected`,
      mode,
      delayMin,
      message: `Expected delay: ${delayMin} minutes for ${mode} service`,
    });
  }

  if (!delay && delay !== 0) {
    return res.status(400).json({
      error: "Either 'mode' or 'delay' must be provided",
    });
  }

  // Generic delay simulation without a specific route snapshot
  return res.json({
    alert: "⚠️ Disruption detected",
    delay,
    message: `A delay of ${delay} minutes has been applied to all services`,
    routes: [],
  });
};

exports.handleDisruption = async (req, res) => {
  try {
    const { source, destination, currentLocation, issueType } = req.body;

    if (!source || !destination) {
      return res.status(400).json({
        error: "source and destination are required",
      });
    }

    const routeData = await generateRoutes(source, destination, req.body.preferences);

    const bestRoute = routeData.routes[0];

    if (!bestRoute) {
      return res.status(404).json({
        error: "No route found for the given locations",
      });
    }

    const result = disruptionService.handleDisruption(
      { source, destination, currentLocation, issueType },
      bestRoute,
      routeData.routes   // pass all variants so smart-switch can score alternatives
    );

    res.json({
      alert: `⚠️ ${issueType || "disruption"} detected on route`,
      issueType,
      source,
      destination,
      currentLocation,
      ...result,
    });
  } catch (error) {
    logger.error("Disruption handling failed:", error.message);
    res.status(500).json({
      error: "Failed to process disruption",
      message: error.message,
    });
  }
};
