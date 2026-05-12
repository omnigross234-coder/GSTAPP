
const express = require("express");
const router  = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  getAdminInvoices,
  editInvoice
} = require("../controllers/invoiceController");

router.get("/",              getInvoices);
router.get("/admin",         getAdminInvoices);
router.post("/",             createInvoice);
router.get("/:id",           getInvoiceById);
router.patch("/:id/status",  updateInvoiceStatus);
router.put("/:id",           editInvoice);        
router.delete("/:id",        deleteInvoice);

module.exports = router;