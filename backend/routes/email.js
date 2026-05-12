const express = require("express");
const router = express.Router();
const db = require("../config/db");
const PDFDocument = require("pdfkit");
const path = require("path");
const { sendInvoiceEmail, sendPaymentReminder } = require("../utils/emailSender");

// ── Helper: generate PDF buffer ─────────────────────────
const generatePDFBuffer = (inv) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", err => reject(err));

    const pageWidth = doc.page.width - 100;
    const logoPath = path.join(__dirname, "../assests/OmniGrosslogo2.png");

    // OmniGross Premium Light Theme
    const primaryColor = "#12343b";
    const secondaryColor = "#1b4d57";
    const accentColor = "#0f766e";
    const lightBg = "#f8fcfc";
    const softBg = "#eef8f6";
    const borderColor = "#d7ece8";
    const textDark = "#1f2937";
    const textMuted = "#6b7280";
    const whiteText = "#ffffff";
    const lightHeaderText = "#d9ecef";

    const fmt = (n) =>
      "Rs. " + Number(n).toLocaleString("en-IN", {
        minimumFractionDigits: 2
      });

    // Header
    doc.rect(50, 45, pageWidth, 82).fill(primaryColor);

    // doc.fillColor(whiteText)
    //   .fontSize(23)
    //   .font("Helvetica-Bold")
    //   .text("OmniGross", 65, 60);
    doc.image(logoPath, 52, 50, {
  width: 33
});

doc.fillColor(whiteText)
  .fontSize(22)
  .font("Helvetica-Bold")
  .text("OmniGross",87, 61);

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor(lightHeaderText)
      .text("GST No: 27XXXXX0000X1ZX", 65, 88)
      .text("Pune, Maharashtra - 411001", 65, 100)
      .text("sales@omnigross.in | www.omnigross.in", 65, 112);

    doc.fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(whiteText)
      .text("TAX INVOICE", 300, 58, { width: 245, align: "right" });

    doc.fontSize(10)
      .font("Helvetica")
      .fillColor(lightHeaderText)
      .text(`Invoice No: ${inv.invoice_number || "-"}`, 300, 84, {
        width: 245,
        align: "right"
      });

    // Bill To
    const sectionY = 150;

    doc.rect(50, sectionY, 280, 92)
      .strokeColor(borderColor)
      .stroke();

    doc.rect(50, sectionY, 280, 22).fill(secondaryColor);

    doc.fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(whiteText)
      .text("BILL TO", 60, sectionY + 6);

    doc.fillColor(textDark)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(inv.customer_name || "-", 60, sectionY + 32);

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor(textMuted)
      .text(`State: ${inv.state || "-"}`, 60, sectionY + 50)
      .text(
        `Tax Type: ${inv.tax_type === "cgst_sgst" ? "CGST + SGST" : "IGST"}`,
        60,
        sectionY + 65
      );

    // Invoice Details
    doc.rect(350, sectionY, pageWidth - 300, 92)
      .strokeColor(borderColor)
      .stroke();

    doc.rect(350, sectionY, pageWidth - 300, 22).fill(secondaryColor);

    doc.fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(whiteText)
      .text("INVOICE DETAILS", 360, sectionY + 6);

    const detailY = sectionY + 32;

    const addDetail = (label, value, y) => {
      doc.fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(textDark)
        .text(label, 360, y);

      doc.font("Helvetica")
        .fillColor(textMuted)
        .text(value, 430, y);
    };

    addDetail("Invoice No:", inv.invoice_number || "-", detailY);
    addDetail("Date:", new Date(inv.created_at).toLocaleDateString("en-IN"), detailY + 16);
    addDetail(
      "Due Date:",
      inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "N/A",
      detailY + 32
    );

    // Items Table
    const tableTop = sectionY + 115;
    const colX = {
      num: 50,
      desc: 80,
      sac: 250,
      qty: 320,
      price: 370,
      total: 460
    };
    const rowH = 23;

    doc.rect(50, tableTop, pageWidth, rowH).fill(primaryColor);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(whiteText);
    doc.text("#", colX.num, tableTop + 7, { width: 25, align: "center" });
    doc.text("Description", colX.desc, tableTop + 7, { width: 165, align: "left" });
    doc.text("SAC", colX.sac, tableTop + 7, { width: 60, align: "center" });
    doc.text("Qty", colX.qty, tableTop + 7, { width: 45, align: "center" });
    doc.text("Unit Price", colX.price, tableTop + 7, { width: 85, align: "right" });
    doc.text("Amount", colX.total, tableTop + 7, { width: 80, align: "right" });

    inv.items.forEach((item, i) => {
      const y = tableTop + rowH + i * rowH;

      if (i % 2 === 0) {
        doc.rect(50, y, pageWidth, rowH).fill(lightBg);
      }

      doc.fontSize(9).font("Helvetica").fillColor(textDark);
      doc.text(String(i + 1), colX.num, y + 7, { width: 25, align: "center" });
      doc.text(item.description || "-", colX.desc, y + 7, { width: 165, align: "left" });
      doc.text(item.sac_code || "-", colX.sac, y + 7, { width: 60, align: "center" });
      doc.text(String(item.quantity || 0), colX.qty, y + 7, { width: 45, align: "center" });
      doc.text(fmt(item.unit_price || 0), colX.price, y + 7, { width: 85, align: "right" });
      doc.text(fmt(item.line_total || 0), colX.total, y + 7, { width: 80, align: "right" });

      doc.moveTo(50, y + rowH)
        .lineTo(50 + pageWidth, y + rowH)
        .strokeColor(borderColor)
        .stroke();
    });

    // Totals
    const totalsY = tableTop + rowH + inv.items.length * rowH + 16;
    const totalsX = 360;
    const totalsW = pageWidth - 310;

    const addRow = (label, value, y, highlight = false) => {
      if (highlight) {
        doc.rect(totalsX, y, totalsW, 24).fill(primaryColor);
        doc.fontSize(11).font("Helvetica-Bold").fillColor(whiteText);
      } else {
        doc.fontSize(9).font("Helvetica").fillColor(textDark);
      }

      doc.text(label, totalsX + 6, y + 7, { width: 100, align: "left" });
      doc.text(value, totalsX + totalsW - 90, y + 7, {
        width: 84,
        align: "right"
      });
    };

    addRow("Subtotal", fmt(inv.subtotal || 0), totalsY);

    if (inv.tax_type === "cgst_sgst") {
      addRow("CGST (9%)", fmt(inv.cgst_amount || 0), totalsY + 24);
      addRow("SGST (9%)", fmt(inv.sgst_amount || 0), totalsY + 44);
      addRow("TOTAL PAYABLE", fmt(inv.total_amount || 0), totalsY + 68, true);
    } else {
      addRow("IGST (18%)", fmt(inv.igst_amount || 0), totalsY + 24);
      addRow("TOTAL PAYABLE", fmt(inv.total_amount || 0), totalsY + 48, true);
    }

    // Thank You Box
    const amountBoxY = inv.tax_type === "cgst_sgst" ? totalsY + 105 : totalsY + 85;

    doc.rect(50, amountBoxY, pageWidth, 28).fill(softBg);

    doc.fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text("Thank you for choosing OmniGross.", 60, amountBoxY + 9);

    // Footer
    const footerY = doc.page.height - 82;

    doc.moveTo(50, footerY)
      .lineTo(50 + pageWidth, footerY)
      .strokeColor(borderColor)
      .stroke();

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#6b8b91")
      .text(
        "This is a computer-generated invoice and does not require a physical signature.",
        50,
        footerY + 12,
        { width: pageWidth, align: "center" }
      );

    doc.fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text("Authorised Signatory: OmniGross", 50, footerY + 32, {
        width: pageWidth,
        align: "right"
      });

    doc.end();
  });
};

// ── SEND INVOICE EMAIL ──────────────────────────────────
router.post("/send-invoice/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email address required" });

  const sql = `
    SELECT i.*, it.id AS item_id, it.description, it.sac_code,
           it.quantity, it.unit_price, it.line_total
    FROM invoices i
    LEFT JOIN invoice_items it ON i.id = it.invoice_id
    WHERE i.id = ?
  `;

  db.query(sql, [id], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(404).json({ error: "Invoice not found" });

    const inv = {
      ...results[0],
      items: results.filter(r => r.item_id).map(r => ({
        description: r.description,
        sac_code: r.sac_code || "-",
        quantity: Number(r.quantity),
        unit_price: Number(r.unit_price),
        line_total: Number(r.line_total)
      }))
    };

    try {
      const pdfBuffer = await generatePDFBuffer(inv);

      await sendInvoiceEmail({
        to: email,
        customerName: inv.customer_name,
        invoiceNumber: inv.invoice_number || `INV-${id}`,
        pdfBuffer
      });

      db.query(
        "INSERT INTO email_logs (invoice_id, sent_to, email_type, status) VALUES (?, ?, ?, ?)",
        [id, email, "invoice", "sent"],
        (err) => {
          if (err) console.error("Log error:", err);
        }
      );

      res.json({ message: "Invoice sent successfully!" });
    } catch (err) {
      console.error("Email error:", err);

      db.query(
        "INSERT INTO email_logs (invoice_id, sent_to, email_type, status) VALUES (?, ?, ?, ?)",
        [id, email, "invoice", "failed"],
        () => {}
      );

      res.status(500).json({ error: "Failed to send email: " + err.message });
    }
  });
});

// ── SEND PAYMENT REMINDER ───────────────────────────────
router.post("/send-reminder/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email address required" });

  db.query("SELECT * FROM invoices WHERE id = ?", [id], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(404).json({ error: "Invoice not found" });

    const inv = results[0];

    try {
      await sendPaymentReminder({
        to: email,
        customerName: inv.customer_name,
        invoiceNumber: inv.invoice_number || `INV-${id}`,
        totalAmount: inv.total_amount,
        dueDate: inv.due_date
      });

      db.query(
        "INSERT INTO email_logs (invoice_id, sent_to, email_type, status) VALUES (?, ?, ?, ?)",
        [id, email, "reminder", "sent"],
        () => {}
      );

      res.json({ message: "Payment reminder sent!" });
    } catch (err) {
      console.error("Reminder error:", err);
      res.status(500).json({ error: "Failed to send reminder: " + err.message });
    }
  });
});

// ── GET EMAIL LOGS ──────────────────────────────────────
router.get("/logs/:invoiceId", (req, res) => {
  db.query(
    "SELECT * FROM email_logs WHERE invoice_id = ? ORDER BY sent_at DESC",
    [req.params.invoiceId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Fetch failed" });
      res.json(results);
    }
  );
});

module.exports = router;