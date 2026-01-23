import { useStore } from "../store";
import { idr } from "../utils/format";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

type Tx = ReturnType<typeof useStore>["txns"][number];

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="pill"
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: active ? "#3ecf8e" : "#ff6b6b",
        background: active ? "rgba(62,207,142,.06)" : "rgba(255,107,107,.06)",
        textAlign: "center",
      }}
    >
      {active ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}

function ActionButton({
  danger,
  children,
  onClick,
}: {
  danger?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid",
        borderColor: danger ? "#5b1f26" : "#2b6ef6",
        background: danger ? "#ff6b6b" : "#2b6ef6",
        color: "#fff",
        width: "50%",
      }}
    >
      {children}
    </button>
  );
}

function TransactionCard({ tx }: { tx: Tx }) {
  const store = useStore();
  const isMasuk = tx.tipe === "masuk";

  return (
    <div
      className="card"
      style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Kiri */}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 13, color: "#9aa4b2", marginBottom: "4px" }}>
          {tx.tanggal}
          <span style={{ marginLeft: "10px" }}>
            <StatusBadge active={!tx.dihapus} />
          </span>
        </div>
        {tx.isPlanned && (
          <span
            className="pill"
            style={{ color: "#eab308", textAlign: "center", width: "75%" }}
          >
            Akan datang
          </span>
        )}
        <div>
          {tx.dihapus ? (
            <ActionButton onClick={() => store.restore(tx.id)}>
              Pulihkan
            </ActionButton>
          ) : (
            <ActionButton danger onClick={() => store.softDelete(tx.id)}>
              Hapus
            </ActionButton>
          )}
          {tx.isPlanned && (
            <button
              style={{
                fontSize: 12,
                padding: "8px",
                borderRadius: 10,
                border: "1px solid",
                background: "#2b6ef6",
                color: "#fff",
                width: "50%",
              }}
              onClick={() => store.confirm(tx.id)}
            >
              Confirm
            </button>
          )}
        </div>
      </div>

      {/* Kanan */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textAlign: "right",
          marginLeft: 8,
        }}
      >
        {isMasuk ? (
          <FaArrowUp style={{ color: "#3ecf8e", flex: "0 0 auto" }} />
        ) : (
          <FaArrowDown style={{ color: "#ff6b6b", flex: "0 0 auto" }} />
        )}
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {idr.format(tx.nominal)}
          </div>
          {tx.keterangan && (
            <div
              className="muted"
              style={{ fontSize: 12, maxWidth: 180, justifySelf: "end" }}
              title={tx.keterangan}
            >
              {tx.keterangan}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Report() {
  const store = useStore();

  // Ambil semua transaksi, urut tanggal terbaru → terlama
  const list = [...store.txns].sort((a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );

  return (
    <div className="container">
      {/* List transaksi (cards) */}
      <div className="grid" style={{ gap: 12 }}>
        {list.map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))}

        {list.length === 0 && (
          <div className="card muted">Belum ada data transaksi.</div>
        )}
      </div>
    </div>
  );
}
