import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AddVisitorModal({ token, onClose, onAdded }) {
  const [form, setForm] = useState({ name: "", flat: "", purpose: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/visitors/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add visitor");
      onAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Add New Visitor</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} name="name" placeholder="Visitor Name *" value={form.name} onChange={handleChange} required />
          <input style={styles.input} name="flat" placeholder="Flat Number *" value={form.flat} onChange={handleChange} required />
          <input style={styles.input} name="purpose" placeholder="Purpose of Visit" value={form.purpose} onChange={handleChange} />
          <input style={styles.input} name="phone" placeholder="Visitor Phone" value={form.phone} onChange={handleChange} />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.btnRow}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Adding..." : "Add Visitor & Notify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  title: { margin: "0 0 20px", fontSize: 20, color: "#1e293b" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { padding: "12px 16px", borderRadius: 8, border: "1px solid #ddd", fontSize: 15, outline: "none" },
  error: { color: "red", fontSize: 13, margin: 0 },
  btnRow: { display: "flex", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 12, background: "#f1f5f9", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15 },
  submitBtn: { flex: 2, padding: 12, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 },
};
