const db = require('../config/database');
const logger = require('../utils/logger');

function generateShareCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createShareLink(userId, journeyId, { duration, accessType }) {
  try {
    const tracking = db.findOne('live_tracking', { id: journeyId });
    if (!tracking) {
      logger.warn(`Journey ${journeyId} not found for sharing`);
      return null;
    }

    let shareCode;
    do {
      shareCode = generateShareCode();
    } while (db.findOne('shared_routes', { shareCode }));

    const shareLink = db.insert('shared_routes', {
      userId,
      journeyId,
      shareCode,
      accessType: accessType || 'view',
      duration: duration || 60,
      status: 'active',
      location: tracking.routeData?.source || null,
      destination: tracking.routeData?.destination || null,
      route: tracking.routeData || {},
      liveLocation: null,
      eta: null,
      progress: 0,
      expiresAt: new Date(Date.now() + (duration || 60) * 60000).toISOString(),
    });

    logger.info(`Share link created for user ${userId}: ${shareCode}`);
    return shareLink;
  } catch (err) {
    logger.error('Error creating share link:', err.message);
    throw err;
  }
}

async function getSharedJourney(shareCode) {
  try {
    const shared = db.findOne('shared_routes', { shareCode });
    if (!shared) {
      logger.warn(`Share code ${shareCode} not found`);
      return null;
    }

    if (shared.status !== 'active') {
      logger.warn(`Share code ${shareCode} is no longer active`);
      return null;
    }

    if (new Date(shared.expiresAt) < new Date()) {
      logger.warn(`Share code ${shareCode} has expired`);
      return null;
    }

    return {
      shareCode: shared.shareCode,
      accessType: shared.accessType,
      location: shared.liveLocation || shared.location,
      destination: shared.destination,
      route: shared.route,
      eta: shared.eta,
      progress: shared.progress,
      expiresAt: shared.expiresAt,
    };
  } catch (err) {
    logger.error('Error getting shared journey:', err.message);
    throw err;
  }
}

async function updateSharedLocation(shareCode, { lat, lng, eta, progress }) {
  try {
    const shared = db.findOne('shared_routes', { shareCode });
    if (!shared) {
      logger.warn(`Share code ${shareCode} not found for location update`);
      return null;
    }

    const updates = {};
    if (lat !== undefined && lng !== undefined) updates.liveLocation = { lat, lng };
    if (eta !== undefined) updates.eta = eta;
    if (progress !== undefined) updates.progress = progress;

    const updated = db.update('shared_routes', { shareCode }, updates);
    logger.info(`Shared location updated for ${shareCode}`);
    return updated;
  } catch (err) {
    logger.error('Error updating shared location:', err.message);
    throw err;
  }
}

async function stopSharing(shareCode) {
  try {
    const shared = db.findOne('shared_routes', { shareCode });
    if (!shared) {
      logger.warn(`Share code ${shareCode} not found`);
      return null;
    }

    const updated = db.update('shared_routes', { shareCode }, {
      status: 'inactive',
    });

    logger.info(`Sharing stopped for ${shareCode}`);
    return updated;
  } catch (err) {
    logger.error('Error stopping sharing:', err.message);
    throw err;
  }
}

module.exports = {
  createShareLink,
  getSharedJourney,
  updateSharedLocation,
  stopSharing,
};
