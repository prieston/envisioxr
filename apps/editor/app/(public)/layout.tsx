import "@/global.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SessionProviderWrapper } from "@/app/components/SessionProviderWrapper";
import { ClientProviders } from "./providers";

export const metadata = {
  title: "Klorad | Viewer",
  description: "Preview published worlds.",
  icons: { icon: "/klorad-favicon.png" },
};

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var root=document.documentElement;root.classList.add('dark');localStorage.setItem('klorad-theme-mode','dark');}catch(e){}})();",
          }}
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
