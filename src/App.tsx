import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { Provider } from "./store";
import Header from "./components/Header";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Report = lazy(() => import("./pages/Report"));
const AddTxn = lazy(() => import("./pages/AddTxn"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <Provider>
      <BrowserRouter>
      <Header/>
        <Suspense fallback={
            <div style={{ display: "flex", justifyContent: "center", padding: 20, color: "#9aa4b2" }}>
                Memuat...
            </div>
        }>
            <Routes>
            <Route path="JejakUang/" element={<Home />} />
            <Route path="JejakUang/laporan" element={<Report />} />
            <Route path="JejakUang/tambah" element={<AddTxn />} />
            <Route path="JejakUang/settings" element={<Settings />} />
            </Routes>
        </Suspense>
        <BottomNav />
      </BrowserRouter>
    </Provider>
  );
}
