<<<<<<< HEAD
import { LINKS } from "../config/contracts";

type Props = {
  value?: string;
  size?: number;
};

export default function QRCode({ value = LINKS.mainSite, size = 140 }: Props) {
  return (
    <div className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 text-center">
=======
import { useEffect, useRef, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

const SITE_URL = "https://testnet.trestle.website";

export default function QRCode({
  value = SITE_URL,
  size = 160,
}: {
  value?: string;
  size?: number;
}) {
  return (
    <div className="bg-white p-2 rounded-lg shadow border border-gray-200 inline-block">
>>>>>>> 7c29aad (initial commit)
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=059669&bgcolor=ffffff&ecc=M`}
        alt="QR Code"
        width={size}
        height={size}
<<<<<<< HEAD
        className="rounded-lg mx-auto"
      />
      <p className="text-[9px] text-gray-400 mt-1 font-medium">
        Scan with phone wallet
=======
        className="rounded"
      />
      <p className="text-center text-[9px] text-gray-400 mt-1 font-medium">
        Scan to open on mobile
>>>>>>> 7c29aad (initial commit)
      </p>
    </div>
  );
}
<<<<<<< HEAD
=======

export function useWalletSign() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (isConnected && address && !signed) {
      signMessageAsync({
        message: `Welcome to Trestle DeFi! This message confirms your identity. Nonce: ${Date.now()}`,
      })
        .then(() => setSigned(true))
        .catch(() => {});
    }
  }, [isConnected, address, signed, signMessageAsync]);

  return { signed };
}
>>>>>>> 7c29aad (initial commit)
