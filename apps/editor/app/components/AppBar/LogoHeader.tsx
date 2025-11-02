"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LogoHeader() {
  const { src, alt, width, height } = useMemo(() => {
    const host = typeof window !== "undefined" ? window.location.host : "";
    const isPSM = /(^|\.)psm\.envisioxr\.com$/i.test(host);
    if (isPSM) {
      return {
        src: "/images/logo/psm-logo-new.png",
        alt: "PSM",
        width: 99,
        height: 40,
      };
    }
    return {
      src: "/images/logo/klorad-logo-studio-light.svg",
      alt: "Klorad",
      width: 120,
      height: 32,
    };
  }, []);

  if (!src) return <span>Envisio</span>;

  return (
    <Link href="/" aria-label="Go to Home">
      <Image src={src} alt={alt} width={width} height={height} priority />
    </Link>
  );
}
