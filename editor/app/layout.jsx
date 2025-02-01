// app/layout.jsx
import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientProvider from "./ClientProvider";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "EnvisioXR | App",
  description: "This is my cool app.",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

async function getSessionFromAuthApp() {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000" // Local Auth App
      : "https://envisioxr.com"; // Production Auth App

  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Cookie: cookies().toString(),
      },
      credentials: "include",
    });

    if (!response.ok)
      throw new Error(`Session request failed: ${response.status}`);

    const session = await response.json();
    if (!session || Object.keys(session).length === 0) {
      throw new Error("No valid session found");
    }
    return session;
  } catch (error) {
    console.error("Error fetching session:", error.message);
    return null;
  }
}

export default async function RootLayout({ children }) {
  const session = await getSessionFromAuthApp();

  if (!session) {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000" // Local Auth App
        : "https://envisioxr.com"; // Production Auth App

    redirect(`${baseUrl}/auth/signin`);
  }

  return (
    <html lang="en">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Wrap children in ClientProvider (which includes our AuthProvider) */}
          <ClientProvider>{children}</ClientProvider>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
