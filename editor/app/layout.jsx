// app/layout.jsx
"use client";

import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme"; // Import the dark theme
import AdminLayout from "@/components/AdminLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AdminLayout>{children}</AdminLayout> {/* Handles UI Layout */}
        </ThemeProvider>
      </body>
    </html>
  );
}
