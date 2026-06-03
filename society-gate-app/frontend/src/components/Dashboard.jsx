import React, { useEffect, useState } from "react";
import AddVisitorModal from "./AddVisitorModal";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000";

const STATUS_COLOR = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

export default function Dashboard({ token, onLogout }) {
  const [visitors, setVisitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const headers = { Authorization: `Bearer ${token}` };

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/visitors/`, { headers });
      const data = await res.json();
      setVisitors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const approve = async (id) => {
    await fetch(`${API}/approve/${id}`, { method: "POST" });
    fetchVisitors();
  };

  const reject = async (id) => {
    await fetch(`${API}/reject/${id}`, { method: "POST" });
    fetchVisitors();
  };

  const filtered = filter === "all" ? visitors : visitors.filter((v) => v.status === filter);

  const stats = {
    total: visitors.length,
    pending: visitors.filter((v) => v.status === "pending").length,
    approved: visitors.filter((v) => v.status === "approved").length,
    rejected: visitors.filter((v) => v.status === "rejected").length,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏢 Society Gate — Admin Dashboard</h1>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: "Total", value: stats.total, color: "#6366f1" },
          { label: "Pending", value: stats.pending, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, color: "#10b981" },
          { label: "Rejected", value: stats.rejected, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
            <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filterRow}>
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background: filter === f ? "#4f46e5" : "#f1f5f9",
                color: filter === f ? "#fff" : "#333",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addBtn}>
          + Add Visitor
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading visitors...</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.th}>
                <th>ID</th><th>Name</th><th>Flat</th><th>Purpose</th><th>Status</th><th>Time</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#aaa" }}>No visitors found</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} style={styles.tr}>
                  <td style={styles.td}>#{v.id}</td>
                  <td style={styles.td}>{v.name}</td>
                  <td style={styles.td}>{v.flat}</td>
                  <td style={styles.td}>{v.purpose || "—"}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: STATUS_COLOR[v.status] }}>
                      {v.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(v.created_at).toLocaleString()}</td>
                  <td style={styles.td}>
                    {v.status === "pending" && (
                      <>
                        <button onClick={() => approve(v.id)} style={styles.approveBtn}>✅</button>
                        <button onClick={() => reject(v.id)} style={styles.rejectBtn}>❌</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddVisitorModal
          token={token}
          onClose={() => setShowModal(false)}
          onAdded={fetchVisitors}
        />
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f8fafc", padding: 24 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { margin: 0, fontSize: 22, color: "#1e293b" },
  logoutBtn: { padding: "8px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  statsRow: { display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 120, background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statNum: { fontSize: 32, fontWeight: 700 },
  statLabel: { color: "#888", marginTop: 4 },
  controls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  filterRow: { display: "flex", gap: 8 },
  filterBtn: { padding: "8px 16px", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: 500 },
  addBtn: { padding: "10px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  tableWrapper: { background: "#fff", borderRadius: 12, overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#f1f5f9", textAlign: "left" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 16px", fontSize: 14 },
  badge: { padding: "4px 10px", borderRadius: 20, color: "#fff", fontSize: 12, fontWeight: 600 },
  approveBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", marginRight: 4 },
  rejectBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer" },
};
