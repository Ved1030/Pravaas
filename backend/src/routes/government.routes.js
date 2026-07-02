const express = require("express");
const router = express.Router();
const governmentController = require("../controllers/government.controller");

router.get("/dashboard", governmentController.dashboard);

module.exports = router;
