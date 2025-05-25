import Link from "next/link";
import { Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoHeader() {
  const [logoPath, setLogoPath] = useState("/images/logo/logo-dark.svg");

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "psm.envisioxr.com") {
        setLogoPath("/images/logo/psm-logo.png");
      } else {
        setLogoPath("/images/logo/logo-dark.svg");
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
        <Image src={logoPath} alt="Logo" width={120} height={40} />
      </Box>
    </Link>
  );
}
