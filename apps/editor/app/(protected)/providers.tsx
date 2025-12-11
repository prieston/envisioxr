"use client";

import { ThemeModeProvider } from "@klorad/ui";
import dynamic from "next/dynamic";

// Dynamically import DashboardSidebar to avoid webpack module resolution issues
const DashboardSidebar = dynamic(
  () => import("@/app/components/Dashboard/DashboardSidebar"),
  {
    ssr: false,
    loading: () => null, // Don't show loading state, sidebar can load async
  }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <DashboardSidebar />
      {children}
    </ThemeModeProvider>
  );
}


