const asyncHandler = require('../middlewares/asyncHandler');
const journeySummaryService = require('../services/journeySummary.service');

exports.getSummary = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const summary = await journeySummaryService.getSummary(id);
  res.json({ success: true, data: summary });
});

exports.getSummaries = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const summaries = await journeySummaryService.getSummariesByUser(userId);
  res.json({ success: true, data: summaries });
});

exports.generateSummary = asyncHandler(async (req, res) => {
  const { trackingId, journeyData } = req.body;
  const summary = await journeySummaryService.generateSummary(trackingId, journeyData);
  res.json({ success: true, data: summary });
});
