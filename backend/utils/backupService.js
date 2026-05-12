require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { google } = require("googleapis");
const { exec }   = require("child_process");
const fs         = require("fs");
const path       = require("path");

//  Your actual Drive folder ID — hardcoded
const DRIVE_FOLDER_ID = "1btTvD160xFt8FOgmjjI2RzAR8pEee9k7"; // keep your real folder ID here

const TEMP_DIR = path.join(__dirname, "..", "temp_backups");

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
function createDump() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName  = `gst_app_backup_${timestamp}.sql`;
    const filePath  = path.join(TEMP_DIR, fileName);

    const cmd = `mysqldump -h localhost -P 3306 -u root --single-transaction --routines --triggers gst_app > "${filePath}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(`mysqldump failed: ${stderr || err.message}`));
      resolve({ filePath, fileName });
    });
  });
}

async function uploadToDrive(filePath, fileName) {
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