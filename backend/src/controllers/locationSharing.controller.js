const asyncHandler = require('../middlewares/asyncHandler');
const locationSharingService = require('../services/locationSharing.service');

exports.createShareLink = asyncHandler(async (req, res) => {
  const { userId, journeyId, duration, accessType } = req.body;
  const shareLink = await locationSharingService.createShareLink(userId, journeyId, { duration, accessType });
  res.json({ success: true, data: shareLink });
});

exports.getSharedJourney = asyncHandler(async (req, res) => {
  const { shareCode } = req.query;
  const journey = await locationSharingService.getSharedJourney(shareCode);
  res.json({ success: true, data: journey });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { shareCode, lat, lng, eta, progress } = req.body;
  const result = await locationSharingService.updateSharedLocation(shareCode, { lat, lng, eta, progress });
  res.json({ success: true, data: result });
});

exports.stopSharing = asyncHandler(async (req, res) => {
  const { shareCode } = req.body;
  const result = await locationSharingService.stopSharing(shareCode);
  res.json({ success: true, data: result });
});
