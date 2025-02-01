// app/layout.jsx

import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme"; // Import the dark theme
import AdminLayout from "@/components/AdminLayout";

export const metadata = {
  title: "EnvisioXR | App",
  description: "This is my cool app.",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

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
