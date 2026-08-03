import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
<<<<<<< HEAD
import { config } from "./config/web3";
import App from "./App";
import "./index.css";
import { initErrorLogging } from "./lib/logErrors";

initErrorLogging();
=======
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { config, projectId } from "./config/web3";
import App from "./App";
import "./index.css";

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: "light",
  themeVariables: {
    "--w3m-color-mix": "#059669",
    "--w3m-color-mix-strength": 20,
  },
});
>>>>>>> 7c29aad (initial commit)

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
