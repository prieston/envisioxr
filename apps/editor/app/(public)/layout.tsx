import "@/global.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ClientProviders } from "./providers";

export const metadata = {
  title: "EnvisioXR | Public Preview",
  description: "Preview published worlds.",
  icons: { icon: "/klorad-favicon.png" },
};

export default function PublicLayout({ children }) {
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
      </body>
    </html>
  );
}
