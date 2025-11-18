"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { useTenant } from "@envisio/core";

export default function LogoHeader() {
  const tenant = useTenant();

  return (
    <Link href="/" aria-label="Go to Home" style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 130, // Fixed display width for consistent alignment
            height: "auto",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <Image
            src={tenant.logo}
            alt={tenant.logoAlt}
            width={tenant.logoWidth}
            height={tenant.logoHeight}
            priority
            style={{
              filter: tenant.logo.endsWith(".png")
                ? "brightness(0) invert(1)"
                : "none",
              display: "block",
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Box>
        {tenant.poweredBy && (
          <Link
            href="https://klorad.com/partners"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                color: (theme) => theme.palette.text.secondary,
                opacity: 0.7,
                letterSpacing: "0.02em",
                transition: "opacity 0.2s ease",
                "&:hover": {
                  opacity: 1,
                },
              }}
            >
              {tenant.poweredBy}
            </Typography>
          </Link>
        )}
      </Box>
    </Link>
  );
}
