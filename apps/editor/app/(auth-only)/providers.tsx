"use client";

import { ThemeModeProvider } from "@klorad/ui";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}





