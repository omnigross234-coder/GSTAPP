import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../domain/ValidationLogin";
import "./LoginPage.css";
// import logo from "../assets/OmniGrosslogo2.png"; 
import { FiEye, FiEyeOff } from "react-icons/fi";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    const validationError = validateLogin(username, password);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Invalid credentials"); return; }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));

      if      (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "user")  navigate("/invoice");
      else    setError("Unknown role. Contact admin.");

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="og-wrap">

      {/* Background layers */}
      <div className="og-glow" />
      <div className="og-grid" />
      <div className="og-p og-p1" />
      <div className="og-p og-p2" />

      <div className="og-card">

        {/* Close */}
        <button className="og-close" onClick={() => navigate("/")}>
          &times;
        </button>

        {/* Brand */}
        <div className="og-brand">
          <div className="og-logobox">
            <img src="/OmniGrosslogo2.png"alt="OmniGross Logo" className="og-logo" />
         
          </div>
          <p className="og-bname">OmniGross</p>
          <p className="og-bsub">GST Invoice Management</p>
        </div>

        <div className="og-div" />

        {/* Error */}
        {error && (
          <div className="og-err">&#9888; {error}</div>
        )}

        {/* Username */}
        <div className="og-field">
          <label className="og-lbl">Username</label>
          <input
            type="text"
            className="og-inp"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className="og-field">
          <label className="og-lbl">Password</label>
          <div className="og-iw">
            <input
              type={showPass ? "text" : "password"}
              className="og-inp"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
            <button
              className="og-eye"
              tabIndex={-1}
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Forgot */}
        <div className="og-frow">
          <span
            className="og-fgt"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </div>

        {/* Login button */}
        <button
          className={`og-btn${loading ? " og-btn--ld" : ""}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading && <span className="og-spin" />}
          {loading ? "Authenticating…" : "Sign In"}
        </button>

        {/* Footer */}
        <div className="og-foot">
          <span className="og-dot" />
          <span className="og-ftxt">Secure · Encrypted · Enterprise</span>
          <span className="og-dot" />
        </div>

      </div>
    </div>
  );
}

export default LoginPage;