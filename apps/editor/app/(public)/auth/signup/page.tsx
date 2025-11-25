"use client";

import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  TextField,
  Divider,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { GoogleIcon } from "@klorad/ui";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import Link from "next/link";
import { signIn } from "next-auth/react";

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

const EmailPasswordForm = styled(Box)<{ component?: React.ElementType }>(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
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

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendVerification, setResendVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle case where user already exists and is verified
        if (response.status === 409 && data.verified) {
          setError(
            "An account with this email already exists and is verified. Please sign in instead."
          );
        } else {
          setError(data.error || "Failed to create account");
        }
        setLoading(false);
        return;
      }

      // Check if this is a resend verification case
      if (data.resendVerification) {
        setResendVerification(true);
      } else {
        setSuccess(true);
      }
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success || resendVerification) {
    return (
      <SignInContainer>
        <SignInCard>
          <Box mb={4}>
            <LogoHeader />
          </Box>
          <Alert severity="success" sx={{ mb: 2, width: "100%" }}>
            {resendVerification
              ? "A new verification email has been sent. Please check your email to verify your account."
              : "Account created! Please check your email to verify your account before signing in."}
          </Alert>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 3,
              textAlign: "center",
            }}
          >
            The verification link will expire in 24 hours.
          </Typography>
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            fullWidth
          >
            Go to Sign In
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
          Create Account
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
          Join Klorad
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        <EmailPasswordForm component="form" onSubmit={handleSignUp}>
          <TextField
            label="Name (optional)"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoComplete="name"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            helperText="Must be at least 8 characters"
          />
          <SubmitButton type="submit" fullWidth disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </SubmitButton>
        </EmailPasswordForm>

        <Box sx={{ display: "flex", alignItems: "center", width: "100%", my: 3 }}>
          <Divider sx={{ flex: 1 }} />
          <Typography
            variant="body2"
            sx={{
              px: 2,
              color: (theme) => alpha(theme.palette.text.secondary, 0.7),
            }}
          >
            OR
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>

        <GoogleButton
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </GoogleButton>

        <Box sx={{ mt: 3, textAlign: "center", width: "100%" }}>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Already have an account?{" "}
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

        <Typography
          variant="caption"
          sx={{
            mt: 3,
            color: (theme) => alpha(theme.palette.text.secondary, 0.7),
            textAlign: "center",
            maxWidth: 360,
          }}
        >
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </SignInCard>
    </SignInContainer>
  );
}

