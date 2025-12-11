import "@/global.css";
import { redirect } from "next/navigation";
import ToastProvider from "@/app/components/ToastProvider";
import { auth } from "@/auth";
import { SessionProviderWrapper } from "@/app/components/SessionProviderWrapper";
import { ClientProviders } from "./providers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Klorad | Dashboard",
  description: "Control and publish immersive experiences with Klorad.",
  icons: { icon: "/klorad-favicon.png" },
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(typeof document!=='undefined'){var root=document.documentElement;root.classList.add('dark');}if(typeof localStorage!=='undefined'){localStorage.setItem('klorad-theme-mode','dark');}}catch(e){}})();",
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                background: linear-gradient(135deg, #0a0d10 0%, #14171a 50%, #1a1f24 100%);
                min-height: 100vh;
                margin: 0;
              }
            `,
          }}
        />
      </head>
      <body>
        <SessionProviderWrapper session={session}>
          <ClientProviders>{children}</ClientProviders>
          <ToastProvider />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
