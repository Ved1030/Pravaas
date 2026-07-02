const env = require("../config/environment");

const isDev = env.NODE_ENV === "development";

const timestamp = () => new Date().toISOString();

const logger = {
  info: (...args) => {
    console.log(`[${timestamp()}] INFO:`, ...args);
  },
  warn: (...args) => {
    console.warn(`[${timestamp()}] WARN:`, ...args);
  },
  error: (...args) => {
    console.error(`[${timestamp()}] ERROR:`, ...args);
  },
  debug: (...args) => {
    if (isDev) console.debug(`[${timestamp()}] DEBUG:`, ...args);
  },
};

module.exports = logger;
