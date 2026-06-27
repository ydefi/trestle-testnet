import { useEffect, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";

export function useWalletSign() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const signedFor = useRef<string | null>(sessionStorage.getItem("trestle_signed_for"));
  const signingFor = useRef<string | null>(null);

  useEffect(() => {
    if (isConnected && address && address !== signedFor.current && address !== signingFor.current) {
      signingFor.current = address;
      signMessageAsync({
        message: `Trestle DeFi — connect wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
        .then(() => {
          sessionStorage.setItem("trestle_signed_for", address);
          signedFor.current = address;
        })
        .catch((err) => {
          console.warn("Signature skipped:", err.message);
          signingFor.current = null;
        });
    }
  }, [isConnected, address, signMessageAsync]);
}
