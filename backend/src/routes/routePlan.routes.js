const express = require("express");
const router = express.Router();
const controller = require("../controllers/routePlan.controller");

router.post("/plan", controller.planRoute);

module.exports = router;
