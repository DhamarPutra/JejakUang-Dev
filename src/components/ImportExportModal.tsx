import { useState } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaDownload, FaUpload } from "react-icons/fa";

// Constants matching store.tsx
const LS_KEY_TXNS = "keuangan_txns_v1";
const LS_KEY_ALOKASI = "keuangan_alokasi_v1";

interface ImportExportModalProps {
  onClose: () => void;
}

export default function ImportExportModal({ onClose }: ImportExportModalProps) {
  const [includeTx, setIncludeTx] = useState(true);
  const [includeAlloc, setIncludeAlloc] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const data: Record<string, any> = {};
    const dateStr = new Date().toISOString().slice(0, 10);
    
    if (includeTx) {
      try {
        const raw = localStorage.getItem(LS_KEY_TXNS);
        data.txns = raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Failed to read transactions", e);
        data.txns = [];
      }
    }
    
    if (includeAlloc) {
      try {
        const raw = localStorage.getItem(LS_KEY_ALOKASI);
        data.allocations = raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Failed to read allocations", e);
        data.allocations = [];
      }
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = href;
    link.download = `jejak_uang_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await Swal.fire({
      title: "Impor Data?",
      text: "Data yang ada akan ditimpa dengan data baru dari file. Lanjutkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Impor",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) {
        e.target.value = ""; // reset input
        return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        let importedCount = 0;

        if (includeTx && json.txns && Array.isArray(json.txns)) {
            localStorage.setItem(LS_KEY_TXNS, JSON.stringify(json.txns));
            importedCount++;
        }

        if (includeAlloc && json.allocations && Array.isArray(json.allocations)) {
            localStorage.setItem(LS_KEY_ALOKASI, JSON.stringify(json.allocations));
            importedCount++;
        }

        if (importedCount > 0) {
            await Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Impor data berhasil. Halaman akan dimuat ulang.",
                timer: 2000,
                showConfirmButton: false
            });
            window.location.reload();
        } else {
             Swal.fire({
                icon: "error",
                title: "Gagal",
                text: "Tidak ada data yang valid untuk diimpor atau format file salah.",
            });
        }

      } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Gagal membaca file JSON. Pastikan format file benar.",
        });
      } finally {
        setIsImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: "fadeIn 0.2s ease-out",
          border: "1px solid var(--border)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Impor & Ekspor Data</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
          >
            <FaTimes />
          </button>
        </div>

        <p className="muted" style={{ marginBottom: 16 }}>
            Pindahkan data antar perangkat menggunakan file JSON.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
             <div
                onClick={() => setIncludeTx(!includeTx)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "12px",
                    borderRadius: 8,
                    border: includeTx ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: includeTx ? "rgba(43, 110, 246, 0.1)" : "transparent",
                    transition: "all 0.2s ease"
                }}
             >
                <input 
                    type="checkbox" 
                    checked={includeTx} 
                    onChange={() => {}} // handled by parent div
                    style={{ accentColor: "var(--primary)", transform: "scale(1.2)", cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Data Transaksi</span>
            </div>

            <div
                onClick={() => setIncludeAlloc(!includeAlloc)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "12px",
                    borderRadius: 8,
                    border: includeAlloc ? "1px solid var(--primary)" : "1px solid var(--border)",
                    background: includeAlloc ? "rgba(43, 110, 246, 0.1)" : "transparent",
                     transition: "all 0.2s ease"
                }}
             >
                <input 
                    type="checkbox" 
                    checked={includeAlloc} 
                    onChange={() => {}} // handled by parent div
                    style={{ accentColor: "var(--primary)", transform: "scale(1.2)", cursor: "pointer" }}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Pengaturan</span>
            </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
            <button
                className="secondary"
                onClick={handleExport}
                disabled={(!includeTx && !includeAlloc)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
                <FaDownload /> Ekspor
            </button>
            <div style={{ flex: 1, position: "relative" }}>
                 <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isImporting || (!includeTx && !includeAlloc)}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer"
                    }}
                />
                <button
                    className="primary"
                    disabled={isImporting || (!includeTx && !includeAlloc)}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                     <FaUpload /> {isImporting ? "..." : "Impor"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
