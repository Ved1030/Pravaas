const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery.controller");

router.get("/dashboard", deliveryController.dashboard);

module.exports = router;
