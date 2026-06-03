import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏢 Society Gate</h1>
        <p style={styles.sub}>Admin / Guard Login</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 40,
    width: 360,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  title: { margin: 0, fontSize: 28, color: "#1a1a2e", textAlign: "center" },
  sub: { textAlign: "center", color: "#888", marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    outline: "none",
  },
  btn: {
    padding: "14px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 8,
  },
  error: { color: "red", fontSize: 13, margin: 0 },
};
