import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useMemo, useState } from "react";
import { useStore } from "../store";
import Money from "../components/Money";

export default function Home() {
  const { txns, totals, prediksi, byAccount, allocations } = useStore();
  const t = totals(); // aktual (tanpa planned)
  const tPred = prediksi(); // termasuk planned
  const perAcc = useMemo(() => byAccount(false), [byAccount]);

  // Toggle: tampilkan garis prediksi di grafik
  const [showPredLine, setShowPredLine] = useState(true);

  // Susun data harian: gabungkan tanggal dari transaksi aktual & planned
  const data = useMemo(() => {
    const actualMap = new Map<string, { masuk: number; keluar: number }>();
    const plannedMap = new Map<string, { masuk: number; keluar: number }>();

    txns
      .filter((x) => !x.dihapus)
      .forEach((t) => {
        const m = t.isPlanned ? plannedMap : actualMap;
        const cur = m.get(t.tanggal) || { masuk: 0, keluar: 0 };
        if (t.tipe === "masuk") cur.masuk += t.nominal;
        else cur.keluar += t.nominal;
        m.set(t.tanggal, cur);
      });

    // ambil union semua tanggal
    const dates = new Set<string>([
      ...Array.from(actualMap.keys()),
      ...Array.from(plannedMap.keys()),
    ]);
    const arrDates = Array.from(dates).sort((a, b) => a.localeCompare(b));

    // kumulatif
    let accMasuk = 0;
    let accKeluar = 0;
    let accPlannedMasuk = 0;
    let accPlannedKeluar = 0;

    return arrDates.map((tanggal) => {
      const a = actualMap.get(tanggal) || { masuk: 0, keluar: 0 };
      const p = plannedMap.get(tanggal) || { masuk: 0, keluar: 0 };

      accMasuk += a.masuk;
      accKeluar += a.keluar;

      accPlannedMasuk += p.masuk;
      accPlannedKeluar += p.keluar;

      const sisa = accMasuk - accKeluar; // aktual
      const sisaPred = sisa + (accPlannedMasuk - accPlannedKeluar); // prediksi

      return {
        tanggal,
        masuk: a.masuk,
        keluar: a.keluar,
        sisa,
        sisaPred,
      };
    });
  }, [txns]);

  return (
    <div className="container">
      <div className="grid">
        <div className="card">
          <div className="muted">Total Masuk</div>
          <Money value={t.masuk} />
        </div>
        <div className="card">
          <div className="muted">Total Keluar</div>
          <Money value={t.keluar} />
        </div>
        <div className="card">
          <div className="muted">Sisa</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Aktual</span>
              <Money value={t.sisa} />
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">Prediksi</span>
              <Money value={tPred.sisa} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="muted">Alokasi</div>
          <div className="grid">
            {allocations.map((item) => {
              return (
                <div
                  key={item.id}
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <span className="muted" style={{ textTransform: "capitalize" }}>
                    {item.label}
                  </span>
                  <Money value={perAcc[item.id]?.sisa || 0} />
                </div>
              );
            })}
          </div>
          </div>


        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>Grafik Keuangan</strong>
            <div className="row" style={{ gap: 8 }}>
              <label
                className="pill"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={showPredLine}
                  onChange={(e) => setShowPredLine(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: "#facc15" }}
                />
                Tampilkan Prediksi
              </label>
            </div>
          </div>

          <div className="spacer"></div>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
              >
                <XAxis
                  dataKey="tanggal"
                  hide={false}
                  tick={{ fill: "#9aa4b2", fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(v) => v.toLocaleString("id-ID")}
                  tick={{ fill: "#9aa4b2", fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: number) => v.toLocaleString("id-ID")}
                  contentStyle={{
                    background: "#0f1115",
                    border: "1px solid #222837",
                  }}
                  labelStyle={{ color: "#9aa4b2" }}
                />
                <Legend wrapperStyle={{ color: "#9aa4b2" }} />
                <Line
                  type="monotone"
                  dataKey="masuk"
                  stroke="#3ecf8e"
                  name="Masuk"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="keluar"
                  stroke="#ff6b6b"
                  name="Keluar"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="sisa"
                  stroke="#e2e8f0"
                  name="Sisa"
                  dot={false}
                  strokeWidth={2}
                />
                {showPredLine && (
                  <Line
                    type="monotone"
                    dataKey="sisaPred"
                    stroke="#facc15"
                    name="Sisa (Prediksi)"
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
