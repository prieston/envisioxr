import Link from "next/link";
import { Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useThemeMode } from "@/lib/ThemeModeProvider";

export default function LogoHeader() {
  const [logoPath, setLogoPath] = useState("/images/logo/logo-dark.svg");
  const [isPSM, setIsPSM] = useState(false);
  const { mode } = useThemeMode();

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "psm.envisioxr.com") {
        setLogoPath("/images/logo/psm-logo-new.png");
        setIsPSM(true);
      } else {
        setLogoPath("/images/logo/logo-light.svg");
        setIsPSM(false);
      }
    }
  }, []);

  return (
    <Link href="/dashboard" passHref legacyBehavior>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer", // Indicates clickable element
        }}
      >
        <Image
          src={logoPath}
          alt="Logo"
          width={isPSM ? 128 : 120}
          height={isPSM ? 21 : 40}
          style={{
            filter: isPSM && mode === "dark" ? "brightness(2)" : undefined,
          }}
        />
      </Box>
    </Link>
  );
}
