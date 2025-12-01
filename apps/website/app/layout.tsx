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
    "Klorad is the geospatial platform for operating real-world infrastructure. Unify terrain, structures, equipment, and live operational data into one platform.",
  keywords: [
    "geospatial platform",
    "infrastructure operations",
    "3D visualization",
    "infrastructure management",
    "ITS operations",
    "urban infrastructure",
    "cultural heritage",
    "agriculture management",
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
    title: "Klorad - The Geospatial Platform for Operating Real-World Infrastructure",
    description:
      "Klorad unifies terrain, structures, equipment, and live operational data into one platform. See how your infrastructure behaves, analyze changes over time, and coordinate operations with confidence.",
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
    title: "Klorad - The Geospatial Platform for Operating Real-World Infrastructure",
    description:
      "Klorad unifies terrain, structures, equipment, and live operational data into one platform.",
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
      "Geospatial platform for operating real-world infrastructure. Visualize, analyze, and act on infrastructure assets with precision.",
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
