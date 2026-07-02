const express = require("express");
const router = express.Router();
const healthcareController = require("../controllers/healthcare.controller");

router.get("/dashboard", healthcareController.dashboard);

module.exports = router;
