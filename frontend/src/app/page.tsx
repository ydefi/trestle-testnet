"use client";

import dynamic from "next/dynamic";

const DashboardPage = dynamic(() => import("@/views/Dashboard"), { ssr: false });

export default function Home() {
  return <DashboardPage />;
}
