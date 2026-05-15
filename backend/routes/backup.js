// backend/routes/backup.js

const express       = require("express");
const cron          = require("node-cron");
const jwt           = require("jsonwebtoken");   //  already in your project
const { runBackup } = require("../utils/backupService");

const router = express.Router();

const getBackupSchedule = () => process.env.BACKUP_CRON || "45 18 * * *";
const getBackupScheduleLabel = () => "Daily 6:45 PM IST";
const isSchedulerEnabled = () => process.env.AUTO_BACKUP_ENABLED === "true";
const isExternalCronEnabled = () => Boolean(process.env.BACKUP_CRON_SECRET);

function saveBackupRecord(fileName, type, createdBy = null) {
  const db = require("../config/db");
  db.query(
    "INSERT INTO backups (filename, type, created_by) VALUES (?, ?, ?)",
    [fileName, type, createdBy]
  );
}

async function runAutoBackup() {
  const result = await runBackup();
  saveBackupRecord(result.fileName, "auto", null);
  return result;
}

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
    saveBackupRecord(result.fileName, "manual", req.user.id);

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
  const schedulerEnabled = isSchedulerEnabled();
  const externalCronEnabled = isExternalCronEnabled();
  const autoBackupEnabled = schedulerEnabled || externalCronEnabled;

  res.json({
    success: true,
    manualBackup: true,
    autoBackup: autoBackupEnabled,
    schedulerEnabled,
    externalCronEnabled,
    autoRunEndpoint: externalCronEnabled ? "/api/backup/auto-run" : null,
    message: autoBackupEnabled
      ? "Auto backup service active."
      : "Auto backup is not configured. Use manual backup or configure BACKUP_CRON_SECRET.",
    schedule: getBackupScheduleLabel(),
    cron: getBackupSchedule()
  });
});

router.all("/auto-run", async (req, res) => {
  const configuredSecret = process.env.BACKUP_CRON_SECRET;
  const providedSecret =
    req.headers["x-backup-secret"] ||
    req.query.secret ||
    req.body?.secret;

  if (!configuredSecret) {
    return res.status(503).json({
      success: false,
      message: "Auto backup endpoint is not configured. Set BACKUP_CRON_SECRET."
    });
  }

  if (providedSecret !== configuredSecret) {
    return res.status(401).json({ success: false, message: "Invalid backup secret." });
  }

  try {
    const result = await runAutoBackup();
    res.json({
      success: true,
      message: "Auto backup completed.",
      data: result
    });
  } catch (err) {
    console.error("[Auto Backup] Endpoint failed:", err.message);
    res.status(500).json({ success: false, message: "Auto backup failed.", error: err.message });
  }
});

// ── Auto scheduler — 6:45 PM IST every day ───────────────────
function startAutoBackupScheduler() {
  if (!isSchedulerEnabled()) {
    console.log("[Auto Backup] Disabled. Set AUTO_BACKUP_ENABLED=true to enable scheduler.");
    return;
  }

  cron.schedule(
  getBackupSchedule(),
  async () => {
    console.log("[Auto Backup] 6:45 PM IST triggered —", new Date().toISOString());
    try {
      const r = await runAutoBackup();

      console.log("[Auto Backup] ✅", r.fileName, "→", r.driveLink);
    } catch (err) {
      console.error("[Auto Backup] ❌", err.message);
    }
  },
  { timezone: "Asia/Kolkata" }
);
  console.log("[Auto Backup] ✅ Scheduler ready — 6:45 PM IST daily");
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

