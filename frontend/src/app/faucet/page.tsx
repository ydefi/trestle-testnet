"use client";

import dynamic from "next/dynamic";

const FaucetPage = dynamic(() => import("@/views/Faucet"), { ssr: false });

export default function FaucetRoute() {
  return <FaucetPage />;
}
