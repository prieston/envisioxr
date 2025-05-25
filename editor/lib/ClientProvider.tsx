"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { ReactNode } from "react";

interface ClientProviderProps {
  children: ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
