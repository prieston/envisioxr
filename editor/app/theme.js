// app/theme.js
"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4c5fd5", // Blue from the image (adjust if needed)
    },
    secondary: {
      main: "#ff4f4f", // Red highlight color (adjust if needed)
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1e1e1e", // Slightly lighter dark background for cards
    },
    text: {
      primary: "#ffffff", // White text
      secondary: "#b0b0b0", // Grey text
    },
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Arial", sans-serif`, // Matches the modern aesthetic
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    h2: { fontWeight: 600, fontSize: "2rem" },
    h3: { fontWeight: 500, fontSize: "1.75rem" },
    body1: { fontSize: "1rem" },
  },
});

export default theme;
