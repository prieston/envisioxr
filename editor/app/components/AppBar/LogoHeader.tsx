"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useThemeMode } from "@envisio/ui";

export default function LogoHeader() {
  const { mode } = useThemeMode();

  const { src, alt } = useMemo(() => {
    const host = typeof window !== "undefined" ? window.location.host : "";
    const isPSM = /(^|\.)psm\.envisioxr\.com$/i.test(host);
    if (isPSM) {
      return {
        src: "/images/logo/psm-logo-new.png",
        alt: "PSM",
      };
    }
    const isDark = mode === "dark";
    return {
      src: isDark
        ? "/images/logo/logo-dark.svg"
        : "/images/logo/klorad-logo.svg",
      alt: "Klorad Studio",
    };
  }, [mode]);

  if (!src) return <span data-mode={mode}>Envisio</span>;

  return (
    <Link href="/" aria-label="Go to Home">
      <Image
        src={src}
        alt={alt}
        width={99}
        height={40}
        priority
      />
    </Link>
  );
}
