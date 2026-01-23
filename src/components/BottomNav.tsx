import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    `nav-item ${isActive ? "active" : ""}`;
  return (
    <nav className="bottom-nav">
      <NavLink to="JejakUang/" className={cls} end>
        <span className="icon">🏠</span>
        <span>Home</span>
      </NavLink>
      <NavLink to="JejakUang/laporan" className={cls}>
        <span className="icon">📄</span>
        <span>Laporan</span>
      </NavLink>
      <NavLink to="JejakUang/tambah" className={cls}>
        <span className="icon">＋</span>
        <span>Tambah</span>
      </NavLink>
      <NavLink to="JejakUang/settings" className={cls}>
        <span className="icon">⚙️</span>
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
