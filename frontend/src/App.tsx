<<<<<<< HEAD
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTelegram } from "./hooks/useTelegram";
import { useTelegramLink } from "./hooks/useTelegramLink";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Staking from "./pages/Staking";
import Verify from "./pages/Verify";
import Tasks from "./pages/Tasks";
import Bounty from "./pages/Bounty";
import Withdraw from "./pages/Withdraw";

export default function App() {
  const { ready, expand } = useTelegram();
  useTelegramLink();

  useEffect(() => {
    ready();
    expand();
  }, []);
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import RWA from "./pages/RWA";
import Withdraw from "./pages/Withdraw";
import { useWalletSign } from "./components/QRCode";

export default function App() {
  useWalletSign();
>>>>>>> 7c29aad (initial commit)

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
<<<<<<< HEAD
          <Route path="/stake" element={<Staking />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/bounty" element={<Bounty />} />
=======
          <Route path="/rwa" element={<RWA />} />
>>>>>>> 7c29aad (initial commit)
          <Route path="/withdraw" element={<Withdraw />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7c29aad (initial commit)
