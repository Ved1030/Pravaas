const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parent.controller");

router.get("/dashboard", parentController.dashboard);

module.exports = router;
