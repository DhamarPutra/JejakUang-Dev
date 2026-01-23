export type TxType = "masuk" | "keluar";
export type Alokasi = string;

export interface AllocationItem {
  id: string;
  label: string;
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
}
