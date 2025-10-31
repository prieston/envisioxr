"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import "../../styles/globals.css";
import AuthProvider from "../context/AuthContext";
import ToasterContext from "../context/ToastContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div suppressHydrationWarning>
      <NextTopLoader
        color="#006BFF"
        crawlSpeed={300}
        showSpinner={false}
        shadow="none"
      />
      <ThemeProvider enableSystem={false} attribute="class" defaultTheme="dark">
        <AuthProvider>
          <ToasterContext />
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
