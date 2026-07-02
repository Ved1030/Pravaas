const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiter.controller");

router.get("/dashboard", recruiterController.dashboard);
router.get("/candidates", recruiterController.candidates);
router.post("/reschedule", recruiterController.reschedule);
router.post("/virtual", recruiterController.virtual);

module.exports = router;
