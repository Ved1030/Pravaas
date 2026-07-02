const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const DATA_DIR = path.join(__dirname, "..", "..", "data");

const collections = {
  user_preferences: [],
  route_predictions: [],
  recommendation_logs: [],
  journey_predictions: [],
  journey_history: [],
  journey_summary: [],
  trusted_contacts: [],
  live_tracking: [],
  emergency_events: [],
  shared_routes: [],
  voice_logs: [],
  notifications: [],
  recruiter_dashboard: [],
  corporate_dashboard: [],
  student_dashboard: [],
  parent_dashboard: [],
  delivery_dashboard: [],
  healthcare_dashboard: [],
  city_dashboard: [],
  gamification: [],
  achievements: [],
  analytics: [],
  daily_insights: [],
  reports: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collectionName) {
  return path.join(DATA_DIR, `${collectionName}.json`);
}

function loadCollection(collectionName) {
  const filePath = getFilePath(collectionName);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      collections[collectionName] = JSON.parse(data);
      logger.debug(`Loaded ${collectionName}: ${collections[collectionName].length} records`);
    } else {
      collections[collectionName] = [];
    }
  } catch (err) {
    logger.error(`Failed to load ${collectionName}:`, err.message);
    collections[collectionName] = [];
  }
}

function saveCollection(collectionName) {
  ensureDataDir();
  const filePath = getFilePath(collectionName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(collections[collectionName], null, 2), "utf-8");
  } catch (err) {
    logger.error(`Failed to save ${collectionName}:`, err.message);
  }
}

function init() {
  ensureDataDir();
  Object.keys(collections).forEach(loadCollection);
  logger.info("Database initialized");
}

function insert(collectionName, doc) {
  if (!collections[collectionName]) {
    collections[collectionName] = [];
  }
  const record = { id: generateId(), ...doc, createdAt: new Date().toISOString() };
  collections[collectionName].push(record);
  saveCollection(collectionName);
  return record;
}

function findAll(collectionName, filter = {}) {
  const data = collections[collectionName] || [];
  if (Object.keys(filter).length === 0) return data;
  return data.filter((item) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );
}

function findOne(collectionName, filter) {
  const data = collections[collectionName] || [];
  return data.find((item) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  ) || null;
}

function update(collectionName, filter, updates) {
  const data = collections[collectionName] || [];
  const index = data.findIndex((item) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
  saveCollection(collectionName);
  return data[index];
}

function remove(collectionName, filter) {
  const data = collections[collectionName] || [];
  const index = data.findIndex((item) =>
    Object.entries(filter).every(([key, value]) => item[key] === value)
  );
  if (index === -1) return false;
  data.splice(index, 1);
  saveCollection(collectionName);
  return true;
}

function generateId() {
  return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

init();

module.exports = {
  insert,
  findAll,
  findOne,
  update,
  remove,
  collections,
};
