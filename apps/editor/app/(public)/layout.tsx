import "@/global.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeModeProvider } from "@envisio/ui";
import { ToastContainer } from "react-toastify";

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
      </head>
      <body>
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
      </body>
    </html>
  );
}
