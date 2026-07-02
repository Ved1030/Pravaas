const express = require("express");
const router = express.Router();
const noShowController = require("../controllers/noShow.controller");

router.post("/predict", noShowController.predict);

module.exports = router;
