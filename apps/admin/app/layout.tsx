import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Klorad | Admin Dashboard",
  description: "Admin dashboard for managing Klorad platform",
  icons: { icon: "/klorad-favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

