const routeService = require("../services/route.service");
const confidenceService = require("../services/confidence.service");

exports.getRoutes = (req, res) => {
  const routes = routeService.getAllRoutes();

  const enrichedRoutes = routes.map((route) => ({
    ...route,
    confidence: confidenceService.calculateConfidence(route),
  }));

  res.json(enrichedRoutes);
};