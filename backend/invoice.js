const db = require("./config/db");

// CREATE INVOICE
const createInvoice = (req, res) => {
  const { invoice_data, items } = req.body;

  if (!invoice_data || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const {
    customer_name,
    state,
    subtotal,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    tax_type,
    user_id
  } = invoice_data;

  const invoiceSql = `
    INSERT INTO invoices 
    (customer_name, state, subtotal, cgst_amount, sgst_amount, igst_amount, total_amount, tax_type, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    invoiceSql,
    [
      customer_name,
      state,
      subtotal,
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_amount,
      tax_type,
      user_id
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Invoice insert failed" });
      }

      const invoiceId = result.insertId;

      //  Insert all items
      const itemSql = `
        INSERT INTO invoice_items 
        (invoice_id, description, quantity, unit_price, line_total)
        VALUES ?
      `;

      const itemValues = items.map(item => [
        invoiceId,
        item.description,
        item.quantity,
        item.unit_price,
        item.line_total
      ]);

      db.query(itemSql, [itemValues], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Items insert failed" });
        }

        res.json({
          message: "Invoice saved successfully",
          invoice_id: invoiceId
        });
      });
    }
  );
};


// GET INVOICES
const getInvoices = (req, res) => {

  const sql = `
    SELECT 
      i.id AS invoice_id,
      i.customer_name,
      i.total_amount,
      i.tax_type,
      it.description,
      it.quantity,
      it.unit_price,
      it.line_total
    FROM invoices i
    JOIN invoice_items it 
    ON i.id = it.invoice_id
    ORDER BY i.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Fetch failed" });
    }

    const invoices = {};

    results.forEach(row => {
      if (!invoices[row.invoice_id]) {
        invoices[row.invoice_id] = {
          invoice_id: row.invoice_id,
          customer_name: row.customer_name,
          total_amount: Number(row.total_amount),
          tax_type: row.tax_type,
          items: []
        };
      }

      invoices[row.invoice_id].items.push({
        description: row.description,
        quantity: Number(row.quantity),
        unit_price: Number(row.unit_price),
        line_total: Number(row.line_total)
      });
    });

    res.json(Object.values(invoices));
  });
};


module.exports = { createInvoice, getInvoices };