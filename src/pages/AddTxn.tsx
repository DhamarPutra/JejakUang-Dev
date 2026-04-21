import type { FormEvent, ChangeEvent } from "react";
import { useId, useState } from "react";
import Swal from "sweetalert2";
import { useStore } from "../store";
import {
  formatRupiahInput,
  parseRupiahInput,
  todayISO,
} from "../utils/format";
import type { Alokasi } from "../types";

type Tipe = "masuk" | "keluar" | "alokasi";

function uuid() {
  return (crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export default function AddTxn() {
  const store = useStore();

  const idTanggal = useId();
  const idTipe = useId();
  const idAlokasi = useId();
  const idAlokasiDari = useId(); // New ID for "Dari"
  const idAlokasiKe = useId(); // New ID for "Ke"
  const idNominal = useId();
  const idKet = useId();
  const idPlanned = useId();

  const [tanggal, setTanggal] = useState(todayISO());
  const [tipe, setTipe] = useState<Tipe>("masuk");
  const [alokasi, setAlokasi] = useState<Alokasi>("cash");
  
  // New state for Allocation mode
  const [alokasiDari, setAlokasiDari] = useState<Alokasi>("-");
  const [alokasiKe, setAlokasiKe] = useState<Alokasi>("-");

  const [nominalRaw, setNominalRaw] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [isPlanned, setIsPlanned] = useState(false);

  const nominalNum = parseRupiahInput(nominalRaw);
  const nominalDisplay = nominalRaw ? formatRupiahInput(nominalNum) : "";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nominalNum) {
      await Swal.fire({
        icon: "warning",
        title: "Perhatian",
        text: "Nominal harus diisi",
      });
      return;
    }

    if (tipe === "alokasi") {
      // Validasi source != dest
      if (alokasiDari === alokasiKe) {
        await Swal.fire({
          icon: "warning",
          title: "Perhatian",
          text: "Akun asal dan tujuan tidak boleh sama",
        });
        return;
      }

      // Create 2 transactions
      // 1. Keluar dari 'Dari'
      store.add({
        id: uuid(),
        tanggal,
        tipe: "keluar",
        nominal: nominalNum,
        keterangan: keterangan.trim() ? `Transfer ke ${getLabel(alokasiKe)}: ${keterangan}` : `Transfer ke ${getLabel(alokasiKe)}`,
        dihapus: false,
        isPlanned,
        alokasi: alokasiDari,
      });

      // 2. Masuk ke 'Ke'
      store.add({
        id: uuid(),
        tanggal,
        tipe: "masuk",
        nominal: nominalNum,
        keterangan: keterangan.trim() ? `Terima dari ${getLabel(alokasiDari)}: ${keterangan}` : `Terima dari ${getLabel(alokasiDari)}`,
        dihapus: false,
        isPlanned,
        alokasi: alokasiKe,
      });

    } else {
      // Normal transaction
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
    }

    setNominalRaw("");
    setKeterangan("");
    
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: tipe === "alokasi" ? "Transfer berhasil dicatat" : "Transaksi ditambahkan",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const onChangeTipe = (e: ChangeEvent<HTMLSelectElement>) =>
    setTipe(e.target.value as Tipe);

  const onChangeNominal = (e: ChangeEvent<HTMLInputElement>) =>
    setNominalRaw(e.target.value);

  const getLabel = (id: string) => store.allocations.find(a => a.id === id)?.label || id;

  const renderAllocationOptions = (isOut: boolean) => {
    return store.allocations
      .filter((item) => !item.routineAmount || item.routineAmount === 0)
      .map((item) => {
        const saldo = store.byAccount(false)[item.id]?.sisa || 0;
        // Logic for disabling if saldo not enough only valid if this is the SOURCE (KELUAR) account
        // Assuming user wants validation. Original code had it.
        const notEnough = isOut && nominalNum > 0 && saldo < nominalNum;
        
        return (
          <option key={item.id} value={item.id} disabled={notEnough}>
            {item.label}
            {isOut && nominalNum > 0
              ? ` (Saldo: Rp${saldo.toLocaleString("id-ID")})`
              : ""}
          </option>
        );
      })
  };

  const getSaldo = (id: string) => store.byAccount(false)[id]?.sisa || 0;

  let maxSaldo = Infinity;
  if (tipe === "keluar") {
    maxSaldo = getSaldo(alokasi);
  } else if (tipe === "alokasi") {
    // If "-" is selected, treat as 0 or handle effectively
    if (alokasiDari === "-") maxSaldo = 0;
    else maxSaldo = getSaldo(alokasiDari);
  }

  const isOverLimit = nominalNum > maxSaldo;

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
                <option value="alokasi">Alokasi</option>
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
              style={isOverLimit ? { borderColor: "#ef4444" } : {}}
            />
            {isOverLimit && (
              <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                Saldo tidak mencukupi (Max: Rp{maxSaldo.toLocaleString("id-ID")})
              </div>
            )}
          </div>

          {tipe === "alokasi" ? (
             <div className="field-row-2">
               <div className="field">
                 <label htmlFor={idAlokasiDari}>Dari (Sumber)</label>
                 <select
                   id={idAlokasiDari}
                   value={alokasiDari}
                   onChange={(e) => setAlokasiDari(e.target.value as Alokasi)}
                 >
                  <option value="-" hidden>-</option>
                   {renderAllocationOptions(true)}
                 </select>
               </div>
               <div className="field">
                 <label htmlFor={idAlokasiKe}>Ke (Tujuan)</label>
                 <select
                   id={idAlokasiKe}
                   value={alokasiKe}
                   onChange={(e) => setAlokasiKe(e.target.value as Alokasi)}
                 >
                  <option value="-" hidden>-</option>
                    {store.allocations
                      .filter((item) => !item.routineAmount || item.routineAmount === 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                 </select>
               </div>
             </div>
          ) : (
            <div className="field">
              <label htmlFor={idAlokasi}>Alokasi</label>
              <select
                id={idAlokasi}
                value={alokasi}
                onChange={(e) => setAlokasi(e.target.value as Alokasi)}
              >
                {store.allocations
                  .filter((item) => !item.routineAmount || item.routineAmount === 0)
                  .map((item) => {
                  const saldo = store.byAccount(false)[item.id]?.sisa || 0;
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
          )}

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
                    accentColor: "#2b6ef6",            
                  }}
                />
                Akan datang
              </label>
            </div>
          </div>
        </div>

        <button className="primary" type="submit" disabled={!nominalNum || (isOverLimit && !isPlanned)}>
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}
