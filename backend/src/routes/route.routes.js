const express = require("express");
const router = express.Router();
const controller = require("../controllers/route.controller");

router.get("/", controller.getRoutes);

module.exports = router;