const db = require('../config/database');
const logger = require('../utils/logger');

async function createNotification(userId, { type, title, message, data }) {
  try {
    const notification = db.insert('notifications', {
      userId,
      type: type || 'general',
      title,
      message,
      data: data || {},
      read: false,
      readAt: null,
    });

    logger.info(`Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (err) {
    logger.error('Error creating notification:', err.message);
    throw err;
  }
}

async function getNotifications(userId, filter) {
  try {
    let notifications = db.findAll('notifications', { userId });

    if (filter) {
      if (filter.type) {
        notifications = notifications.filter(n => n.type === filter.type);
      }
      if (filter.severity) {
        notifications = notifications.filter(n => n.data?.severity === filter.severity);
      }
      if (filter.read !== undefined) {
        notifications = notifications.filter(n => n.read === filter.read);
      }
    }

    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return notifications;
  } catch (err) {
    logger.error('Error getting notifications:', err.message);
    return [];
  }
}

async function markRead(notificationId) {
  try {
    const notification = db.findOne('notifications', { id: notificationId });
    if (!notification) {
      logger.warn(`Notification ${notificationId} not found`);
      return null;
    }

    const updated = db.update('notifications', { id: notificationId }, {
      read: true,
      readAt: new Date().toISOString(),
    });

    logger.info(`Notification ${notificationId} marked as read`);
    return updated;
  } catch (err) {
    logger.error('Error marking notification read:', err.message);
    throw err;
  }
}

async function generateSmartNotifications(journeyTrackingId, weatherData, trafficData) {
  try {
    const tracking = db.findOne('live_tracking', { id: journeyTrackingId });
    if (!tracking) {
      logger.warn(`Tracking ${journeyTrackingId} not found for smart notifications`);
      return [];
    }

    const notifications = [];
    const now = new Date();

    const hasRain = weatherData && (
      weatherData.condition?.toLowerCase().includes('rain') ||
      weatherData.condition?.toLowerCase().includes('drizzle') ||
      weatherData.impact > 0
    );
    if (hasRain) {
      notifications.push({
        type: 'weather',
        title: 'Rain ahead',
        message: 'Rain expected on your route. Carry an umbrella and allow extra time.',
        severity: 'medium',
        data: { weatherData },
        timestamp: now.toISOString(),
      });
    }

    const hasCongestion = trafficData && (
      trafficData.congestionLevel === 'high' ||
      (trafficData.delay && trafficData.delay > 5)
    );
    if (hasCongestion) {
      notifications.push({
        type: 'traffic',
        title: 'Heavy traffic',
        message: `Traffic congestion detected${trafficData.delay ? `, adding ~${trafficData.delay} min` : ''}. Consider alternate routes.`,
        severity: 'high',
        data: { trafficData },
        timestamp: now.toISOString(),
      });
    }

    const departureTime = tracking.routeData?.departureTime || tracking.startTime;
    if (departureTime) {
      const depMs = new Date(departureTime).getTime();
      const diffMin = (depMs - now.getTime()) / 60000;
      if (diffMin > 0 && diffMin <= 15) {
        notifications.push({
          type: 'departure',
          title: 'Leave now',
          message: `Your departure window is approaching. Leave in ${Math.round(diffMin)} min to stay on schedule.`,
          severity: 'high',
          data: { departureTime },
          timestamp: now.toISOString(),
        });
      }
    }

    const metroSteps = (tracking.stages || []).filter(s => s.mode === 'metro');
    if (metroSteps.length > 0 && Math.random() > 0.5) {
      notifications.push({
        type: 'disruption',
        title: 'Metro delayed',
        message: `Minor delay detected on Metro line. Expect +${Math.floor(Math.random() * 5) + 2} min.`,
        severity: 'medium',
        data: { mode: 'metro', delay: Math.floor(Math.random() * 5) + 2 },
        timestamp: now.toISOString(),
      });
    }

    if (tracking.remainingTime !== undefined && tracking.remainingTime <= 5 && tracking.remainingTime > 0) {
      notifications.push({
        type: 'arrival',
        title: 'Destination nearby',
        message: 'You are almost at your destination. Get ready to alight.',
        severity: 'low',
        data: { remainingTime: tracking.remainingTime },
        timestamp: now.toISOString(),
      });
    }

    if (tracking.status === 'completed') {
      notifications.push({
        type: 'journey_end',
        title: 'Journey completed',
        message: 'You have reached your destination. Have a great day!',
        severity: 'low',
        data: {},
        timestamp: now.toISOString(),
      });
    }

    if (tracking.lateArrival) {
      notifications.push({
        type: 'delay',
        title: 'Route changed',
        message: 'You are running late. Consider a faster alternate route.',
        severity: 'medium',
        data: { lateArrival: true },
        timestamp: now.toISOString(),
      });
    }

    return notifications;
  } catch (err) {
    logger.error('Error generating smart notifications:', err.message);
    return [];
  }
}

module.exports = {
  createNotification,
  getNotifications,
  markRead,
  generateSmartNotifications,
};
