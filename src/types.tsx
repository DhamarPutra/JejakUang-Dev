export type TxType = "masuk" | "keluar" | "alokasi";
export type Alokasi = string;

export interface AllocationItem {
  id: string;
  label: string;
  routineAmount?: number;
}

export interface Txn {
  id: string;
  tanggal: string;
  tipe: TxType;
  nominal: number;
  keterangan?: string;
  dihapus: boolean;
  isPlanned: boolean;
  alokasi: Alokasi;
  isRoutine?: boolean;
}
