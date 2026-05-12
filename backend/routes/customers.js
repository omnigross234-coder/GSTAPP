const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ✅ GET ALL CUSTOMERS
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      c.*,
      COUNT(i.id)      AS total_invoices,
      COALESCE(SUM(i.total_amount), 0) AS total_revenue
    FROM customers c
    LEFT JOIN invoices i ON i.customer_name = c.name
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(results);
  });
});

// ✅ GET SINGLE CUSTOMER WITH INVOICES
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM customers WHERE id = ?", [id], (err, customers) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    if (customers.length === 0) return res.status(404).json({ error: "Not found" });

    const customer = customers[0];

    db.query(
      "SELECT * FROM invoices WHERE customer_name = ? ORDER BY created_at DESC",
      [customer.name],
      (err, invoices) => {
        if (err) return res.status(500).json({ error: "Fetch failed" });
        res.json({ ...customer, invoices });
      }
    );
  });
});

// ✅ ADD CUSTOMER
router.post("/", (req, res) => {
  const { name, business_name, email, phone, gst_number, address, state } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Customer name is required" });
  }

  // Check duplicate
  db.query("SELECT id FROM customers WHERE name = ?", [name.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length > 0) return res.status(400).json({ error: "Customer already exists" });

    const sql = `
      INSERT INTO customers (name, business_name, email, phone, gst_number, address, state)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
      name.trim(), business_name || null, email || null,
      phone || null, gst_number || null, address || null, state || null
    ], (err, result) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Customer added successfully", id: result.insertId });
    });
  });
});

// ✅ UPDATE CUSTOMER
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, business_name, email, phone, gst_number, address, state } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Customer name is required" });
  }

  const sql = `
    UPDATE customers SET
      name          = ?,
      business_name = ?,
      email         = ?,
      phone         = ?,
      gst_number    = ?,
      address       = ?,
      state         = ?
    WHERE id = ?
  `;
  db.query(sql, [
    name.trim(), business_name || null, email || null,
    phone || null, gst_number || null, address || null,
    state || null, id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Customer updated successfully" });
  });
});

// ✅ DELETE CUSTOMER
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM customers WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Customer deleted successfully" });
  });
});

module.exports = router;