import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import RWA from "./pages/RWA";
import Faucet from "./pages/Faucet";
import { useWalletSign } from "./components/QRCode";

export default function App() {
  useWalletSign();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/rwa" element={<RWA />} />
          <Route path="/faucet" element={<Faucet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}