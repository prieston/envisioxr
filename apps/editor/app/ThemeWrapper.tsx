"use client";

import { ThemeModeProvider } from "@envisio/ui";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}

