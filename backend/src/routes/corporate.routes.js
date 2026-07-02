const express = require("express");
const router = express.Router();
const corporateController = require("../controllers/corporate.controller");

router.get("/dashboard", corporateController.dashboard);

module.exports = router;
