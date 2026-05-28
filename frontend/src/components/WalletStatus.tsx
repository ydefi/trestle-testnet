import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useRef } from "react";
import { useSignMessage } from "wagmi";

export default function WalletStatus() {
  const { address, isConnected } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const ref = useRef<HTMLDivElement>(null);

  const handleSignMessage = async () => {
    if (!address) return;
    try {
      await signMessageAsync({
        message: `Welcome to Trestle DeFi Testnet! By signing, you confirm your identity on Polygon Amoy. Nonce: ${Date.now()}`,
      });
    } catch {
      // User rejected
    }
  };

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const btn = document.createElement("w3m-button");
    ref.current.appendChild(btn);
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && address) {
      handleSignMessage();
    }
  }, [isConnected, address]);

  return (
    <div className="flex items-center gap-2">
      <div ref={ref} />
      {isConnected && (
        <button
          onClick={() => disconnectWallet()}
          className="px-2 py-0.5 bg-gray-200 hover:bg-gray-300 text-xs font-medium rounded-lg transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}
