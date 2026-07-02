const db = require('../config/database');
const logger = require('../utils/logger');

const COMMAND_MAP = [
  { pattern: /take\s*(me)?\s*home/i, action: { action: 'navigate', destination: 'home', response: 'Navigating to home...' } },
  { pattern: /plan\s*(the)?\s*safest\s*route/i, action: { action: 'plan_route', preference: 'safety', response: 'Planning safest route...' } },
  { pattern: /share\s*(my)?\s*journey/i, action: { action: 'share_journey', response: 'Sharing your journey...' } },
  { pattern: /where\s*am\s*i/i, action: { action: 'current_location', response: 'You are at [location]' } },
  { pattern: /(am\s*i|i\s*am)\s*late/i, action: { action: 'check_late', response: 'Checking your ETA...' } },
  { pattern: /nearest\s*hospital/i, action: { action: 'nearby', type: 'hospital', response: 'Finding nearest hospital...' } },
  { pattern: /nearest\s*police/i, action: { action: 'nearby', type: 'police', response: 'Finding nearest police station...' } },
];

async function processCommand(userId, { command, context }) {
  try {
    if (!command || typeof command !== 'string') {
      return { action: 'unknown', response: 'I did not understand. Try saying: Take me home, Plan safest route, or Where am I?' };
    }

    for (const entry of COMMAND_MAP) {
      if (entry.pattern.test(command.trim())) {
        const result = { ...entry.action, userId, context: context || null, timestamp: new Date().toISOString() };
        logger.info(`Voice command processed for user ${userId}: ${command.trim()} -> ${result.action}`);
        return result;
      }
    }

    return { action: 'unknown', response: 'I did not understand. Try saying: Take me home, Plan safest route, or Where am I?' };
  } catch (err) {
    logger.error('Error processing voice command:', err.message);
    return { action: 'unknown', response: 'Sorry, something went wrong processing your request.' };
  }
}

async function getInstructions(journeyId) {
  try {
    const tracking = db.findOne('live_tracking', { id: journeyId });
    if (!tracking) {
      logger.warn(`Journey ${journeyId} not found for voice instructions`);
      return [];
    }

    const currentIndex = tracking.currentStageIndex || 0;
    const instructions = (tracking.stages || []).map((stage, i) => {
      const status = i < currentIndex ? 'completed' : i === currentIndex ? 'current' : 'upcoming';
      return {
        index: i,
        mode: stage.mode,
        label: stage.label,
        instruction: stage.mode === 'walk'
          ? `Walk ${stage.distance || 0} meters towards ${stage.label || 'your destination'}`
          : stage.mode === 'metro'
            ? `Take the metro from ${stage.label || 'next station'}`
            : stage.mode === 'bus'
              ? `Board the bus at ${stage.label || 'next stop'}`
              : stage.mode === 'train'
                ? `Catch the train at ${stage.label || 'next station'}`
                : `Proceed to ${stage.label || 'next step'}`,
        status,
        distance: stage.distance || 0,
        duration: stage.duration || 0,
      };
    });

    return instructions;
  } catch (err) {
    logger.error('Error getting voice instructions:', err.message);
    return [];
  }
}

async function logVoiceInteraction(userId, command, response) {
  try {
    const log = db.insert('voice_logs', {
      userId,
      command,
      response,
    });

    logger.info(`Voice interaction logged for user ${userId}`);
    return log;
  } catch (err) {
    logger.error('Error logging voice interaction:', err.message);
    throw err;
  }
}

module.exports = {
  processCommand,
  getInstructions,
  logVoiceInteraction,
};
