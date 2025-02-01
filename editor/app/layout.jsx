import "@/global.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import AdminLayout from "@/components/AdminLayout";
import { cookies } from "next/headers"; // ✅ Read cookies for authentication
import { redirect } from "next/navigation";

export const metadata = {
  title: "EnvisioXR | App",
  description: "This is my cool app.",
  icons: {
    icon: "/icons/favicon.ico",
  },
};

// ✅ Function to fetch session from the authentication app
async function getSessionFromAuthApp() {
  const baseUrl =process.env.NEXT_PUBLIC_WEBSITE_URL

  try {
    const response = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Cookie: cookies().toString(), // Pass user's cookies for authentication
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Session request failed: ${response.status}`);

    const session = await response.json();

    // ✅ Ensure session is valid
    if (!session || Object.keys(session).length === 0) {
      throw new Error("No valid session found");
    }

    return session;
  } catch (error) {
    console.error("Error fetching session:", error.message);
    return null; // Ensure null is returned if session is invalid
  }
}

export default async function RootLayout({ children }) {
  const session = await getSessionFromAuthApp(); // ✅ Fetch session

  if (!session) {
    console.warn("No session found, redirecting to login..."); // Debugging output
    redirect("http://localhost:3000/auth/signin"); // ✅ Redirect to login if no session
  }

  return (
    <html lang="en" className="antialiased">
      <head />
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AdminLayout>{children}</AdminLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
