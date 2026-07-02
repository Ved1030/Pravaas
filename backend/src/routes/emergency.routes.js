const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergency.controller");

router.post("/", emergencyController.createEmergency);
router.post("/resolve", emergencyController.resolveEmergency);
router.get("/", emergencyController.getEmergency);
router.get("/active", emergencyController.getActiveEmergencies);

module.exports = router;
