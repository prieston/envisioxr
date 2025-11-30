"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeModeProvider } from "@klorad/ui";
import { RootLayoutWrapper } from "./components/RootLayoutWrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeModeProvider>
        <RootLayoutWrapper>{children}</RootLayoutWrapper>
      </ThemeModeProvider>
    </SessionProvider>
  );
}

