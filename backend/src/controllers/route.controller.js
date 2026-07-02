const routeService = require("../services/route.service");
const confidenceService = require("../services/confidence.service");
const logger = require("../utils/logger");

exports.getRoutes = (req, res) => {
  try {
    const routes = routeService.getAllRoutes();

    if (!Array.isArray(routes)) {
      logger.error("getRoutes: routeService.getAllRoutes() did not return an array");
      return res.status(500).json({
        success: false,
        message: "Internal error: routes data is invalid",
      });
    }

    const enrichedRoutes = routes.map((route) => {
      if (!route || typeof route !== "object") {
        logger.error("getRoutes: invalid route entry in array", route);
        return null;
      }
      try {
        return {
          ...route,
          confidence: confidenceService.calculateConfidence(route),
        };
      } catch (err) {
        logger.error("getRoutes: confidence calculation failed for route", route.id, err.message);
        return {
          ...route,
          confidence: 50,
        };
      }
    }).filter(Boolean);

    res.json(enrichedRoutes);
  } catch (err) {
    logger.error("getRoutes: unexpected error", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
    });
  }
};