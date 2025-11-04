"use client";

import { ThemeModeProvider } from "@envisio/ui";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}


