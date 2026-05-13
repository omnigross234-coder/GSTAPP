// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// db.connect((err) => {
//   if (err) {
//     console.error("Database connection failed:", err);
//   } else {
//     console.log("MySQL Connected");
//   }
// });
const mysql = require("mysql2");

const getDbConfig = () => {
  if (process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ""),
      port: Number(dbUrl.port) || 3306,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 20000,
    };
  }

  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
  };
};

const dbConfig = getDbConfig();

console.log(
  `MySQL config: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
);

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

module.exports = db;
