import { useState } from "react";
import { useStore } from "../store";

export default function Settings() {
  const { allocations, addAlokasi, removeAlokasi } = useStore();
  const [label, setLabel] = useState("");
  const [id, setId] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const l = label.trim();
    if (!l) return;

    // Auto-generate ID if empty: lowercase, remove non-alphanumeric, dash
    const finalId = id.trim() || l.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (!finalId) return;

    if (allocations.some((a) => a.id === finalId)) {
      alert("ID Alokasi sudah ada (pastikan ID unik)");
      return;
    }
    
    addAlokasi(finalId, l);
    setLabel("");
    setId("");
  };

  const handleRemove = (id: string, label: string) => {
    if (confirm(`Hapus alokasi "${label}" (${id})?`)) {
      removeAlokasi(id);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h3>Pengaturan Alokasi</h3>
        <p className="muted">
          Kelola daftar dompet/akun yang digunakan untuk transaksi.
        </p>

        <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (contoh: Dompet)"
              style={{ flex: 2 }}
            />
             <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ID (opsional)"
              style={{ flex: 1 }}
            />
          </div>
          <button
          style={{
                  background: "#0084ffff",
                  color: "#ffffff",
                  borderRadius: 8,
                  padding: "8px",
                  fontSize: 14,
                  fontWeight: "bold",
                  width: "100%"
                }}
                type="submit"
                disabled={!label.trim()}>
            Tambah
          </button>
        </form>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {allocations.map((item) => (
            <div
              key={item.id}
              className="row"
              style={{
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--bg-subtler)",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>ID: {item.id}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id, item.label)}
                style={{
                  background: "transparent",
                  color: "#ef4444",
                  border: "none",
                  padding: 4,
                  fontSize: 12,
                }}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
