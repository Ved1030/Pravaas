const express = require("express");
const router = express.Router();
const locationSharingController = require("../controllers/locationSharing.controller");

router.post("/create", locationSharingController.createShareLink);
router.get("/:code", locationSharingController.getSharedJourney);
router.post("/update", locationSharingController.updateLocation);
router.post("/stop", locationSharingController.stopSharing);

module.exports = router;
