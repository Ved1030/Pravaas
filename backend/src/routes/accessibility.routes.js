const express = require("express");
const router = express.Router();
const accessibilityController = require("../controllers/accessibility.controller");

router.get("/settings", accessibilityController.getSettings);
router.post("/settings", accessibilityController.updateSettings);

module.exports = router;
