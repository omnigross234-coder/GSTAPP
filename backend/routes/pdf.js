const express = require("express");
const router  = express.Router();
const { generateInvoicePDF } = require("../controllers/pdfController");

router.get("/:id", generateInvoicePDF);

module.exports = router;