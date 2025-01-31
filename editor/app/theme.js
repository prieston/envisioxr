// app/theme.js
"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4c5fd5", // Electric blue accent
    },
    secondary: {
      main: "#ff4f4f", // Vivid red accent
    },
    background: {
      default: "#121212", // 🔥 Set the full background to #121212
      paper: "#121212", // Panels background (slightly lighter)
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
    divider: "rgba(255, 255, 255, 0.1)",
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Arial", sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.5rem", color: "#ffffff" },
    h2: { fontWeight: 600, fontSize: "2rem", color: "#ffffff" },
    h3: { fontWeight: 500, fontSize: "1.75rem", color: "#f5f5f5" },
    body1: { fontSize: "1rem", color: "#b0b0b0" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a1a1a", // Ensures left & right panels match
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "10px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
        },
      },
    },
  },
});

export default theme;
