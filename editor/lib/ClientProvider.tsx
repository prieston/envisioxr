"use client";

import React from "react";
import { ThemeModeProvider } from "@envisio/ui";

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeModeProvider>{children}</ThemeModeProvider>;
}
