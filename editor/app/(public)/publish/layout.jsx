// app/(public)/layout.jsx (Note: Do NOT use "use client" here)
import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import { ToastContainer } from "react-toastify";
import ClientProvider from "@/ClientProvider";

export const metadata = {
  title: "EnvisioXR | Public Preview",
  description: "Preview published worlds.",
  icons: { icon: "/icons/favicon.ico" },
};

export default function PublicLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ClientProvider>{children}</ClientProvider>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
