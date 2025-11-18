"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import Link from "next/link";

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

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double calls in React StrictMode
    if (hasVerified.current) {
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    hasVerified.current = true;

    // Call the API to verify the email
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Failed to verify email");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      })
      .catch((error) => {
        console.error("[Verify Email] Error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      });
  }, [searchParams]);

  return (
    <SignInContainer>
      <SignInCard>
        <Box mb={4}>
          <LogoHeader />
        </Box>

        {status === "loading" && (
          <>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: 1,
                textAlign: "center",
              }}
            >
              Verifying your email...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => alpha(theme.palette.text.secondary, 0.8),
                textAlign: "center",
              }}
            >
              Please wait while we verify your email address.
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <Alert severity="success" sx={{ mb: 3, width: "100%" }}>
              {message}
            </Alert>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: 2,
                textAlign: "center",
              }}
            >
              Email Verified!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.palette.text.secondary,
                mb: 3,
                textAlign: "center",
              }}
            >
              Your email has been verified successfully. You can now sign in to your account.
            </Typography>
            <Button
              component={Link}
              href="/auth/signin"
              variant="contained"
              fullWidth
            >
              Go to Sign In
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
              {message}
            </Alert>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: (theme) => theme.palette.text.primary,
                mb: 2,
                textAlign: "center",
              }}
            >
              Verification Failed
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.palette.text.secondary,
                mb: 3,
                textAlign: "center",
              }}
            >
              {message.includes("expired")
                ? "This verification link has expired. Please request a new verification email."
                : "There was a problem verifying your email. Please try again or contact support."}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
              <Button
                component={Link}
                href="/auth/signin"
                variant="contained"
                fullWidth
              >
                Go to Sign In
              </Button>
              {message.includes("expired") && (
                <Button
                  component={Link}
                  href="/auth/signup"
                  variant="outlined"
                  fullWidth
                >
                  Sign Up Again
                </Button>
              )}
            </Box>
          </>
        )}
      </SignInCard>
    </SignInContainer>
  );
}

