"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { useThemeMode } from "@envisio/ui";

export default function LogoHeader() {
  const { mode } = useThemeMode();

  const { src, alt, width, height } = useMemo(() => {
    const host = typeof window !== "undefined" ? window.location.host : "";
    const isPSM = /(^|\.)psm\.envisioxr\.com$/i.test(host);
    if (isPSM) {
      return {
        src: "/images/logo/psm-logo-new.png",
        alt: "PSM",
        width: 140,
        height: 28,
      };
    }
    const isDark = mode === "dark";
    return {
      src: isDark
        ? "/images/logo/logo-dark.svg"
        : "/images/logo/logo-light.svg",
      alt: "EnvisioXR",
      width: 140,
      height: 28,
    };
  }, [mode]);

  if (!src) return <span data-mode={mode}>Envisio</span>;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority
      style={{ height: 28, width: "auto" }}
    />
  );
}
