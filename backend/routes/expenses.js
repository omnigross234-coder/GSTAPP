const express = require("express");
const router  = express.Router();
const db      = require("../config/db");

// ── Generate expense number ─────────────────────────────
const generateExpenseNumber = (callback) => {
  const year = new Date().getFullYear();
  const sql  = `
    SELECT expense_number FROM expenses
    WHERE expense_number LIKE 'EXP-${year}-%'
    ORDER BY id DESC LIMIT 1
  `;
  db.query(sql, (err, result) => {
    if (err) return callback(err);
    let next = 1;
    if (result.length > 0) {
      const last = result[0].expense_number;
      next = parseInt(last.split("-")[2]) + 1;
    }
    callback(null, `EXP-${year}-${String(next).padStart(4, "0")}`);
  });
};

const calculateExpenseAmounts = ({ unit_amount, units, amount, gst_percent }) => {
  const unitAmount = Number(unit_amount ?? amount) || 0;
  const qty        = Number(units) || 1;
  const gstPct     = Number(gst_percent) || 0;
  const subtotal   = unitAmount * qty;
  const gstAmount  = (subtotal * gstPct) / 100;

  return {
    unitAmount: unitAmount.toFixed(2),
    units: qty.toFixed(2),
    subtotal: subtotal.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    total: (subtotal + gstAmount).toFixed(2),
  };
};

const validateExpenseQuantity = (units) => {
  const qty = Number(units || 1);
  return Number.isInteger(qty) && qty > 0;
};

//  DASHBOARD STATS
router.get("/dashboard", (req, res) => {
  const { from, to, month, year } = req.query;

  let whereClause = "WHERE 1=1";
  const params    = [];

  if (month && year) {
    whereClause += " AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?";
    params.push(month, year);
  } else if (from && to) {
    whereClause += " AND expense_date BETWEEN ? AND ?";
    params.push(from, to);
  } else {
    // Default: current month
    whereClause += " AND MONTH(expense_date) = MONTH(CURDATE()) AND YEAR(expense_date) = YEAR(CURDATE())";
  }

  // Total stats
  const statsSql = `
    SELECT
      COUNT(*)                                          AS total_expenses,
      COALESCE(SUM(total_amount), 0)                    AS total_amount,
      COALESCE(SUM(gst_amount), 0)                      AS total_gst,
      COALESCE(SUM(CASE WHEN payment_status = 'paid'   THEN total_amount ELSE 0 END), 0) AS paid_amount,
      COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END), 0) AS unpaid_amount,
      COALESCE(SUM(CASE WHEN payment_status = 'partial' THEN total_amount ELSE 0 END), 0) AS partial_amount
    FROM expenses ${whereClause}
  `;

  // Monthly trend (last 6 months)
  const trendSql = `
    SELECT 
      DATE_FORMAT(expense_date, '%b %Y') AS month_label,
      MONTH(expense_date)                AS month_num,
      YEAR(expense_date)                 AS year_num,
      SUM(total_amount)                  AS total
    FROM expenses
    WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY year_num, month_num, month_label
    ORDER BY year_num ASC, month_num ASC
  `;

  // Category wise
  const categorySql = `
    SELECT 
      ec.name          AS category,
      SUM(e.total_amount) AS total
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    ${whereClause}
    GROUP BY ec.name
    ORDER BY total DESC
    LIMIT 8
  `;

  // Payment status breakdown
  const statusSql = `
    SELECT payment_status, COUNT(*) AS count, SUM(total_amount) AS total
    FROM expenses ${whereClause}
    GROUP BY payment_status
  `;

  // Recent expenses
  const recentSql = `
    SELECT 
      e.id, e.expense_number, e.expense_date, e.client_name,
      e.total_amount, e.payment_status, e.payment_mode,
      v.name AS vendor_name,
      ec.name AS category_name
    FROM expenses e
    LEFT JOIN vendors v              ON e.vendor_id   = v.id
    LEFT JOIN expense_categories ec  ON e.category_id = ec.id
    ORDER BY e.created_at DESC
    LIMIT 5
  `;

  // Top vendors
  const vendorSql = `
    SELECT 
      v.name AS vendor_name,
      COUNT(e.id)          AS total_expenses,
      SUM(e.total_amount)  AS total_amount
    FROM expenses e
    LEFT JOIN vendors v ON e.vendor_id = v.id
    ${whereClause}
    GROUP BY v.name
    ORDER BY total_amount DESC
    LIMIT 5
  `;

  // Run all queries
  db.query(statsSql, params, (err, stats) => {
    if (err) return res.status(500).json({ error: "Stats query failed" });

    db.query(trendSql, [], (err, trend) => {
      if (err) return res.status(500).json({ error: "Trend query failed" });

      db.query(categorySql, params, (err, categories) => {
        if (err) return res.status(500).json({ error: "Category query failed" });

        db.query(statusSql, params, (err, statusData) => {
          if (err) return res.status(500).json({ error: "Status query failed" });

          db.query(recentSql, [], (err, recent) => {
            if (err) return res.status(500).json({ error: "Recent query failed" });

            db.query(vendorSql, params, (err, vendors) => {
              if (err) return res.status(500).json({ error: "Vendor query failed" });

              res.json({
                stats:      stats[0],
                trend,
                categories,
                statusData,
                recent,
                vendors
              });
            });
          });
        });
      });
    });
  });
});

//  GET ALL EXPENSES
router.get("/", (req, res) => {
  const { from, to, month, category_id, payment_status, search } = req.query;

  let whereClause = "WHERE 1=1";
  const params    = [];

  if (from && to) {
    whereClause += " AND e.expense_date BETWEEN ? AND ?";
    params.push(from, to);
  }
  if (month) {
    whereClause += " AND MONTH(e.expense_date) = ? AND YEAR(e.expense_date) = YEAR(CURDATE())";
    params.push(month);
  }
  if (category_id) {
    whereClause += " AND e.category_id = ?";
    params.push(category_id);
  }
  if (payment_status) {
    whereClause += " AND e.payment_status = ?";
    params.push(payment_status);
  }
  if (search) {
    whereClause += " AND (e.expense_number LIKE ? OR v.name LIKE ? OR e.client_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT 
      e.*,
      v.name  AS vendor_name,
      ec.name AS category_name
    FROM expenses e
    LEFT JOIN vendors v             ON e.vendor_id   = v.id
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    ${whereClause}
    ORDER BY e.expense_date DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(results);
  });
});

//  GET SINGLE EXPENSE
router.get("/:id", (req, res) => {
  const sql = `
    SELECT e.*, v.name AS vendor_name, ec.name AS category_name
    FROM expenses e
    LEFT JOIN vendors v             ON e.vendor_id   = v.id
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    WHERE e.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(results[0]);
  });
});

// CREATE EXPENSE
router.post("/", (req, res) => {
  const {
    expense_date, vendor_id, category_id, client_name, project_name,
    unit_amount, units, amount, gst_percent, gst_type,
    payment_mode, payment_status, due_date, notes, created_by
  } = req.body;

  if (!expense_date || !(unit_amount || amount)) {
    return res.status(400).json({ error: "Date and amount are required" });
  }
  if (!validateExpenseQuantity(units)) {
    return res.status(400).json({ error: "Units must be a whole number greater than 0" });
  }

  const totals = calculateExpenseAmounts({ unit_amount, units, amount, gst_percent });

  generateExpenseNumber((err, expense_number) => {
    if (err) return res.status(500).json({ error: "Number generation failed" });

    const sql = `
      INSERT INTO expenses (
        expense_number, expense_date, vendor_id, category_id,
        client_name, project_name, unit_amount, units, amount, gst_percent, gst_amount,
        total_amount, gst_type, payment_mode, payment_status,
        due_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      expense_number, expense_date, vendor_id || null, category_id || null,
      client_name || null, project_name || null, totals.unitAmount, totals.units,
      totals.subtotal, gst_percent || 0, totals.gstAmount, totals.total,
      gst_type || null, payment_mode || null, payment_status || "unpaid",
      due_date || null, notes || null, created_by || null
    ], (err, result) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ message: "Expense added", id: result.insertId, expense_number });
    });
  });
});

// UPDATE EXPENSE
router.put("/:id", (req, res) => {
  const {
    expense_date, vendor_id, category_id, client_name, project_name,
    unit_amount, units, amount, gst_percent, gst_type,
    payment_mode, payment_status, due_date, notes
  } = req.body;

  const totals = calculateExpenseAmounts({ unit_amount, units, amount, gst_percent });

  if (!validateExpenseQuantity(units)) {
    return res.status(400).json({ error: "Units must be a whole number greater than 0" });
  }

  const sql = `
    UPDATE expenses SET
      expense_date   = ?, vendor_id      = ?, category_id  = ?,
      client_name    = ?, project_name   = ?, unit_amount   = ?,
      units          = ?, amount         = ?, gst_percent   = ?,
      gst_amount     = ?, total_amount   = ?,
      gst_type       = ?, payment_mode   = ?, payment_status = ?,
      due_date       = ?, notes          = ?
    WHERE id = ?
  `;

  db.query(sql, [
    expense_date, vendor_id || null, category_id || null,
    client_name || null, project_name || null, totals.unitAmount,
    totals.units, totals.subtotal, gst_percent || 0,
    totals.gstAmount, totals.total,
    gst_type || null, payment_mode || null, payment_status || "unpaid",
    due_date || null, notes || null, req.params.id
  ], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    res.json({ message: "Expense updated" });
  });
});

// DELETE EXPENSE
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM expenses WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Expense deleted" });
  });
});

//  UPDATE PAYMENT STATUS
router.patch("/:id/status", (req, res) => {
  const { payment_status } = req.body;
  const allowed = ["paid", "unpaid", "partial"];
  if (!allowed.includes(payment_status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  db.query(
    "UPDATE expenses SET payment_status = ? WHERE id = ?",
    [payment_status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Update failed" });
      res.json({ message: "Status updated" });
    }
  );
});

module.exports = router;
