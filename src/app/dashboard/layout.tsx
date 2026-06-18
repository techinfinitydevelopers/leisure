"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The login page renders its own full-screen layout without the admin shell.
  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
