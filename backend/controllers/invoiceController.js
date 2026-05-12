const db = require("../config/db");

// Generate invoice number like INV-2026-0001
const generateInvoiceNumber = (callback) => {
  const year = new Date().getFullYear();
  const sql = `
    SELECT invoice_number FROM invoices 
    WHERE invoice_number LIKE 'INV-${year}-%' 
    ORDER BY id DESC LIMIT 1
  `;
  db.query(sql, (err, result) => {
    if (err) return callback(err);
    let nextNumber = 1;
    if (result.length > 0) {
      const last = result[0].invoice_number;
      const lastNum = parseInt(last.split("-")[2]);
      nextNumber = lastNum + 1;
    }
    const number = `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
    callback(null, number);
  });
};

//  CREATE INVOICE
const createInvoice = (req, res) => {
  const { invoice_data, items } = req.body;

  if (!invoice_data || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const {
    customer_name,
    state,
    subtotal,
    discount_amount = 0,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    tax_type,
    user_id,
    notes = "",
    due_date = null
  } = invoice_data;

  generateInvoiceNumber((err, invoice_number) => {
    if (err) return res.status(500).json({ error: "Invoice number generation failed" });

    const invoiceSql = `
      INSERT INTO invoices 
      (invoice_number, customer_name, state, subtotal, discount_amount,
       cgst_amount, sgst_amount, igst_amount, total_amount, tax_type,
       user_id, notes, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;

    db.query(invoiceSql, [
      invoice_number, customer_name, state, subtotal, discount_amount,
      cgst_amount, sgst_amount, igst_amount, total_amount, tax_type,
      user_id, notes, due_date
    ], (err, result) => {
      if (err) {
        console.error("Invoice insert error:", err);
        return res.status(500).json({ error: "Invoice insert failed" });
      }

      const invoiceId = result.insertId;

      const itemSql = `
        INSERT INTO invoice_items 
        (invoice_id, description, sac_code, quantity, unit_price, line_total)
        VALUES ?
      `;

      const itemValues = items.map(item => [
        invoiceId,
        item.description,
        item.sac_code || null,
        item.quantity,
        item.unit_price,
        item.line_total
      ]);

      // db.query(itemSql, [itemValues], (err) => {
      //   if (err) {
      //     console.error("Items insert error:", err);
      //     return res.status(500).json({ error: "Items insert failed" });
      //   }

      //   res.json({
      //     message: "Invoice saved successfully",
      //     invoice_id: invoiceId,
      //     invoice_number
      //   });
      // });

      db.query(itemSql, [itemValues], (err) => {
  if (err) {
    console.error("Items insert error:", err);
    return res.status(500).json({ error: "Items insert failed" });
  }

  // ✅ Auto-add customer to customers table if not exists
  const checkCustomerSql = "SELECT id FROM customers WHERE name = ?";
  db.query(checkCustomerSql, [customer_name], (err, existing) => {
    if (!err && existing.length === 0) {
      const insertCustomerSql = `
        INSERT INTO customers (name, state)
        VALUES (?, ?)
      `;
      db.query(insertCustomerSql, [customer_name, state], (err) => {
        if (err) console.error("Auto customer insert error:", err);
        else console.log(`✅ New customer "${customer_name}" added to customers table`);
      });
    }
  });

  res.json({
    message: "Invoice saved successfully",
    invoice_id: invoiceId,
    invoice_number
  });
});
    });
  });
};



const getInvoices = (req, res) => {
  const user_id = req.query.user_id;
  const role    = req.query.role;

  // Admin sees all, user sees only their own
  const whereClause = (role === "admin") ? "" : "WHERE i.user_id = ?";
  const params      = (role === "admin") ? [] : [user_id];

  const sql = `
    SELECT 
      i.id            AS invoice_id,
      i.invoice_number,
      i.customer_name,
      i.state,
      i.subtotal,
      i.discount_amount,
      i.cgst_amount,
      i.sgst_amount,
      i.igst_amount,
      i.total_amount,
      i.tax_type,
      i.status,
      i.due_date,
      i.notes,
      i.created_at,
      it.id           AS item_id,
      it.description,
      it.sac_code,
      it.quantity,
      it.unit_price,
      it.line_total
    FROM invoices i
    LEFT JOIN invoice_items it ON i.id = it.invoice_id
    ${whereClause}
    ORDER BY i.id DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ error: "Fetch failed" });
    }

    const invoicesMap = {};
    results.forEach(row => {
      if (!invoicesMap[row.invoice_id]) {
        invoicesMap[row.invoice_id] = {
          invoice_id:      row.invoice_id,
          invoice_number:  row.invoice_number,
          customer_name:   row.customer_name,
          state:           row.state,
          subtotal:        Number(row.subtotal),
          discount_amount: Number(row.discount_amount),
          cgst_amount:     Number(row.cgst_amount),
          sgst_amount:     Number(row.sgst_amount),
          igst_amount:     Number(row.igst_amount),
          total_amount:    Number(row.total_amount),
          tax_type:        row.tax_type,
          status:          row.status,
          due_date:        row.due_date,
          notes:           row.notes,
          created_at:      row.created_at,
          items:           []
        };
      }

      if (row.item_id) {
        invoicesMap[row.invoice_id].items.push({
          id:          row.item_id,
          description: row.description,
          sac_code:    row.sac_code,
          quantity:    Number(row.quantity),
          unit_price:  Number(row.unit_price),
          line_total:  Number(row.line_total)
        });
      }
    });

    res.json(Object.values(invoicesMap));
  });
};

// GET SINGLE INVOICE
const getInvoiceById = (req, res) => {
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
    if (err) return res.status(500).json({ error: "Fetch failed" });
    if (results.length === 0) return res.status(404).json({ error: "Invoice not found" });

    const invoice = {
      ...results[0],
      items: results
        .filter(r => r.item_id)
        .map(r => ({
          id:          r.item_id,
          description: r.description,
          sac_code:    r.sac_code,
          quantity:    Number(r.quantity),
          unit_price:  Number(r.unit_price),
          line_total:  Number(r.line_total)
        }))
    };

    res.json(invoice);
  });
};

//  UPDATE STATUS
const updateInvoiceStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["draft", "sent", "paid", "overdue"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query("UPDATE invoices SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    res.json({ message: "Status updated" });
  });
};

// DELETE INVOICE
const deleteInvoice = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM invoices WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Invoice deleted" });
  });
};
// GET ALL INVOICES FOR ADMIN (with user info + optional user_id filter)
const getAdminInvoices = (req, res) => {
  const { user_id } = req.query;

  const whereClause = user_id ? "WHERE i.user_id = ?" : "";
  const params      = user_id ? [user_id] : [];

  const sql = `
    SELECT
      i.id            AS invoice_id,
      i.invoice_number,
      i.customer_name,
      i.state,
      i.subtotal,
      i.discount_amount,
      i.cgst_amount,
      i.sgst_amount,
      i.igst_amount,
      i.total_amount,
      i.tax_type,
      i.status,
      i.due_date,
      i.notes,
      i.created_at,
      i.user_id,
      u.username,
      it.id           AS item_id,
      it.description,
      it.sac_code,
      it.quantity,
      it.unit_price,
      it.line_total
    FROM invoices i
    LEFT JOIN users u        ON i.user_id    = u.id
    LEFT JOIN invoice_items it ON i.id = it.invoice_id
    ${whereClause}
    ORDER BY i.id DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Admin fetch error:", err);
      return res.status(500).json({ error: "Fetch failed" });
    }

    const invoicesMap = {};
    results.forEach(row => {
      if (!invoicesMap[row.invoice_id]) {
        invoicesMap[row.invoice_id] = {
          invoice_id:      row.invoice_id,
          invoice_number:  row.invoice_number,
          customer_name:   row.customer_name,
          state:           row.state,
          subtotal:        Number(row.subtotal),
          discount_amount: Number(row.discount_amount),
          cgst_amount:     Number(row.cgst_amount),
          sgst_amount:     Number(row.sgst_amount),
          igst_amount:     Number(row.igst_amount),
          total_amount:    Number(row.total_amount),
          tax_type:        row.tax_type,
          status:          row.status,
          due_date:        row.due_date,
          notes:           row.notes,
          created_at:      row.created_at,
          user_id:         row.user_id,
          username:        row.username,
          items:           []
        };
      }
      if (row.item_id) {
        invoicesMap[row.invoice_id].items.push({
          id:          row.item_id,
          description: row.description,
          sac_code:    row.sac_code    || "-",
          quantity:    Number(row.quantity),
          unit_price:  Number(row.unit_price),
          line_total:  Number(row.line_total)
        });
      }
    });

    res.json(Object.values(invoicesMap));
  });
};


//  EDIT INVOICE (admin only)
const editInvoice = (req, res) => {
  const { id } = req.params;
  const { invoice_data, items } = req.body;

  if (!invoice_data || !items || items.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const {
    customer_name,
    state,
    subtotal,
    discount_amount = 0,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
    tax_type,
    notes = "",
    due_date = null
  } = invoice_data;

  const updateSql = `
    UPDATE invoices SET
      customer_name   = ?,
      state           = ?,
      subtotal        = ?,
      discount_amount = ?,
      cgst_amount     = ?,
      sgst_amount     = ?,
      igst_amount     = ?,
      total_amount    = ?,
      tax_type        = ?,
      notes           = ?,
      due_date        = ?
    WHERE id = ?
  `;

  db.query(updateSql, [
    customer_name, state, subtotal, discount_amount,
    cgst_amount, sgst_amount, igst_amount, total_amount,
    tax_type, notes, due_date, id
  ], (err) => {
    if (err) {
      console.error("Invoice update error:", err);
      return res.status(500).json({ error: "Invoice update failed" });
    }

    // Delete old items and reinsert
    db.query("DELETE FROM invoice_items WHERE invoice_id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Items delete failed" });

      const itemSql = `
        INSERT INTO invoice_items
        (invoice_id, description, sac_code, quantity, unit_price, line_total)
        VALUES ?
      `;

      const itemValues = items.map(item => [
        id,
        item.description,
        item.sac_code || null,
        item.quantity,
        item.unit_price,
        item.line_total
      ]);

      db.query(itemSql, [itemValues], (err) => {
        if (err) {
          console.error("Items insert error:", err);
          return res.status(500).json({ error: "Items update failed" });
        }

        res.json({ message: "Invoice updated successfully" });
      });
    });
  });
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  getAdminInvoices,
  editInvoice  
};