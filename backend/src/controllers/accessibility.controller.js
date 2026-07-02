const asyncHandler = require('../middlewares/asyncHandler');
const accessibilityService = require('../services/accessibility.service');

exports.getSettings = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const settings = await accessibilityService.getSettings(userId);
  res.json({ success: true, data: settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const { userId, ...settings } = req.body;
  const result = await accessibilityService.updateSettings(userId, settings);
  res.json({ success: true, data: result });
});
