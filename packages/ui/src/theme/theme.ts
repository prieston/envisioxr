"use client";

import { createTheme, Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export const createAppTheme = (mode: ThemeMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2563eb" },
      secondary: { main: "#646464" },
      background: {
        default: mode === "dark" ? "#0b0f1a" : "#ffffff",
        paper: mode === "dark" ? "#0f172a" : "#f8fafc",
      },
      text: {
        primary: mode === "dark" ? "#e5e7eb" : "#0f172a",
        secondary: mode === "dark" ? "#94a3b8" : "#475569",
      },
      divider:
        mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
    },
    typography: {
      fontFamily: `"Montserrat", "Inter", "Roboto", "Arial", sans-serif`,
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        color: "var(--color-text-primary)",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
        color: "var(--color-text-primary)",
      },
      h3: {
        fontWeight: 500,
        fontSize: "1.75rem",
        color: "var(--color-text-primary)",
      },
      body1: { fontSize: "1rem", color: "var(--color-text-secondary)" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: "var(--color-bg)",
            color: "var(--color-text-primary)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--color-bg)",
            borderBottom: "1px solid var(--color-border)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: "var(--color-surface-1)",
            borderRight: "1px solid var(--color-border)",
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: "8px", padding: "10px 16px" } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--color-surface-2)",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "12px",
            border: "1px solid var(--color-border)",
          },
        },
      },
    },
  });

const theme: Theme = createAppTheme("light");
export default theme;
