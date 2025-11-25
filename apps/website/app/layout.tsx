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
    "Klorad is the spatial operations platform developed by Prieston Technologies. Model, observe, simulate, and act on real-world infrastructure with unified spatial intelligence.",
  keywords: [
    "spatial operations",
    "infrastructure modeling",
    "digital twin",
    "spatial intelligence",
    "infrastructure management",
    "spatial computing",
    "real-world systems",
    "infrastructure planning",
  ],
  authors: [{ name: "Prieston Technologies" }],
  creator: "Prieston Technologies",
  publisher: "Prieston Technologies",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Klorad",
    title: "Klorad - Spatial Operations Platform",
    description:
      "A platform for spatial operations across real-world infrastructure. Model, observe, simulate, and act with unified spatial intelligence.",
    images: [
      {
        url: "/klorad-logo.png",
        width: 1200,
        height: 630,
        alt: "Klorad - Spatial Operations Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Klorad - Spatial Operations Platform",
    description:
      "A platform for spatial operations across real-world infrastructure. Model, observe, simulate, and act.",
    images: ["/klorad-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/klorad-favicon.png",
    apple: "/klorad-favicon.png",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Klorad",
    description:
      "Spatial operations platform for modeling, observing, simulating, and acting on real-world infrastructure",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com"}/klorad-logo.png`,
    founder: {
      "@type": "Organization",
      name: "Prieston Technologies",
    },
    sameAs: [
      // Add social media links when available
      // "https://twitter.com/klorad",
      // "https://linkedin.com/company/klorad",
    ],
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-base-bg text-text-primary`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
