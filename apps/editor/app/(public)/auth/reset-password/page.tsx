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

export default function ResetPasswordPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError("Reset code is required");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
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
            Your password has been reset successfully! You can now sign in with your new password.
          </Alert>
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
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: (theme) => alpha(theme.palette.text.secondary, 0.8),
            mb: 4,
            textAlign: "center",
          }}
        >
          Enter the 6-digit code sent to your email and your new password.
        </Typography>

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
            label="Reset Code"
            type="text"
            value={code}
            onChange={(e) => {
              // Only allow digits and limit to 6 characters
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
            }}
            required
            fullWidth
            autoFocus
            inputProps={{
              maxLength: 6,
              style: {
                textAlign: "center",
                fontSize: "24px",
                letterSpacing: "0.2em",
                fontFamily: "monospace",
              },
            }}
            helperText="Enter the 6-digit code from your email"
          />
          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            helperText="Must be at least 8 characters"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <SubmitButton type="submit" fullWidth disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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

