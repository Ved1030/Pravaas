const express = require("express");
const router = express.Router();
const exportController = require("../controllers/export.controller");

router.post("/pdf", exportController.exportPDF);
router.post("/csv", exportController.exportCSV);
router.post("/excel", exportController.exportExcel);
router.get("/reports", exportController.reports);

module.exports = router;
