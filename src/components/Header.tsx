import { useState } from "react";
import { FaEyeSlash, FaEye, FaRegCommentDots, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useMoneyVisibility } from "./MoneyVisibilityContext";
import { sendFeedbackToTelegram } from "../utils/telegram";

export default function Header() {
  const { show, toggle } = useMoneyVisibility();

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbType, setFbType] = useState("Saran"); // Kritik | Saran
  const [fbMessage, setFbMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbMessage.trim()) return;

    setIsSending(true);
    const success = await sendFeedbackToTelegram(fbType, fbMessage);
    setIsSending(false);

    if (success) {
      alert("Terima kasih! Pesan Anda telah terkirim.");
      setFbMessage("");
      setShowFeedback(false);
    } else {
      alert("Gagal mengirim pesan. Coba lagi nanti.");
    }
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px", // Lebih rounded
    border: "1px solid rgba(255,255,255,0.1)", // Subtle border
    background: "rgba(255,255,255,0.05)", // Glassy feel
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
  };

  return (
    <>
      <header
        className="header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #222837",
          background: "rgba(15, 17, 21, 0.95)", // Slightly transparent
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="./icons/icon192.png"
            alt="Logo"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: 0,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}
          >
            Jejak Uang
          </h1>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
            {/* Feedback Button */}
            <button
                type="button"
                onClick={() => setShowFeedback(true)}
                style={{
                  ...iconButtonStyle,
                  background: showFeedback ? "rgba(43, 110, 246, 0.2)" : iconButtonStyle.background,
                  color: showFeedback ? "#5b9aff" : "#9aa4b2",
                }}
            >
                <FaRegCommentDots />
            </button>

            {/* Eye Button */}
            <button
                type="button"
                onClick={toggle}
                style={{
                    ...iconButtonStyle,
                     color: show ? "#3ecf8e" : "#9aa4b2", // Green when visible, gray when hidden
                     background: show ? "rgba(62, 207, 142, 0.1)" : iconButtonStyle.background,
                }}
            >
                {show ? <FaEye /> : <FaEyeSlash />}
            </button>
        </div>
      </header>

      {/* Feedback Modal */}
      {showFeedback && (
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
            onClick={() => setShowFeedback(false)}
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
                    <h3 style={{ margin: 0 }}>Kirim Masukan</h3>
                    <button 
                        onClick={() => setShowFeedback(false)}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSendFeedback} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="field">
                        <label>Tipe Masukan</label>
                        <select 
                            value={fbType} 
                            onChange={(e) => setFbType(e.target.value)}
                            style={{ width: "100%" }}
                        >
                            <option value="Saran">Saran</option>
                            <option value="Kritik">Kritik</option>
                        </select>
                    </div>
                    
                    <div className="field">
                        <label>Pesan</label>
                        <textarea
                            rows={4}
                            placeholder="Tulis kritik atau saran Anda di sini..."
                            value={fbMessage}
                            onChange={(e) => setFbMessage(e.target.value)}
                            style={{ resize: "vertical" }}
                            disabled={isSending}
                        />
                    </div>

                    <button 
                        className="primary" 
                        type="submit" 
                        disabled={!fbMessage.trim() || isSending}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        {isSending ? (
                            "Mengirim..." 
                        ) : (
                            <>
                                <FaPaperPlane size={12} /> Kirim
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
