"use client";

import { ThemeModeProvider } from "@envisio/ui";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeModeProvider>
      <DashboardSidebar />
      {children}
    </ThemeModeProvider>
  );
}


