import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/lib/theme";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ToastContainer } from "react-toastify";
import ClientProvider from "@/lib/ClientProvider";
import { serverEnv } from "@/lib/env/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EnvisioXR | App",
  description: "This is my cool app.",
  icons: { icon: "/icons/favicon.ico" },
};

async function getSessionFromAuthApp(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { Cookie: cookies().toString() },
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
  if (!serverEnv) {
    throw new Error(
      "Environment variables not properly initialized. Please check your .env file."
    );
  }

  const baseUrl = serverEnv.NEXT_PUBLIC_WEBSITE_URL;

  // Check the pathname if possible. (This approach may need adjustments.)
  // For a robust solution, use route groups (Option 1).
  const pathname = ""; // You would need to extract the current pathname.
  // If pathname starts with "/publish", skip session check.
  if (!pathname.startsWith("/publish")) {
    const session = await getSessionFromAuthApp(baseUrl);
    if (!session) {
      redirect(`${baseUrl}/auth/signin`);
    }
  }

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
