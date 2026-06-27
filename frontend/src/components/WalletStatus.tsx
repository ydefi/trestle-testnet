import "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";

export default function WalletStatus() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return <appkit-button />;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      <span className="text-xs text-gray-600 font-mono">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <button
        onClick={() => disconnect()}
        className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-xs font-medium rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
