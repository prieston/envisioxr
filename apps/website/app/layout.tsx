import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Klorad",
    template: "%s | Klorad",
  },
  description:
    "Klorad is the spatial operations platform developed by Prieston Technologies.",
  icons: {
    icon: "/klorad-favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-base-bg text-text-primary`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">
            <div className="relative mx-auto w-full max-w-container px-6 pt-24 pb-24 md:px-8 md:pt-32">
              {children}
            </div>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
