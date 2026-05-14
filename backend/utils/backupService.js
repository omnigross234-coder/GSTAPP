require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { google } = require("googleapis");
const mysql      = require("mysql2/promise");
const fs         = require("fs");
const path       = require("path");

//  Your actual Drive folder ID — hardcoded
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const TEMP_DIR = path.join(__dirname, "..", "temp_backups");

function getDbDumpConfig() {
  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      port: Number(dbUrl.port) || 3306,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ""),
    };
  }

  return {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gst_app",
  };
}

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) {
    return mysql.escape(value.toISOString().slice(0, 19).replace("T", " "));
  }
  if (Buffer.isBuffer(value)) return `X'${value.toString("hex")}'`;
  return mysql.escape(value);
}

function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3001/callback"
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.drive({ version: "v3", auth: oauth2Client });
}
async function createDump() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName  = `gst_app_backup_${timestamp}.sql`;
  const filePath  = path.join(TEMP_DIR, fileName);
  const dbConfig  = getDbDumpConfig();

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    throw new Error("Database backup config is incomplete.");
  }

  const connection = await mysql.createConnection({
    ...dbConfig,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const lines = [
      "-- GST app backup",
      `-- Created: ${new Date().toISOString()}`,
      `-- Database: ${dbConfig.database}`,
      "SET FOREIGN_KEY_CHECKS=0;",
      "",
    ];

    const [tables] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
    const tableNameKey = `Tables_in_${dbConfig.database}`;

    for (const tableRow of tables) {
      const tableName = tableRow[tableNameKey] || Object.values(tableRow)[0];
      const escapedTable = `\`${String(tableName).replace(/`/g, "``")}\``;

      const [createRows] = await connection.query(`SHOW CREATE TABLE ${escapedTable}`);
      const createSql = createRows[0]["Create Table"];

      lines.push(`DROP TABLE IF EXISTS ${escapedTable};`);
      lines.push(`${createSql};`);
      lines.push("");

      const [rows] = await connection.query(`SELECT * FROM ${escapedTable}`);
      for (const row of rows) {
        const columns = Object.keys(row).map((col) => `\`${col.replace(/`/g, "``")}\``).join(", ");
        const values = Object.values(row).map(sqlValue).join(", ");
        lines.push(`INSERT INTO ${escapedTable} (${columns}) VALUES (${values});`);
      }

      lines.push("");
    }

    lines.push("SET FOREIGN_KEY_CHECKS=1;");
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    return { filePath, fileName };
  } finally {
    await connection.end();
  }
}

async function uploadToDrive(filePath, fileName) {
  if (!DRIVE_FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured.");
  }

  const drive    = getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name:    fileName,
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: "application/octet-stream",
      body:     fs.createReadStream(filePath),
    },
    fields: "id, name, webViewLink",
  });
  return response.data;
}

async function runBackup() {
  console.log(`[Backup] Starting — ${new Date().toISOString()}`);
  const { filePath, fileName } = await createDump();
  const fileData = await uploadToDrive(filePath, fileName);
  try { fs.unlinkSync(filePath); } catch (_) {}
  console.log(`[Backup] Done — ${fileData.webViewLink}`);
  return {
    success:   true,
    fileName,
    driveLink: fileData.webViewLink,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { runBackup };
