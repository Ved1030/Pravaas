const express = require("express");
const router = express.Router();

const routeRoutes = require("./route.routes");
const routePlanRoutes = require("./routePlan.routes");
const disruptionRoutes = require("./disruption.routes");
const decisionRoutes = require("./decision.routes");
const voiceRoutes = require("./voice.routes");
const notificationRoutes = require("./notification.routes");
const userRoutes = require("./user.routes");
const aiRoutes = require("./ai.routes");
const journeyTrackingRoutes = require("./journeyTracking.routes");
const emergencyRoutes = require("./emergency.routes");
const safetyRoutes = require("./safety.routes");
const journeySummaryRoutes = require("./journeySummary.routes");
const locationSharingRoutes = require("./locationSharing.routes");
const accessibilityRoutes = require("./accessibility.routes");

// Phase 3 routes
const recruiterRoutes = require("./recruiter.routes");
const noShowRoutes = require("./noShow.routes");
const corporateRoutes = require("./corporate.routes");
const studentRoutes = require("./student.routes");
const parentRoutes = require("./parent.routes");
const deliveryRoutes = require("./delivery.routes");
const healthcareRoutes = require("./healthcare.routes");
const governmentRoutes = require("./government.routes");
const analyticsRoutes = require("./analytics.routes");
const gamificationRoutes = require("./gamification.routes");
const insightRoutes = require("./insight.routes");
const exportRoutes = require("./export.routes");

// Phase 1 & 2 routes
router.use("/routes", routeRoutes);
router.use("/route", routePlanRoutes);
router.use("/disruption", disruptionRoutes);
router.use("/decision", decisionRoutes);
router.use("/voice", voiceRoutes);
router.use("/notifications", notificationRoutes);
router.use("/user", userRoutes);
router.use("/ai", aiRoutes);
router.use("/journey", journeyTrackingRoutes);
router.use("/emergency", emergencyRoutes);
router.use("/safety", safetyRoutes);
router.use("/journey-summary", journeySummaryRoutes);
router.use("/share", locationSharingRoutes);
router.use("/accessibility", accessibilityRoutes);

// Phase 3 routes
router.use("/recruiter", recruiterRoutes);
router.use("/no-show", noShowRoutes);
router.use("/corporate", corporateRoutes);
router.use("/student", studentRoutes);
router.use("/parent", parentRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/healthcare", healthcareRoutes);
router.use("/government", governmentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/gamification", gamificationRoutes);
router.use("/insights", insightRoutes);
router.use("/export", exportRoutes);

module.exports = router;
