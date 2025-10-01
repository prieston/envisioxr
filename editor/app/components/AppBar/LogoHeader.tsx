"use client";
import React from "react";
import { useThemeMode } from "@envisio/ui";

export default function LogoHeader() {
  const { mode } = useThemeMode();
  return <span data-mode={mode}>Envisio</span>;
}
