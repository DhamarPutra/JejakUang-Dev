import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Txn, TxType, AllocationItem } from "./types";
import { alokasi as alokasiDefault } from "./utils/format";

const LS_KEY = "keuangan_txns_v1";
const LS_KEY_ALOKASI = "keuangan_alokasi_v1";

function load(): Txn[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list: Txn[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function loadAlokasi(): AllocationItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY_ALOKASI);
    if (!raw) {
      // Default initial data
      return Object.entries(alokasiDefault).map(([id, label]) => ({
        id,
        label,
      }));
    }

    const parsed = JSON.parse(raw);
    // MIGRATION CHECK: if it's an array of strings
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      const migrated: AllocationItem[] = (parsed as string[]).map((id) => ({
        id,
        // use default label if exists, else capitalize
        label:
          alokasiDefault[id as keyof typeof alokasiDefault] ||
          (id.charAt(0).toUpperCase() + id.slice(1)),
      }));
      return migrated;
    }

    // Assume it's already AllocationItem[]
    return parsed as AllocationItem[];
  } catch {
    return Object.entries(alokasiDefault).map(([id, label]) => ({
      id,
      label,
    }));
  }
}

function saveAlokasi(list: AllocationItem[]) {
  localStorage.setItem(LS_KEY_ALOKASI, JSON.stringify(list));
}

export interface Filters {
  tanggalFrom?: string;
  tanggalTo?: string;
  tipe?: "" | TxType;
  isPlanned?: boolean;
  periode?: "mingguan" | "bulanan" | "tahunan" | "";
}

interface Store {
  txns: Txn[];
  add(tx: Txn): void;
  softDelete(id: string): void;
  restore(id: string): void;
  confirm(id: string): void;
  filtered(filters: Filters): Txn[];
  totals(txns?: Txn[]): { masuk: number; keluar: number; sisa: number };
  prediksi(txns?: Txn[]): { masuk: number; keluar: number; sisa: number };
  byAccount(
    includePlanned?: boolean
  ): Record<string, { masuk: number; keluar: number; sisa: number }>;

  allocations: AllocationItem[];
  addAlokasi(id: string, label: string): void;
  removeAlokasi(id: string): void;
}

const Ctx = createContext<Store | null>(null);

export function Provider({ children }: { children: React.ReactNode }) {
  const [txns, setTxns] = useState<Txn[]>(() => load());
  const [allocations, setAllocations] = useState<AllocationItem[]>(() =>
    loadAlokasi()
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      save(txns);
    }, 500);
    return () => clearTimeout(timeout);
  }, [txns]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveAlokasi(allocations);
    }, 500);
    return () => clearTimeout(timeout);
  }, [allocations]);

  const api = useMemo<Store>(
    () => ({
      txns,
      add(tx) {
        setTxns((prev) => [tx, ...prev]);
      },
      softDelete(id) {
        setTxns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, dihapus: true } : t))
        );
      },
      restore(id) {
        setTxns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, dihapus: false } : t))
        );
      },
      filtered(f) {
        let list = txns;
        // periode override date range
        if (f.periode) {
          const now = new Date();
          let start: Date;
          if (f.periode === "mingguan") {
            const day = now.getDay(); // 0 Minggu
            const diff = day === 0 ? 6 : day - 1; // mulai Senin
            start = new Date(now);
            start.setDate(now.getDate() - diff);
            start.setHours(0, 0, 0, 0);
          } else if (f.periode === "bulanan") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
          } else {
            start = new Date(now.getFullYear(), 0, 1);
          }
          const startISO = start.toISOString().slice(0, 10);
          list = list.filter((t) => t.tanggal >= startISO);
        }
        if (f.tanggalFrom)
          list = list.filter((t) => t.tanggal >= f.tanggalFrom!);
        if (f.tanggalTo) list = list.filter((t) => t.tanggal <= f.tanggalTo!);
        if (f.tipe) list = list.filter((t) => t.tipe === f.tipe);
        return list;
      },
      totals(list) {
        const L = (list ?? txns).filter((t) => !t.dihapus);
        const masuk = L.filter(
          (t) => t.tipe === "masuk" && !t.isPlanned
        ).reduce((a, b) => a + b.nominal, 0);
        const keluar = L.filter(
          (t) => t.tipe === "keluar" && !t.isPlanned
        ).reduce((a, b) => a + b.nominal, 0);
        return { masuk, keluar, sisa: masuk - keluar };
      },
      prediksi(list) {
        const L = (list ?? txns).filter((t) => !t.dihapus);
        const masuk = L.filter((t) => t.tipe === "masuk").reduce(
          (a, b) => a + b.nominal,
          0
        );
        const keluar = L.filter((t) => t.tipe === "keluar").reduce(
          (a, b) => a + b.nominal,
          0
        );
        return { masuk, keluar, sisa: masuk - keluar };
      },
      confirm(id) {
        setTxns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isPlanned: false } : t))
        );
      },
      byAccount(includePlanned = false) {
        const base = txns.filter(
          (t) => !t.dihapus && (includePlanned ? true : !t.isPlanned)
        );
        const accs: Record<
          string,
          { masuk: number; keluar: number; sisa: number }
        > = {};

        // Inisialisasi semua akun dengan 0
        for (const item of allocations) {
          accs[item.id] = { masuk: 0, keluar: 0, sisa: 0 };
        }

        for (const t of base) {
          // Jika alokasi transaksi tidak ada di list allocations (misal sudah dihapus),
          // kita skip atau bisa juga kita masukkan ke "Unknown".
          // Di sini kita skip agar sesuai logic "akun dihapus = tidak tampil"
          // Tapi sebaiknya kita handle kalau mau datanya konsisten.
          // Untuk sekarang kita hanya hitung jika key ada di allocations.
          // ATAU: kita bisa auto-add jika belum ada?
          // Sesuai request user: "dynamic based on input".
          // Asumsi: user manage alokasi.
          
          if (!accs[t.alokasi]) {
             // Opsional: jika ingin tetap menampilkan saldo dari akun yang sudah dihapus,
             // uncomment baris bawah ini:
             // accs[t.alokasi] = { masuk: 0, keluar: 0, sisa: 0 };
             continue; 
          }
          
          const a = accs[t.alokasi];
          if (t.tipe === "masuk") a.masuk += t.nominal;
          else a.keluar += t.nominal;
        }
        for (const k of Object.keys(accs)) {
          accs[k].sisa = accs[k].masuk - accs[k].keluar;
        }
        return accs;
      },
      allocations,
      addAlokasi(id, label) {
        setAllocations((prev) => {
          if (prev.some((a) => a.id === id)) return prev;
          return [...prev, { id, label }];
        });
      },
      removeAlokasi(id) {
        setAllocations((prev) => prev.filter((a) => a.id !== id));
      },
    }),
    [txns, allocations]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside Provider");
  return ctx;
}
