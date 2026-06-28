"use client";

import dynamic from "next/dynamic";

const MarketplacePage = dynamic(() => import("@/views/Marketplace"), { ssr: false });

export default function MarketplaceRoute() {
  return <MarketplacePage />;
}
