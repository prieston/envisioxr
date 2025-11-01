import "@/global.css";
import { ThemeModeProvider } from "@envisio/ui";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "EnvisioXR | Public Preview",
  description: "Preview published worlds.",
  icons: { icon: "/klorad-favicon.png" },
};

export default function PublicLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var m=localStorage.getItem('editor-theme-mode');if(m==='dark'){document.documentElement.classList.add('dark');}else if(m==='light'){document.documentElement.classList.remove('dark');}}catch(e){}})();",
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
