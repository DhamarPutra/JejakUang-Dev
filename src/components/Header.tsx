import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useMoneyVisibility } from "./MoneyVisibilityContext";

export default function Header() {
  const { show, toggle } = useMoneyVisibility();

  return (
    <header
      className="header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid #222837",
        background: "#0f1115",
        position: "sticky",
        top: 0,
        zIndex: 10,
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
          }}
        >
          Jejak Uang
        </h1>
      </div>
      <button
        type="button"
        className="pill"
        onClick={toggle}
        style={{ width: 32 }}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
    </header>
  );
}
