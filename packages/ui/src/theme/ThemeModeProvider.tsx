"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme, type ThemeMode } from "./theme";

type Ctx = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};
const ThemeModeContext = createContext<Ctx | null>(null);

export default function ThemeModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (mode === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo<Ctx>(
    () => ({
      mode,
      toggle: () => setMode(mode === "light" ? "dark" : "light"),
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
