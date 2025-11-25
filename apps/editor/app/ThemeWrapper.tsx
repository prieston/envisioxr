"use client";

import { ThemeModeProvider } from "@klorad/ui";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}

