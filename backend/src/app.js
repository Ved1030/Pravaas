require("dotenv").config();

const express = require("express");
const configureServer = require("./config/server");
const apiRouter = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { APP_NAME, APP_VERSION } = require("./config/constants");

const app = express();

configureServer(app);

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: APP_NAME,
    status: "Running",
    version: APP_VERSION,
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
