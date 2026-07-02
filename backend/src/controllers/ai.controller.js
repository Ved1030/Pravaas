const { generateRoutes } = require("../services/routeEngine");
const { recommendRoute, calculateLeaveTime } = require("../services/recommendationService");
const { compareRoutes } = require("../services/comparisonService");
const { getCurrentWeather } = require("../services/weatherService");
const { getCrowdLevel, getCrowdForRoute } = require("../services/crowdService");
const { predictDelay } = require("../services/predictionService");
const { calculateComfortScore } = require("../services/comfortService");
const { translateToEnglish } = require("../services/language.service");
const db = require("../config/database");
const logger = require("../utils/logger");

exports.recommendRoute = async (req, res) => {
  try {
    const { source, destination, preferences, stops = [] } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    const translatedSource = await translateToEnglish(source);
    const translatedDest = await translateToEnglish(destination);
    const translatedStops = await Promise.all(
      stops.filter((s) => s && s.trim()).map((s) => translateToEnglish(s))
    );

    const routeResult = await generateRoutes(translatedSource, translatedDest, preferences, translatedStops);

    const routes = routeResult?.routes || [];
    if (routes.length === 0) {
      return res.status(404).json({ error: "No routes found" });
    }

    const recommendation = recommendRoute(routes, preferences);

    db.insert("recommendation_logs", {
      source,
      destination,
      preferences,
      recommendedRouteId: recommendation.recommendedRouteId,
      confidence: recommendation.confidence,
      timestamp: new Date().toISOString(),
    });

    res.json({
      ...routeResult,
      aiRecommendation: recommendation,
    });
  } catch (err) {
    logger.error("AI recommend route error:", err.message);
    res.status(500).json({ error: "AI recommendation failed", details: err.message });
  }
};

exports.leaveTime = async (req, res) => {
  try {
    const { source, destination, preferences, stops = [] } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    const translatedSource = await translateToEnglish(source);
    const translatedDest = await translateToEnglish(destination);
    const translatedStops = await Promise.all(
      stops.filter((s) => s && s.trim()).map((s) => translateToEnglish(s))
    );

    const routeResult = await generateRoutes(translatedSource, translatedDest, preferences, translatedStops);

    const routes = routeResult?.routes || [];
    if (routes.length === 0) {
      return res.status(404).json({ error: "No routes found" });
    }

    const recommendation = recommendRoute(routes, preferences);
    const bestRoute = routes.find((r) => r.id === recommendation.recommendedRouteId) || routes[0];
    const leaveTimeData = calculateLeaveTime(bestRoute, preferences);

    db.insert("journey_predictions", {
      source,
      destination,
      routeId: bestRoute.id,
      leaveTime: leaveTimeData.leaveBy,
      arriveBy: leaveTimeData.arriveBy,
      bufferMinutes: leaveTimeData.bufferMinutes,
    });

    res.json({
      ...leaveTimeData,
      route: {
        id: bestRoute.id,
        type: bestRoute.type,
        label: bestRoute.label,
        totalTime: bestRoute.totalTime || bestRoute.durationMin,
        estimatedCost: bestRoute.estimatedCost,
      },
      recommendation: {
        confidence: recommendation.confidence,
        explanation: recommendation.explanation,
      },
    });
  } catch (err) {
    logger.error("AI leave time error:", err.message);
    res.status(500).json({ error: "Leave time calculation failed", details: err.message });
  }
};

exports.weather = async (req, res) => {
  try {
    const weather = getCurrentWeather();
    res.json({ success: true, weather });
  } catch (err) {
    logger.error("Weather fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};

exports.crowd = async (req, res) => {
  try {
    const { mode, location } = req.query;
    const crowd = getCrowdLevel(mode || "metro", location || "unknown");
    res.json({ success: true, crowd });
  } catch (err) {
    logger.error("Crowd fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch crowd data" });
  }
};

exports.crowdForRoute = async (req, res) => {
  try {
    const { steps } = req.body;
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: "steps array is required" });
    }

    const crowdData = getCrowdForRoute(steps);
    res.json({ success: true, crowd: crowdData });
  } catch (err) {
    logger.error("Crowd for route error:", err.message);
    res.status(500).json({ error: "Failed to analyze crowd data" });
  }
};

exports.compare = async (req, res) => {
  try {
    const { source, destination, preferences, stops = [] } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ error: "source and destination are required" });
    }

    const translatedSource = await translateToEnglish(source);
    const translatedDest = await translateToEnglish(destination);
    const translatedStops = await Promise.all(
      stops.filter((s) => s && s.trim()).map((s) => translateToEnglish(s))
    );

    const routeResult = await generateRoutes(translatedSource, translatedDest, preferences, translatedStops);

    const routes = routeResult?.routes || [];
    if (routes.length < 2) {
      return res.status(404).json({ error: "Need at least 2 routes to compare" });
    }

    const comparison = compareRoutes(routes);

    res.json({
      ...routeResult,
      comparison,
    });
  } catch (err) {
    logger.error("AI compare error:", err.message);
    res.status(500).json({ error: "Route comparison failed", details: err.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const { route, weather, crowd } = req.body;

    if (!route) {
      return res.status(400).json({ error: "route data is required" });
    }

    const weatherData = weather || getCurrentWeather();
    const crowdData = crowd || getCrowdForRoute(route.steps || []);
    const weatherImpact = 0;

    const delayPrediction = predictDelay(route, weatherImpact, crowdData);
    const comfortData = calculateComfortScore(route, weatherImpact, crowdData);

    res.json({
      success: true,
      analysis: {
        delayPrediction,
        comfort: comfortData,
        weather: weatherData,
        crowd: crowdData,
      },
    });
  } catch (err) {
    logger.error("AI analyze error:", err.message);
    res.status(500).json({ error: "Route analysis failed" });
  }
};
