const express = require("express");
const router = express.Router();
const gamificationController = require("../controllers/gamification.controller");

router.get("/achievements", gamificationController.achievements);
router.get("/weekly-goals", gamificationController.weeklyGoals);
router.get("/monthly-goals", gamificationController.monthlyGoals);
router.get("/rewards", gamificationController.rewards);
router.get("/streak", gamificationController.streak);

module.exports = router;
