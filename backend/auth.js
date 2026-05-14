const db = require("./config/db");
const jwt = require("jsonwebtoken");

//  LOGIN
const login = (req, res) => {
  console.log("AUTH LOGIN CALLED");
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0];

    // Check if account is active
    if (user.is_active === 0) {
      return res.status(403).json({ error: "Account is deactivated. Contact admin." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({ error: "Server configuration error" });
    }

    let token;
    try {
      token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );
    } catch (err) {
      console.error("JWT sign error:", err);
      return res.status(500).json({ error: "Token creation failed" });
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role
      }
    });
  });
};

//  VERIFY USERNAME (forgot password step 1)
const verifyUsername = (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  const sql = "SELECT id, username FROM users WHERE username = ?";
  db.query(sql, [username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.status(404).json({ error: "Username not found" });
    res.json({ message: "Username verified", username: result[0].username });
  });
};

//  RESET PASSWORD (forgot password step 2)
const resetPassword = (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ error: "All fields required" });
  if (newPassword.length < 4) return res.status(400).json({ error: "Password must be at least 4 characters" });

  const sql = "UPDATE users SET password = ? WHERE username = ?";
  db.query(sql, [newPassword, username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Password reset successful" });
  });
};

// GET ALL USERS (admin only)
const getUsers = (req, res) => {
  const sql = "SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
};

//  ADD NEW USER (admin only)
const addUser = (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "").trim();

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password and role are required" });
  }

  const allowedRoles = ["admin", "user"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const duplicateSql = `
    SELECT username, email
    FROM users
    WHERE username = ? OR (email IS NOT NULL AND email <> '' AND email = ?)
    LIMIT 1
  `;

  db.query(duplicateSql, [username, email], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (result.length > 0) {
      if (result[0].username === username) {
        return res.status(400).json({ error: "Username already exists" });
      }
      return res.status(400).json({ error: "Email already exists" });
    }

    const sql = "INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)";
    db.query(sql, [username, email || null, password, role], (err, result) => {
      if (err) {
        console.error("User creation error:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Username or email already exists" });
        }

        return res.status(500).json({ error: "User creation failed" });
      }
      res.json({ message: "User created successfully", id: result.insertId });
    });
  });
};

// TOGGLE ACTIVATE / DEACTIVATE (admin only)
const toggleUserStatus = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ error: "is_active field required" });
  }

  db.query("UPDATE users SET is_active = ? WHERE id = ?", [is_active, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: `User ${is_active ? "activated" : "deactivated"} successfully` });
  });
};

module.exports = {
  login,
  verifyUsername,
  resetPassword,
  getUsers,
  addUser,
  toggleUserStatus
};
