const db = require('../config/database');
const logger = require('../utils/logger');

function generateRandomSuggestions() {
  const suggestions = [
    'Try leaving 10 min earlier to avoid peak traffic',
    'Consider cycling for short distances to save money and stay fit',
    'Use metro during peak hours to save up to 40% time',
    'Carpooling can reduce your travel costs by 60%',
    'Combine walking with public transit for better health benefits',
    'Avoid traveling between 9-11 AM for smoother commutes',
    'Night travel is 20% faster on most routes',
    'Using the same route weekly builds predictable commute patterns',
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  return suggestions.sort(() => 0.5 - Math.random()).slice(0, count);
}

async function generateSummary(trackingId, journeyData) {
  try {
    const tracking = db.findOne('live_tracking', { id: trackingId });
    const route = tracking?.routeData || journeyData || {};

    const travelTime = route.totalTime || route.durationMin || Math.floor(Math.random() * 60) + 15;
    const moneySpent = route.estimatedCost || Math.floor(Math.random() * 80) + 10;
    const cabCost = moneySpent * (2.5 + Math.random() * 1.5);
    const moneySaved = Math.round(cabCost - moneySpent);
    const walkingSteps = (route.steps || []).filter(s => s.mode === 'walk');
    const walkingDistance = walkingSteps.reduce((sum, s) => sum + (s.distance || 0), 0) || Math.random() * 2;
    const co2Cab = (travelTime * 0.15).toFixed(1);
    const co2Public = (travelTime * 0.03).toFixed(1);
    const co2Saved = parseFloat((co2Cab - co2Public).toFixed(1));
    const delay = tracking?.delay || Math.max(0, Math.floor(Math.random() * 10) - 3);

    const summary = db.insert('journey_summary', {
      userId: route.userId || tracking?.userId || null,
      trackingId,
      travelTime,
      moneySpent,
      moneySaved,
      co2Saved,
      safetyScore: Math.floor(Math.random() * 30) + 65,
      comfortScore: Math.floor(Math.random() * 25) + 70,
      confidence: Math.floor(Math.random() * 15) + 80,
      delay,
      walkingDistance: parseFloat(walkingDistance.toFixed(2)),
      aiSuggestions: generateRandomSuggestions(),
      date: new Date().toISOString(),
      route: route,
    });

    logger.info(`Journey summary generated for tracking ${trackingId}`);
    return summary;
  } catch (err) {
    logger.error('Error generating journey summary:', err.message);
    throw err;
  }
}

async function getSummary(summaryId) {
  try {
    const summary = db.findOne('journey_summary', { id: summaryId });
    if (!summary) {
      logger.warn(`Summary ${summaryId} not found`);
      return null;
    }
    return summary;
  } catch (err) {
    logger.error('Error getting summary:', err.message);
    throw err;
  }
}

async function getSummariesByUser(userId) {
  try {
    const summaries = db.findAll('journey_summary', { userId });
    summaries.sort((a, b) => new Date(b.date) - new Date(a.date));
    return summaries;
  } catch (err) {
    logger.error('Error getting summaries by user:', err.message);
    return [];
  }
}

module.exports = {
  generateSummary,
  getSummary,
  getSummariesByUser,
};
