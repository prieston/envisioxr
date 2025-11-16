"use client";

import { ThemeModeProvider } from "@envisio/ui";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";
import { usePathname } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBuilderPage = pathname?.includes("/builder");

  return (
    <ThemeModeProvider>
      {!isBuilderPage && <DashboardSidebar />}
      {children}
    </ThemeModeProvider>
  );
}


