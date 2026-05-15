require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors    = require("cors");

require("./config/db");

const authRoutes    = require("./auth");
const invoiceRoutes = require("./routes/invoices");
const pdfRoutes     = require("./routes/pdf");
const customerRoutes = require("./routes/customers");
const expenseRoutes  = require("./routes/expenses"); 
const emailRoutes = require("./routes/email"); 

// ADD THIS LINE with your other requires at the top
const { router: backupRouter, startAutoBackupScheduler } = require("./routes/backup");


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("GST Backend Running ✅"));

// Auth routes
app.post("/login",           authRoutes.login);
app.post("/verify-username", authRoutes.verifyUsername);
app.post("/reset-password",  authRoutes.resetPassword);

// Backward-compatible auth routes for older frontend builds
app.post("/api/login",           authRoutes.login);
app.post("/api/verify-username", authRoutes.verifyUsername);
app.post("/api/reset-password",  authRoutes.resetPassword);

app.use("/api/email", emailRoutes); 

// User management (admin only)
app.get("/api/users",              authRoutes.getUsers);
app.post("/api/users",             authRoutes.addUser);
app.patch("/api/users/:id/status", authRoutes.toggleUserStatus);

app.use("/api/backup", backupRouter); 



// Customer suggestions from customers table
app.get("/api/customers/suggestions", (req, res) => {
  const db     = require("./config/db");
  const search = req.query.q || "";

  const sql = `
    SELECT id, name, business_name, email, phone, 
           gst_number, address, state
    FROM customers
    WHERE name LIKE ?
    ORDER BY name ASC
    LIMIT 8
  `;

  db.query(sql, [`%${search}%`], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
});

// Expense categories
app.get("/api/expense-categories", (req, res) => {
  const db = require("./config/db");
  const showAll = req.query.all === "true";
  const sql = showAll
    ? "SELECT * FROM expense_categories ORDER BY name ASC"
    : "SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name ASC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(results);
  });
});


// ── Category Management ─────────────────────────────────

app.get("/api/expense-categories", (req, res) => {
  const db = require("./config/db");
  const showAll = req.query.all === "true";
  const sql = showAll
    ? "SELECT * FROM expense_categories ORDER BY name ASC"
    : "SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name ASC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(results);
  });
});

app.post("/api/expense-categories", (req, res) => {
  const db = require("./config/db");
  const { name, description, default_price } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const categoryDefaultPrice = default_price === "" || default_price == null ? 0 : Number(default_price);
  if (!Number.isFinite(categoryDefaultPrice) || categoryDefaultPrice < 0) {
    return res.status(400).json({ error: "Default price must be a valid amount" });
  }
  db.query(
    "INSERT INTO expense_categories (name, description, default_price) VALUES (?, ?, ?)",
    [name, description || null, categoryDefaultPrice],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Category added", id: result.insertId });
    }
  );
});


app.put("/api/expense-categories/:id", (req, res) => {
  const db = require("./config/db");
  const { name, description, default_price, is_active } = req.body;
  const categoryDefaultPrice = default_price === "" || default_price == null ? 0 : Number(default_price);
  if (!Number.isFinite(categoryDefaultPrice) || categoryDefaultPrice < 0) {
    return res.status(400).json({ error: "Default price must be a valid amount" });
  }

  console.log("Category update called:", req.params.id, req.body);

  db.query(
    "UPDATE expense_categories SET name=?, description=?, default_price=?, is_active=? WHERE id=?",
    [name, description || null, categoryDefaultPrice, is_active ?? 1, req.params.id],
    (err, result) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ error: "Update failed" });
      }
      console.log("Update result:", result);
      res.json({ message: "Category updated" });
    }
  );
});

app.delete("/api/expense-categories/:id", (req, res) => {
  const db = require("./config/db");
  db.query(
    "DELETE FROM expense_categories WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ message: "Category deleted" });
    }
  );
});

// ── Vendor Management ───────────────────────────────────
app.get("/api/vendors", (req, res) => {
  const db = require("./config/db");
  db.query(
    "SELECT * FROM vendors ORDER BY name ASC",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Fetch failed" });
      res.json(results);
    }
  );
});

app.post("/api/vendors", (req, res) => {
  const db = require("./config/db");
  const { name, gst_number, contact_person, mobile, email, address, payment_terms } = req.body;
  if (!name) return res.status(400).json({ error: "Vendor name required" });
  db.query(
    `INSERT INTO vendors (name, gst_number, contact_person, mobile, email, address, payment_terms)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, gst_number || null, contact_person || null, mobile || null,
     email || null, address || null, payment_terms || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Vendor added", id: result.insertId });
    }
  );
});

app.put("/api/vendors/:id", (req, res) => {
  const db = require("./config/db");
  const { name, gst_number, contact_person, mobile, email, address, payment_terms } = req.body;
  if (!name) return res.status(400).json({ error: "Vendor name required" });
  db.query(
    `UPDATE vendors SET name=?, gst_number=?, contact_person=?,
     mobile=?, email=?, address=?, payment_terms=? WHERE id=?`,
    [name, gst_number || null, contact_person || null, mobile || null,
     email || null, address || null, payment_terms || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Vendor updated" });
    }
  );
});

app.delete("/api/vendors/:id", (req, res) => {
  const db = require("./config/db");
  db.query("DELETE FROM vendors WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Vendor deleted" });
  });
});
// ── Expense Reports ─────────────────────────────────────
app.get("/api/reports/category-wise", (req, res) => {
  const db = require("./config/db");
  const { from, to, month, year } = req.query;

  let whereClause = "WHERE 1=1";
  const params    = [];

  if (month && year) {
    whereClause += " AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?";
    params.push(month, year);
  } else if (from && to) {
    whereClause += " AND e.expense_date BETWEEN ? AND ?";
    params.push(from, to);
  }

  const sql = `
    SELECT
      COALESCE(ec.name, 'Uncategorized') AS category,
      COUNT(e.id)                         AS total_entries,
      SUM(e.amount)                       AS subtotal,
      SUM(e.gst_amount)                   AS total_gst,
      SUM(e.total_amount)                 AS total_amount,
      SUM(CASE WHEN e.payment_status = 'paid'    THEN e.total_amount ELSE 0 END) AS paid,
      SUM(CASE WHEN e.payment_status = 'unpaid'  THEN e.total_amount ELSE 0 END) AS unpaid,
      SUM(CASE WHEN e.payment_status = 'partial' THEN e.total_amount ELSE 0 END) AS partial
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    ${whereClause}
    GROUP BY ec.name
    ORDER BY total_amount DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) { console.error(err); return res.status(500).json({ error: "Report failed" }); }
    res.json(results);
  });
});

app.get("/api/reports/vendor-wise", (req, res) => {
  const db = require("./config/db");
  const { from, to, month, year } = req.query;

  let whereClause = "WHERE 1=1";
  const params    = [];

  if (month && year) {
    whereClause += " AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?";
    params.push(month, year);
  } else if (from && to) {
    whereClause += " AND e.expense_date BETWEEN ? AND ?";
    params.push(from, to);
  }

  const sql = `
    SELECT
      COALESCE(v.name, 'Unknown Vendor') AS vendor,
      v.gst_number,
      COUNT(e.id)                         AS total_entries,
      SUM(e.amount)                       AS subtotal,
      SUM(e.gst_amount)                   AS total_gst,
      SUM(e.total_amount)                 AS total_amount,
      SUM(CASE WHEN e.payment_status = 'paid'    THEN e.total_amount ELSE 0 END) AS paid,
      SUM(CASE WHEN e.payment_status = 'unpaid'  THEN e.total_amount ELSE 0 END) AS unpaid,
      SUM(CASE WHEN e.payment_status = 'partial' THEN e.total_amount ELSE 0 END) AS partial
    FROM expenses e
    LEFT JOIN vendors v ON e.vendor_id = v.id
    ${whereClause}
    GROUP BY v.name, v.gst_number
    ORDER BY total_amount DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) { console.error(err); return res.status(500).json({ error: "Report failed" }); }
    res.json(results);
  });
});

app.get("/api/reports/date-range", (req, res) => {
  const db = require("./config/db");
  const { from, to, month, year } = req.query;

  let whereClause = "WHERE 1=1";
  const params    = [];

  if (month && year) {
    whereClause += " AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = ?";
    params.push(month, year);
  } else if (from && to) {
    whereClause += " AND e.expense_date BETWEEN ? AND ?";
    params.push(from, to);
  }

  const sql = `
    SELECT
      e.expense_number,
      e.expense_date,
      COALESCE(v.name,  'Unknown')       AS vendor,
      COALESCE(ec.name, 'Uncategorized') AS category,
      e.client_name,
      e.project_name,
      e.unit_amount,
      e.units,
      e.amount,
      e.gst_percent,
      e.gst_amount,
      e.total_amount,
      e.gst_type,
      e.payment_mode,
      e.payment_status,
      e.notes
    FROM expenses e
    LEFT JOIN vendors v             ON e.vendor_id   = v.id
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    ${whereClause}
    ORDER BY e.expense_date DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) { console.error(err); return res.status(500).json({ error: "Report failed" }); }
    res.json(results);
  });
});


// ── Service Management ──────────────────────────────────
app.get("/api/services", (req, res) => {
  const db       = require("./config/db");
  const showAll  = req.query.all === "true";
  const sql      = showAll
    ? "SELECT * FROM services ORDER BY name ASC"
    : "SELECT * FROM services WHERE is_active = 1 ORDER BY name ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(results);
  });
});

app.post("/api/services", (req, res) => {
  const db = require("./config/db");
  const { name, sac_code, default_price, description } = req.body;
  if (!name) return res.status(400).json({ error: "Service name required" });
  db.query(
    "SELECT id FROM services WHERE name = ?", [name],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (result.length > 0) return res.status(400).json({ error: "Service already exists" });
      db.query(
        "INSERT INTO services (name, sac_code, default_price, description) VALUES (?, ?, ?, ?)",
        [name, sac_code || null, default_price || 0, description || null],
        (err, result) => {
          if (err) return res.status(500).json({ error: "Insert failed" });
          res.json({ message: "Service added", id: result.insertId });
        }
      );
    }
  );
});

app.put("/api/services/:id", (req, res) => {
  const db = require("./config/db");
  const { name, sac_code, default_price, description, is_active } = req.body;
  if (!name) return res.status(400).json({ error: "Service name required" });
  db.query(
    `UPDATE services SET name=?, sac_code=?, default_price=?,
     description=?, is_active=? WHERE id=?`,
    [name, sac_code || null, default_price || 0,
     description || null, is_active ?? 1, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Service updated" });
    }
  );
});

app.delete("/api/services/:id", (req, res) => {
  const db = require("./config/db");
  db.query("DELETE FROM services WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Service deleted" });
  });
});

// Feature routes
app.use("/api/invoices", invoiceRoutes);
app.use("/api/pdf",      pdfRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/expenses", expenseRoutes); 



const PORT = process.env.PORT || 5000;
startAutoBackupScheduler();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
