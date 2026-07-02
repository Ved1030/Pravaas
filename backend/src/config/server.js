const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const corsOptions = require("./cors");
const env = require("./environment");

function configureServer(app) {
  app.use(helmet());
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(hpp());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
  });
  app.use("/api", limiter);

  app.disable("x-powered-by");
}

module.exports = configureServer;
