import Link from "next/link";
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function LogoHeader() {
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
          src="/images/logo/logo-dark.svg"
          alt="EnvisioXR Logo"
          width={120}
          height={40}
        />
      </Box>
    </Link>
  );
}
