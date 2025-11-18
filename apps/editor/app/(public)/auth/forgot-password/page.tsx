"use client";

import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  TextField,
  Link as MuiLink,
  Alert,
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

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  fontSize: "0.9375rem",
  fontWeight: 500,
  padding: theme.spacing(1.5, 3),
  borderRadius: "4px",
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset email");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SignInContainer>
        <SignInCard>
          <Box mb={4}>
            <LogoHeader />
          </Box>
          <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
            If an account exists with this email and was created with email/password,
            a password reset code has been sent. Please check your email and enter the
            6-digit code to reset your password.
          </Alert>
          <Alert severity="info" sx={{ mb: 2, width: "100%" }}>
            <Typography variant="body2">
              <strong>Note:</strong> If you signed up with Google or GitHub, you won&apos;t
              receive an email because those accounts don&apos;t have passwords. Please sign in
              using your OAuth provider instead.
            </Typography>
          </Alert>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 3,
              textAlign: "center",
            }}
          >
            The reset code will expire in 1 hour.
          </Typography>
          <Button
            component={Link}
            href="/auth/reset-password"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          >
            Enter Reset Code
          </Button>
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            fullWidth
          >
            Back to Sign In
          </Button>
        </SignInCard>
      </SignInContainer>
    );
  }

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
          Forgot Password
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: (theme) => alpha(theme.palette.text.secondary, 0.8),
            mb: 2,
            textAlign: "center",
          }}
        >
          Enter your email address and we&apos;ll send you a code to reset your password.
        </Typography>

        <Alert
          severity="info"
          sx={{
            mb: 3,
            width: "100%",
            fontSize: "0.875rem",
          }}
        >
          <Typography variant="body2">
            <strong>Signed up with Google or GitHub?</strong> If you created your account
            using an OAuth provider (Google, GitHub), you don&apos;t have a password to reset.
            Please sign in using that provider instead.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            autoFocus
          />
          <SubmitButton type="submit" fullWidth disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </SubmitButton>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center", width: "100%" }}>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Remember your password?{" "}
            <MuiLink
              component={Link}
              href="/auth/signin"
              sx={{
                color: (theme) => theme.palette.primary.main,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign in
            </MuiLink>
          </Typography>
        </Box>
      </SignInCard>
    </SignInContainer>
  );
}

