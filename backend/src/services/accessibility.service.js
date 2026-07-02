const db = require('../config/database');
const logger = require('../utils/logger');

const DEFAULT_SETTINGS = {
  highContrast: false,
  largeText: false,
  voiceNavigation: false,
  keyboardNavigation: false,
  screenReader: false,
  colorBlindSupport: false,
};

async function getSettings(userId) {
  try {
    const prefs = db.findOne('user_preferences', { userId });
    if (!prefs || !prefs.accessibility) {
      return { userId, ...DEFAULT_SETTINGS };
    }
    return { userId, ...DEFAULT_SETTINGS, ...prefs.accessibility };
  } catch (err) {
    logger.error('Error getting accessibility settings:', err.message);
    return { userId, ...DEFAULT_SETTINGS };
  }
}

async function updateSettings(userId, settings) {
  try {
    const validKeys = Object.keys(DEFAULT_SETTINGS);
    const cleanSettings = {};
    for (const key of validKeys) {
      if (settings[key] !== undefined) {
        cleanSettings[key] = !!settings[key];
      }
    }

    let prefs = db.findOne('user_preferences', { userId });
    if (prefs) {
      const existing = prefs.accessibility || {};
      const merged = { ...DEFAULT_SETTINGS, ...existing, ...cleanSettings };
      db.update('user_preferences', { userId }, { accessibility: merged });
    } else {
      const merged = { ...DEFAULT_SETTINGS, ...cleanSettings };
      db.insert('user_preferences', { userId, accessibility: merged });
    }

    const result = await getSettings(userId);
    logger.info(`Accessibility settings updated for user ${userId}`);
    return result;
  } catch (err) {
    logger.error('Error updating accessibility settings:', err.message);
    throw err;
  }
}

module.exports = {
  getSettings,
  updateSettings,
};
