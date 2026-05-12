const PDFDocument = require("pdfkit");
const path = require("path");
const db = require("../config/db");

const generateInvoicePDF = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      i.*,
      it.id          AS item_id,
      it.description,
      it.sac_code,
      it.quantity,
      it.unit_price,
      it.line_total
    FROM invoices i
    LEFT JOIN invoice_items it ON i.id = it.invoice_id
    WHERE i.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(404).json({ error: "Invoice not found" });

    const inv = {
      ...results[0],
      items: results
        .filter(r => r.item_id)
        .map(r => ({
          description: r.description,
          sac_code: r.sac_code || "-",
          quantity: Number(r.quantity),
          unit_price: Number(r.unit_price),
          line_total: Number(r.line_total)
        }))
    };

    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${inv.invoice_number || "invoice"}.pdf"`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width - 100;
    const logoPath = path.join(__dirname, "../assests/OmniGrosslogo2.png");

    // OmniGross Theme Colors#0a1a1f
    const primaryColor = "#112f38";
    const secondaryColor = "#12343b";
    const accentColor = "#0f766e";
    const lightGray = "#f5fbfa";
    const softAccent = "#eef8f6";
    const borderColor = "#d7ece8";
    const textDark = "#1f2937";
    const textMuted = "#6b7280";

    const fmt = (n) =>
      "Rs. " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    // HEADER
    doc
  .rect(50, 45, pageWidth, 80)
  .fill(primaryColor);

    doc.image(logoPath, 52, 50, {
      width: 33
    });

    doc
      .fillColor("white")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("OmniGross", 87, 61);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#b8d4d8")
      .text("GST No: 27XXXXX0000X1ZX", 65, 88)
      .text("Pune, Maharashtra - 411001", 65, 100)
      .text("contact@omnigross.in | www.omnigross.in", 65, 112);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("TAX INVOICE", 300, 58, { width: 245, align: "right" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#b8d4d8")
      .text(`Invoice No: ${inv.invoice_number || "-"}`, 300, 82, {
        width: 245,
        align: "right"
      });

    const statusColors = {
      draft: "#9ca3af",
      sent: "#0f766e",
      paid: "#16a34a",
      overdue: "#ef4444"
    };

    const badgeColor = statusColors[inv.status] || "#9ca3af";

    doc
      .roundedRect(395, 105, 80, 16, 4)
      .fill(badgeColor);

    doc
      .fontSize(9)
      .fillColor("white")
      .font("Helvetica-Bold")
      .text((inv.status || "draft").toUpperCase(), 397, 108, {
        width: 76,
        align: "center"
      });

    // BILL TO + INVOICE DETAILS
    const sectionY = 150;

    doc
      .rect(50, sectionY, 280, 90)
      .strokeColor(borderColor)
      .stroke();

    doc
      .rect(50, sectionY, 280, 20)
      .fill(secondaryColor);

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("BILL TO", 60, sectionY + 5);

    doc
      .fillColor(textDark)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(inv.customer_name, 60, sectionY + 28);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(textMuted)
      .text(`State: ${inv.state}`, 60, sectionY + 46)
      .text(
        `Tax Type: ${inv.tax_type === "cgst_sgst" ? "CGST + SGST" : "IGST"}`,
        60,
        sectionY + 60
      );

    doc
      .rect(350, sectionY, pageWidth - 300, 90)
      .strokeColor(borderColor)
      .stroke();

    doc
      .rect(350, sectionY, pageWidth - 300, 20)
      .fill(secondaryColor);

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("white")
      .text("INVOICE DETAILS", 360, sectionY + 5);

    const detailY = sectionY + 28;

    doc.fillColor(textDark).fontSize(9).font("Helvetica");

    const addDetail = (label, value, y) => {
      doc.font("Helvetica-Bold").fillColor(textDark).text(label, 360, y);
      doc.font("Helvetica").fillColor(textMuted).text(value, 430, y);
    };

    addDetail("Invoice No:", inv.invoice_number || "-", detailY);
    addDetail("Date:", new Date(inv.created_at).toLocaleDateString("en-IN"), detailY + 16);
    addDetail(
      "Due Date:",
      inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "N/A",
      detailY + 32
    );

    // LINE ITEMS TABLE
    const tableTop = sectionY + 110;

    const colX = {
      num: 50,
      desc: 80,
      sac: 250,
      qty: 320,
      price: 370,
      total: 460
    };

    const rowH = 22;

    doc
      .rect(50, tableTop, pageWidth, rowH)
      .fill(primaryColor);

    doc.fontSize(9).font("Helvetica-Bold").fillColor("white");
    doc.text("#", colX.num, tableTop + 7, { width: 25, align: "center" });
    doc.text("Description", colX.desc, tableTop + 7, { width: 165, align: "left" });
    doc.text("SAC", colX.sac, tableTop + 7, { width: 60, align: "center" });
    doc.text("Qty", colX.qty, tableTop + 7, { width: 45, align: "center" });
    doc.text("Unit Price", colX.price, tableTop + 7, { width: 85, align: "right" });
    doc.text("Amount", colX.total, tableTop + 7, { width: 80, align: "right" });

    inv.items.forEach((item, i) => {
      const y = tableTop + rowH + i * rowH;

      if (i % 2 === 0) {
        doc.rect(50, y, pageWidth, rowH).fill(lightGray);
      }

      doc.fontSize(9).font("Helvetica").fillColor(textDark);
      doc.text(String(i + 1), colX.num, y + 7, { width: 25, align: "center" });
      doc.text(item.description, colX.desc, y + 7, { width: 165, align: "left" });
      doc.text(item.sac_code, colX.sac, y + 7, { width: 60, align: "center" });
      doc.text(String(item.quantity), colX.qty, y + 7, { width: 45, align: "center" });
      doc.text(fmt(item.unit_price), colX.price, y + 7, { width: 85, align: "right" });
      doc.text(fmt(item.line_total), colX.total, y + 7, { width: 80, align: "right" });

      doc
        .moveTo(50, y + rowH)
        .lineTo(50 + pageWidth, y + rowH)
        .strokeColor(borderColor)
        .stroke();
    });

    // TOTALS
    const totalsY = tableTop + rowH + inv.items.length * rowH + 15;
    const totalsX = 360;
    const totalsW = pageWidth - 310;

    const addTotalRow = (label, value, y, bold = false, highlight = false) => {
      if (highlight) {
        doc.rect(totalsX, y, totalsW, 22).fill(primaryColor);
        doc.fontSize(11).font("Helvetica-Bold").fillColor("white");
      } else {
        doc
          .fontSize(9)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fillColor(textDark);
      }

      doc.text(label, totalsX + 5, y + 6, { width: 100, align: "left" });
      doc.text(value, totalsX + totalsW - 85, y + 6, {
        width: 80,
        align: "right"
      });
    };

    addTotalRow("Subtotal", fmt(inv.subtotal), totalsY);

    if (inv.tax_type === "cgst_sgst") {
      addTotalRow("CGST (9%)", fmt(inv.cgst_amount), totalsY + 24);
      addTotalRow("SGST (9%)", fmt(inv.sgst_amount), totalsY + 44);
    } else {
      addTotalRow("IGST (18%)", fmt(inv.igst_amount), totalsY + 24);
    }

    const totalRowY = inv.tax_type === "cgst_sgst" ? totalsY + 66 : totalsY + 46;

    addTotalRow("TOTAL PAYABLE", fmt(inv.total_amount), totalRowY, true, true);

    // AMOUNT IN WORDS
    const amtWordsY = totalRowY + 35;

    doc
      .rect(50, amtWordsY, pageWidth, 24)
      .fill(softAccent);

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text(
        `Amount in Words: ${numberToWords(Math.round(inv.total_amount))} Rupees Only`,
        60,
        amtWordsY + 7
      );

    // NOTES
    if (inv.notes) {
      const notesY = amtWordsY + 40;

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(textDark)
        .text("Notes:", 50, notesY);

      doc
        .font("Helvetica")
        .fillColor(textMuted)
        .text(inv.notes, 50, notesY + 14, { width: pageWidth });
    }

    // FOOTER
    const footerY = doc.page.height - 80;

    doc
      .moveTo(50, footerY)
      .lineTo(50 + pageWidth, footerY)
      .strokeColor(borderColor)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#7fa0a6")
      .text(
        "This is a computer-generated invoice and does not require a physical signature.",
        50,
        footerY + 10,
        { width: pageWidth, align: "center" }
      );

    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text("Authorised Signatory: OmniGross", 50, footerY + 28, {
        width: pageWidth,
        align: "right"
      });

    doc.end();
  });
};

function numberToWords(n) {
  if (n === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen"
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety"
  ];

  const convert = (num) => {
    if (num < 20) return ones[num];

    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    }

    if (num < 1000) {
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + convert(num % 100) : "")
      );
    }

    if (num < 100000) {
      return (
        convert(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + convert(num % 1000) : "")
      );
    }

    if (num < 10000000) {
      return (
        convert(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + convert(num % 100000) : "")
      );
    }

    return (
      convert(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + convert(num % 10000000) : "")
    );
  };

  return convert(n);
}

module.exports = { generateInvoicePDF };