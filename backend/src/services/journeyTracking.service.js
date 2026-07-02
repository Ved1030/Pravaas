const db = require('../config/database');
const logger = require('../utils/logger');

async function startJourney(userId, routeData) {
  try {
    const stages = (routeData.steps || []).map((step, i) => ({
      mode: step.mode || 'walk',
      label: step.label || `Step ${i + 1}`,
      distance: step.distance || 0,
      duration: step.duration || 0,
      status: i === 0 ? 'current' : 'upcoming',
      eta: null,
      actualDuration: null,
    }));

    const tracking = db.insert('live_tracking', {
      userId,
      status: 'active',
      currentStageIndex: 0,
      stages,
      routeData,
      startTime: new Date().toISOString(),
      endTime: null,
      totalDuration: routeData.totalTime || 0,
      remainingTime: routeData.totalTime || 0,
      lateArrival: false,
      updatedAt: new Date().toISOString(),
    });

    logger.info(`Journey tracking started for user ${userId}`);
    return tracking;
  } catch (err) {
    logger.error('Error starting journey:', err.message);
    throw err;
  }
}

async function updateProgress(trackingId, currentStageIndex) {
  try {
    const tracking = db.findOne('live_tracking', { id: trackingId });
    if (!tracking) {
      logger.warn(`Tracking ${trackingId} not found`);
      return null;
    }

    const stages = tracking.stages.map((stage, i) => {
      if (i < currentStageIndex) return { ...stage, status: 'completed', actualDuration: stage.duration };
      if (i === currentStageIndex) return { ...stage, status: 'current' };
      return { ...stage, status: 'upcoming' };
    });

    const completedStages = stages.filter(s => s.status === 'completed');
    const remainingStages = stages.filter(s => s.status !== 'completed');
    const remainingTime = remainingStages.reduce((sum, s) => sum + (s.duration || 0), 0);
    const elapsedTime = completedStages.reduce((sum, s) => sum + (s.actualDuration || s.duration || 0), 0);
    const totalDuration = tracking.totalDuration || 1;
    const expectedElapsed = tracking.stages.slice(0, currentStageIndex).reduce((sum, s) => sum + (s.duration || 0), 0);
    const lateArrival = elapsedTime > expectedElapsed * 1.2;

    const updated = db.update('live_tracking', { id: trackingId }, {
      currentStageIndex,
      stages,
      remainingTime,
      lateArrival,
      updatedAt: new Date().toISOString(),
    });

    logger.info(`Journey ${trackingId} progress updated to stage ${currentStageIndex}`);
    return updated;
  } catch (err) {
    logger.error('Error updating journey progress:', err.message);
    throw err;
  }
}

async function endJourney(trackingId) {
  try {
    const tracking = db.findOne('live_tracking', { id: trackingId });
    if (!tracking) {
      logger.warn(`Tracking ${trackingId} not found`);
      return null;
    }

    const endTime = new Date().toISOString();
    const startTime = new Date(tracking.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const actualDuration = Math.round((endMs - startTime) / 60000);

    const stages = tracking.stages.map(s => ({
      ...s,
      status: 'completed',
      actualDuration: s.actualDuration || s.duration,
    }));

    const totalActual = stages.reduce((sum, s) => sum + (s.actualDuration || 0), 0);
    const totalEstimated = tracking.totalDuration || 1;
    const delay = Math.max(0, totalActual - totalEstimated);

    const updated = db.update('live_tracking', { id: trackingId }, {
      status: 'completed',
      stages,
      endTime,
      actualDuration,
      remainingTime: 0,
      delay,
      updatedAt: endTime,
    });

    logger.info(`Journey ${trackingId} ended, duration: ${actualDuration}min`);
    return updated;
  } catch (err) {
    logger.error('Error ending journey:', err.message);
    throw err;
  }
}

async function getLiveTracking(trackingId) {
  try {
    const tracking = db.findOne('live_tracking', { id: trackingId });
    if (!tracking) {
      logger.warn(`Tracking ${trackingId} not found`);
      return null;
    }
    return tracking;
  } catch (err) {
    logger.error('Error getting live tracking:', err.message);
    throw err;
  }
}

async function getTrackingByUser(userId) {
  try {
    const tracking = db.findAll('live_tracking', { userId });
    return tracking.filter(t => t.status === 'active');
  } catch (err) {
    logger.error('Error getting tracking by user:', err.message);
    throw err;
  }
}

module.exports = {
  startJourney,
  updateProgress,
  endJourney,
  getLiveTracking,
  getTrackingByUser,
};
