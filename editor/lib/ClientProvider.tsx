"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { ReactNode } from "react";
import ThemeModeProvider from "./ThemeModeProvider";

interface ClientProviderProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <ThemeModeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeModeProvider>
  );
}
