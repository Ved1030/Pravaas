const express = require("express");
const router = express.Router();

const routeRoutes = require("./route.routes");
const routePlanRoutes = require("./routePlan.routes");
const disruptionRoutes = require("./disruption.routes");
const decisionRoutes = require("./decision.routes");
const voiceRoutes = require("./voice.routes");
const notificationRoutes = require("./notification.routes");
const userRoutes = require("./user.routes");

router.use("/routes", routeRoutes);
router.use("/route", routePlanRoutes);
router.use("/disruption", disruptionRoutes);
router.use("/decision", decisionRoutes);
router.use("/voice", voiceRoutes);
router.use("/notifications", notificationRoutes);
router.use("/user", userRoutes);

module.exports = router;
