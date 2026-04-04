const routeService = require("../services/route.service");
const disruptionService = require("../services/disruption.service");
const { simulateDelay } = require("../services/routeEngine");
const { generateRoutes } = require("../services/routeEngine");

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

  const routes = routeService.getAllRoutes();
  const updatedRoutes = disruptionService.applyDelay(routes, delay);

  res.json({
    alert: "⚠️ Disruption detected",
    routes: updatedRoutes,
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
      bestRoute
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
    console.error("Disruption handling failed:", error.message);
    res.status(500).json({
      error: "Failed to process disruption",
      message: error.message,
    });
  }
};
