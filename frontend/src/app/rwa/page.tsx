"use client";

import dynamic from "next/dynamic";

const RWAPage = dynamic(() => import("@/views/RWA"), { ssr: false });

export default function RWARoute() {
  return <RWAPage />;
}
