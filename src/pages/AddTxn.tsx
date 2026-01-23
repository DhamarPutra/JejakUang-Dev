import type { FormEvent, ChangeEvent } from "react";
import { useId, useState } from "react";
import { useStore } from "../store";
import {
  formatRupiahInput,
  parseRupiahInput,
  todayISO,
} from "../utils/format";
import type { Alokasi } from "../types";

type Tipe = "masuk" | "keluar";

function uuid() {
  return (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export default function AddTxn() {
  const store = useStore();

  const idTanggal = useId();
  const idTipe = useId();
  const idAlokasi = useId();
  const idNominal = useId();
  const idKet = useId();
  const idPlanned = useId();

  const [tanggal, setTanggal] = useState(todayISO());
  const [tipe, setTipe] = useState<Tipe>("masuk");
  const [alokasi, setAlokasi] = useState<Alokasi>("cash");
  const [nominalRaw, setNominalRaw] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isPlanned, setIsPlanned] = useState(false);

  const nominalNum = parseRupiahInput(nominalRaw);
  const nominalDisplay = nominalRaw ? formatRupiahInput(nominalNum) : "";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nominalNum) return alert("Nominal harus diisi");
    store.add({
      id: uuid(),
      tanggal,
      tipe,
      nominal: nominalNum,
      keterangan: keterangan.trim() || undefined,
      dihapus: false,
      isPlanned,
      alokasi,
    });
    setNominalRaw("");
    setKeterangan("");
    alert("Transaksi ditambahkan");
  };

  const onChangeTipe = (e: ChangeEvent<HTMLSelectElement>) =>
    setTipe(e.target.value as Tipe);

  const onChangeNominal = (e: ChangeEvent<HTMLInputElement>) =>
    setNominalRaw(e.target.value);

  return (
    <div className="container">
      <form
        className="card form-card"
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12 }}
      >
        {/* SEMUA field dibungkus field-group */}
        <div className="field-group">
          <div className="field-row-2">
            <div className="field">
              <label htmlFor={idTanggal}>Tanggal</label>
              <input
                id={idTanggal}
                type="date"
                value={tanggal}
                max={todayISO()}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={idTipe}>Tipe</label>
              <select id={idTipe} value={tipe} onChange={onChangeTipe}>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor={idNominal}>Nominal</label>
            <input
              id={idNominal}
              inputMode="numeric"
              placeholder="Rp0"
              value={nominalDisplay}
              onChange={onChangeNominal}
              onBlur={onChangeNominal}
            />
          </div>
          <div className="field">
            <label htmlFor={idAlokasi}>Alokasi</label>
            <select
              id={idAlokasi}
              value={alokasi}
              onChange={(e) => setAlokasi(e.target.value as Alokasi)}
            >

              {store.allocations.map((item) => {
                const saldo = store.byAccount(false)[item.id]?.sisa || 0; // saldo aktual
                const notEnough =
                  tipe === "keluar" && nominalNum > 0 && saldo < nominalNum;

                return (
                  <option key={item.id} value={item.id} disabled={notEnough}>
                    {item.label}
                    {tipe === "keluar" && nominalNum > 0
                      ? ` (Saldo: Rp${saldo.toLocaleString("id-ID")})`
                      : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="field">
            <label htmlFor={idKet}>Keterangan</label>
            <textarea
              id={idKet}
              rows={3}
              placeholder="Catatan (opsional)"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>
          <div className="field" style={{ alignItems: "center" }}>
            <div className="field">
              <label
                htmlFor={idPlanned}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <input
                  id={idPlanned}
                  type="checkbox"
                  checked={isPlanned}
                  onChange={(e) => setIsPlanned(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#2b6ef6", // biar warnanya biru kayak tombol
                  }}
                />
                Akan datang
              </label>
            </div>
          </div>
        </div>

        <button className="primary" type="submit" disabled={!nominalNum}>
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}
