const asyncHandler = require('../middlewares/asyncHandler');
const safetyService = require('../services/safety.service');

exports.getSafetyAlerts = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;
  const alerts = await safetyService.getSafetyAlerts(parseFloat(lat), parseFloat(lng), radius ? parseFloat(radius) : undefined);
  res.json({ success: true, data: alerts });
});

exports.getSafetyScore = asyncHandler(async (req, res) => {
  const { route, womenSafeMode } = req.body;
  const result = await safetyService.getSafetyScore(route, womenSafeMode);
  res.json({ success: true, data: result });
});

exports.getSafeRoute = asyncHandler(async (req, res) => {
  const { route, womenSafeMode } = req.body;
  const result = await safetyService.getSafeRoute(route, womenSafeMode);
  res.json({ success: true, data: result });
});
