import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiLock, FiCheckCircle } from "react-icons/fi";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async () => {
    setError("");
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://backend-msas.onrender.com/verify-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Username not found");
        return;
      }

      setStep(2);
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");

    if (!newPassword || !confirmPass) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    if (newPassword !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://backend-msas.onrender.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }

      alert("Password reset successful! Please login.");
      navigate("/login");
    } catch {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="og-wrap">
      <div className="og-glow"></div>
      <div className="og-grid"></div>
      <div className="og-p og-p1"></div>
      <div className="og-p og-p2"></div>

      <div className="og-card">
        <button className="og-close" onClick={() => navigate("/login")}>
          <FiArrowLeft />
        </button>

        <div className="og-brand">
          <div className="og-logobox">
            <img src="/OmniGrosslogo2.png" alt="OmniGross Logo" className="og-logo" />
          </div>

          <h1 className="og-bname">Forgot Password</h1>
          <p className="og-bsub">
            {step === 1 ? "VERIFY USERNAME" : "SET NEW PASSWORD"}
          </p>
        </div>

        <div className="og-div"></div>

        <div className="fp-step-box">
          <div className={`fp-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className={`fp-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`fp-step ${step >= 2 ? "active" : ""}`}>2</div>
        </div>

        {error && <div className="og-err">{error}</div>}

        {step === 1 && (
          <>
            <div className="og-field">
              <label className="og-lbl">Username</label>
              <div className="og-iw">
                <input
                  type="text"
                  className="og-inp"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
                <FiUser className="fp-input-icon" />
              </div>
            </div>

            <button
              className={`og-btn ${loading ? "og-btn--ld" : ""}`}
              onClick={handleVerify}
              disabled={loading}
            >
              {loading && <span className="og-spin"></span>}
              {loading ? "Verifying..." : "Verify Username"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="fp-success">
              <FiCheckCircle />
              Username <strong>{username}</strong> verified
            </div>

            <div className="og-field">
              <label className="og-lbl">New Password</label>
              <div className="og-iw">
                <input
                  type="password"
                  className="og-inp"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <FiLock className="fp-input-icon" />
              </div>
            </div>

            <div className="og-field">
              <label className="og-lbl">Confirm Password</label>
              <div className="og-iw">
                <input
                  type="password"
                  className="og-inp"
                  placeholder="Confirm new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                />
                <FiLock className="fp-input-icon" />
              </div>
            </div>

            <button
              className={`og-btn ${loading ? "og-btn--ld" : ""}`}
              onClick={handleReset}
              disabled={loading}
            >
              {loading && <span className="og-spin"></span>}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <p className="fp-login-text">
          Remember your password?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

        <div className="og-foot">
          <span className="og-dot"></span>
          <span className="og-ftxt">SECURE PASSWORD RECOVERY</span>
          <span className="og-dot"></span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
