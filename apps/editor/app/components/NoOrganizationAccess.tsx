"use client";

import React from "react";
import { Box, Typography, Button, Link, alpha } from "@mui/material";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

interface NoOrganizationAccessProps {
  firstName: string | null;
}

export default function NoOrganizationAccess({
  firstName,
}: NoOrganizationAccessProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://klorad.com";
  const contactUrl = `${siteUrl}/contact`;

  const handleBookDemo = () => {
    window.open(contactUrl, "_blank");
  };

  const handleContactUs = async () => {
    try {
      // Use the support API endpoint
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: "Account Activation Request",
          message: `Hi, I would like to request access to Klorad. My account is not currently linked to any organization.`,
        }),
      });

      if (response.ok) {
        alert("Your message has been sent. We'll get back to you soon!");
      } else {
        // Fallback to opening contact page if API fails
        window.open(contactUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to send support request:", error);
      // Fallback to opening contact page
      window.open(contactUrl, "_blank");
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const displayName = firstName || "there";

  return (
    <>
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          padding: 3,
          backgroundColor: "transparent",
        }}
      >
        <Box
          sx={(theme) => ({
            maxWidth: 700,
            p: 5,
            backgroundColor: "#161B20",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: `${theme.shape.borderRadius}px`,
            boxShadow: "none",
            color: theme.palette.text.primary,
          })}
        >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 4,
              }}
            >
              <Image
                src="/images/logo/klorad-logo.svg"
                alt="Klorad"
                width={130}
                height={40}
                priority
                style={{
                  filter: "brightness(0) invert(1)",
                  display: "block",
                  width: "130px",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={(theme) => ({
                fontWeight: 600,
                mb: 3,
                color: theme.palette.primary.main,
              })}
            >
              Account Access Required
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8, textAlign: "left" }}
            >
              Hi {displayName},
              <br />
              <br />
              Thank you for your interest in Klorad. We noticed that your account is not currently linked to any organization workspace.
              <br />
              <br />
              Klorad is an enterprise platform designed for organizations that need to create, visualize, and share immersive 3D experiences at scale. Access is provided exclusively through organization workspaces to ensure the security, collaboration, and support that enterprise teams require.
              <br />
              <br />
              To activate your account, please either:
              <br />
              <br />
              • Ask your team to invite you if you already have an active organization, or
              <br />
              <br />
              • Contact the Klorad team to request access or book a demo. We&apos;ll work with you to set up the right solution for your organization&apos;s needs.
            </Typography>

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "left",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 0.5,
                }}
              >
                Best regards,
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                The Klorad Team
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleBookDemo}
                  sx={(theme) => ({
                    borderRadius: `${theme.shape.borderRadius}px`,
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#161B20"
                        : theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    padding: "6px 16px",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#1a1f26"
                          : alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                    },
                  })}
                >
                  Book a demo
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleContactUs}
                  sx={{
                    minHeight: "38px",
                    px: 4,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Contact Us
                </Button>
              </Box>
              <Link
                component="button"
                onClick={handleLogout}
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  cursor: "pointer",
                  "&:hover": {
                    color: "primary.main",
                    textDecoration: "underline",
                  },
                }}
              >
                Logout
              </Link>
            </Box>
        </Box>
      </Box>
    </>
  );
}

