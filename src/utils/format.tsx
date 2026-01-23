export const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function parseRupiahInput(input: string): number {
  const digits = input.replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function formatRupiahInput(nominal: number): string {
  return idr.format(nominal);
}

export function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const alokasi: Record<
  "cash" | "seabank" | "bca" | "gopay",
  string
> = {
  cash: "Dompet",
  seabank: "SeaBank",
  bca: "BCA",
  gopay: "GoPay",
};
