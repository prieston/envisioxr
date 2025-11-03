import "@/global.css";
import { redirect } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { ThemeModeProvider } from "@envisio/ui";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SessionProviderWrapper } from "@/app/components/SessionProviderWrapper";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Klorad | App",
  description: "Control and publish immersive experiences with Klorad.",
  icons: { icon: "/klorad-favicon.png" },
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var root=document.documentElement;root.classList.add('dark');localStorage.setItem('klorad-theme-mode','dark');}catch(e){}})();",
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProviderWrapper session={session}>
          <ThemeModeProvider>{children}</ThemeModeProvider>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
