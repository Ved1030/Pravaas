const app = require("./app");
const env = require("./config/environment");
const logger = require("./utils/logger");

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`=== Pravaas Backend Server ===`);
  logger.info(`Port: ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Client URL: ${env.CLIENT_URL}`);
  logger.info(`CORS allowed origins: ${env.NODE_ENV === "production" ? env.CLIENT_URL : `${env.CLIENT_URL}, http://localhost:5173, http://localhost:3000`}`);
  logger.info(`Health endpoint: /health`);
  logger.info(`API endpoint: /api`);
  logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
