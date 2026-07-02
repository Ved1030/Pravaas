const asyncHandler = require('../middlewares/asyncHandler');
const emergencyService = require('../services/emergency.service');

exports.createEmergency = asyncHandler(async (req, res) => {
  const { userId, location, journeyDetails, contacts } = req.body;
  const emergency = await emergencyService.createEmergency(userId, { location, journeyDetails, contacts });
  res.json({ success: true, data: emergency });
});

exports.resolveEmergency = asyncHandler(async (req, res) => {
  const { emergencyId } = req.body;
  const result = await emergencyService.resolveEmergency(emergencyId);
  res.json({ success: true, data: result });
});

exports.getEmergency = asyncHandler(async (req, res) => {
  const { emergencyId } = req.query;
  const emergency = await emergencyService.getEmergency(emergencyId);
  res.json({ success: true, data: emergency });
});

exports.getActiveEmergencies = asyncHandler(async (req, res) => {
  const emergencies = await emergencyService.getActiveEmergencies();
  res.json({ success: true, data: emergencies });
});
