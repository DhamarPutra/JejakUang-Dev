import { BrowserRouter, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Report from "./pages/Report";
import AddTxn from "./pages/AddTxn";
import Settings from "./pages/Settings";
import { Provider } from "./store";
import Header from "./components/Header";

export default function App() {
  return (
    <Provider>
      <BrowserRouter>
      <Header/>
        <Routes>
          <Route path="JejakUang/" element={<Home />} />
          <Route path="JejakUang/laporan" element={<Report />} />
          <Route path="JejakUang/tambah" element={<AddTxn />} />
          <Route path="JejakUang/settings" element={<Settings />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </Provider>
  );
}
