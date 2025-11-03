"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { Button, Typography, Box } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import { useTenant } from "@envisio/core";

const SignInContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(135deg, #0a0d10 0%, #14171a 50%, #1a1f24 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
  padding: theme.spacing(2),
}));

const SignInCard = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: 480,
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha("#14171A", 0.95)
      : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 30px rgba(0, 0, 0, 0.4)"
      : "0 0 30px rgba(95, 136, 199, 0.12)",
  padding: theme.spacing(6, 5),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4, 3),
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.16)
      : "#4285F4",
  color: theme.palette.mode === "dark" ? "#ffffff" : "#ffffff",
  fontSize: "0.9375rem",
  fontWeight: 500,
  padding: theme.spacing(1.5, 3),
  borderRadius: "4px",
  textTransform: "none",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(107, 156, 216, 0.3)"
      : "none",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.24)
        : "#357ae8",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
}));

export default function SignInPage() {
  const tenant = useTenant();

  return (
    <SignInContainer>
      <SignInCard>
        <Box mb={4}>
          <LogoHeader />
        </Box>

        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 600,
            color: (theme) => theme.palette.text.primary,
            mb: 1,
          }}
        >
          Welcome
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: (theme) => alpha(theme.palette.text.secondary, 0.8),
            mb: 1,
            textAlign: "center",
            fontSize: "0.8125rem",
            letterSpacing: "0.02em",
          }}
        >
          Spatial Authoring Environment for Real-World Operations
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: (theme) => theme.palette.text.secondary,
            mb: 5,
            textAlign: "center",
          }}
        >
          Sign in to continue to {tenant.name}
        </Typography>

        <GoogleButton
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </GoogleButton>

        <Typography
          variant="caption"
          sx={{
            mt: 4,
            color: (theme) => alpha(theme.palette.text.secondary, 0.7),
            textAlign: "center",
            maxWidth: 360,
          }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </SignInCard>
    </SignInContainer>
  );
}
