"use client";

import { useEffect, useState } from "react";
import Shell from "./shell";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
        <div className="animate-pulse text-emerald-600 font-semibold">Loading...</div>
      </div>
    );
  }
  return <Shell>{children}</Shell>;
}
