// app/layout.jsx
"use client";

import { Layout } from "@/components/dom/Layout";
import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme"; // Import the dark theme

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <link rel="icon" href="/icons/favicon.ico" sizes="any" />

      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Ensures dark background & typography globally */}
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
