const db = require('../config/database');
const logger = require('../utils/logger');

async function createEmergency(userId, { location, journeyDetails, contacts }) {
  try {
    const emergency = db.insert('emergency_events', {
      userId,
      location,
      journeyDetails: journeyDetails || {},
      contacts: contacts || [],
      status: 'active',
      timestamp: new Date().toISOString(),
      resolvedAt: null,
    });

    logger.info(`Emergency created for user ${userId}`);
    return emergency;
  } catch (err) {
    logger.error('Error creating emergency:', err.message);
    throw err;
  }
}

async function resolveEmergency(emergencyId) {
  try {
    const emergency = db.findOne('emergency_events', { id: emergencyId });
    if (!emergency) {
      logger.warn(`Emergency ${emergencyId} not found`);
      return null;
    }

    const updated = db.update('emergency_events', { id: emergencyId }, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });

    logger.info(`Emergency ${emergencyId} resolved`);
    return updated;
  } catch (err) {
    logger.error('Error resolving emergency:', err.message);
    throw err;
  }
}

async function getEmergency(emergencyId) {
  try {
    const emergency = db.findOne('emergency_events', { id: emergencyId });
    if (!emergency) {
      logger.warn(`Emergency ${emergencyId} not found`);
      return null;
    }
    return emergency;
  } catch (err) {
    logger.error('Error getting emergency:', err.message);
    throw err;
  }
}

async function getActiveEmergencies() {
  try {
    return db.findAll('emergency_events', { status: 'active' });
  } catch (err) {
    logger.error('Error getting active emergencies:', err.message);
    throw err;
  }
}

module.exports = {
  createEmergency,
  resolveEmergency,
  getEmergency,
  getActiveEmergencies,
};
