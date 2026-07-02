const asyncHandler = require('../middlewares/asyncHandler');
const journeyTrackingService = require('../services/journeyTracking.service');
const journeySummaryService = require('../services/journeySummary.service');

exports.startJourney = asyncHandler(async (req, res) => {
  const { userId, routeData } = req.body;
  const trackingRecord = await journeyTrackingService.startJourney(userId, routeData);
  res.json({ success: true, data: trackingRecord });
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const { trackingId, currentStageIndex } = req.body;
  const updated = await journeyTrackingService.updateProgress(trackingId, currentStageIndex);
  res.json({ success: true, data: updated });
});

exports.endJourney = asyncHandler(async (req, res) => {
  const { trackingId } = req.body;
  const tracking = await journeyTrackingService.endJourney(trackingId);
  const summary = await journeySummaryService.generateSummary(trackingId, tracking);
  res.json({ success: true, data: { ...tracking, summary } });
});

exports.getLiveTracking = asyncHandler(async (req, res) => {
  const { trackingId } = req.query;
  const trackingState = await journeyTrackingService.getLiveTracking(trackingId);
  res.json({ success: true, data: trackingState });
});

exports.getUserTracking = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const trackingList = await journeyTrackingService.getTrackingByUser(userId);
  res.json({ success: true, data: trackingList });
});
