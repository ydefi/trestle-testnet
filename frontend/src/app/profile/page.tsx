"use client";

import dynamic from "next/dynamic";

const UserProfilePage = dynamic(() => import("@/views/UserProfile"), { ssr: false });

export default function ProfileRoute() {
  return <UserProfilePage />;
}
