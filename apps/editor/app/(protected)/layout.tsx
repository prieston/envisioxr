import "@/global.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { ThemeModeProvider } from "@envisio/ui";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{document.documentElement.classList.remove('dark');}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <ThemeModeProvider>{children}</ThemeModeProvider>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </body>
    </html>
  );
}
