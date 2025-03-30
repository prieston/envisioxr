import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../../lib/theme";
import ClientProvider from "../../lib/ClientProvider";
import { ToastContainer } from "react-toastify";

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
