"use client";

import { ThemeModeProvider } from "@klorad/ui";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <DashboardSidebar />
      {children}
    </ThemeModeProvider>
  );
}


