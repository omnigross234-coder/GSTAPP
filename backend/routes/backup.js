// backend/routes/backup.js

const express       = require("express");
const cron          = require("node-cron");
const jwt           = require("jsonwebtoken");   //  already in your project
const { runBackup } = require("../utils/backupService");

const router = express.Router();

// ── Self-contained JWT + Admin guard ─────────────────────────
// No external middleware needed — works with YOUR exact JWT
// payload: { id, username, role }  (from your auth.js line 28)
function verifyAdmin(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided." });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //  same secret your login uses

    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admins only." });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

// ── POST /api/backup/manual ───────────────────────────────────
router.post("/manual", verifyAdmin, async (req, res) => {
  try {
    const result = await runBackup();

    // ✅ Save to backups table
    const db = require("../config/db");
    db.query(
      "INSERT INTO backups (filename, type, created_by) VALUES (?, 'manual', ?)",
      [result.fileName, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "✅ Backup uploaded to Google Drive.",
      data: result,
    });
  } catch (err) {
    console.error("[Backup] Manual failed:", err.message);
    res.status(500).json({ success: false, message: "Backup failed.", error: err.message });
  }
});

// ── GET /api/backup/status ────────────────────────────────────
router.get("/status", verifyAdmin, (req, res) => {
  const autoBackupEnabled = process.env.AUTO_BACKUP_ENABLED === "true";
  res.json({
    success: true,
    manualBackup: true,
    autoBackup: autoBackupEnabled,
    message: autoBackupEnabled
      ? "Auto backup service active."
      : "Auto backup is not supported in this deployment. Use manual backup.",
    schedule: autoBackupEnabled ? "Daily 2:00 AM IST" : null
  });
});

// ── Auto scheduler — 2:00 AM IST every day ───────────────────
function startAutoBackupScheduler() {
  if (process.env.AUTO_BACKUP_ENABLED !== "true") {
    console.log("[Auto Backup] Disabled. Set AUTO_BACKUP_ENABLED=true to enable scheduler.");
    return;
  }

  cron.schedule(
  process.env.BACKUP_CRON || "0 2 * * *",
  async () => {
    console.log("[Auto Backup] 2AM triggered —", new Date().toISOString());
    try {
      const r = await runBackup();

      //  Save to backups table
      const db = require("../config/db");
      db.query(
        "INSERT INTO backups (filename, type, created_by) VALUES (?, 'auto', NULL)",
        [r.fileName]
      );

      console.log("[Auto Backup] ✅", r.fileName, "→", r.driveLink);
    } catch (err) {
      console.error("[Auto Backup] ❌", err.message);
    }
  },
  { timezone: "Asia/Kolkata" }
);
  console.log("[Auto Backup] ✅ Scheduler ready — 2:00 AM IST daily");
}

// GET /api/backup/history — last 10 backups
router.get("/history", verifyAdmin, (req, res) => {
  const db = require("../config/db");
  db.query(
    `SELECT b.id, b.filename, b.type, b.created_at,
            u.username as created_by
     FROM backups b
     LEFT JOIN users u ON b.created_by = u.id
     ORDER BY b.created_at DESC
     LIMIT 10`,
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "DB error" });
      res.json({ success: true, data: results });
    }
  );
});

module.exports = { router, startAutoBackupScheduler };
