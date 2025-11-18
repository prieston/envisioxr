"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import GoogleIcon from "@mui/icons-material/Google";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import { useTenant } from "@envisio/core";
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

export default function SignInPage() {
  const tenant = useTenant();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user just signed in and has a pending invitation
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Check for stored invite token
      const inviteToken = sessionStorage.getItem("inviteToken");
      if (inviteToken) {
        // Redirect back to invite acceptance page
        router.push(`/orgs/invites/accept?token=${inviteToken}`);
        return;
      }
    }
  }, [status, session, router]);

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
          CredentialsSignin: "Invalid email or password. Please try again.",
          "Email not verified. Please check your email.": "Email not verified. Please check your email.",
        };

        const errorMessage =
          errorMessages[result.error] ||
          result.error ||
          "Invalid email or password. Please try again.";

        setError(errorMessage);
        setLoading(false);
      } else if (result?.ok) {
        // Check for pending invitation
        const inviteToken = sessionStorage.getItem("inviteToken");
        if (inviteToken) {
          // Redirect to invite acceptance page
          router.push(`/orgs/invites/accept?token=${inviteToken}`);
        } else {
          // Default redirect
          router.push("/");
          router.refresh();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

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
            mb: 4,
            textAlign: "center",
          }}
        >
          Sign in to continue to {tenant.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        <EmailPasswordForm onSubmit={handleEmailPasswordSignIn} component="form">
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
            autoComplete="current-password"
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <MuiLink
              component={Link}
              href="/auth/forgot-password"
              sx={{
                color: (theme) => theme.palette.primary.main,
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot password?
            </MuiLink>
          </Box>
          <SubmitButton type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Email"}
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
          onClick={() => {
            // Check for pending invitation
            const inviteToken =
              typeof window !== "undefined"
                ? sessionStorage.getItem("inviteToken")
                : null;
            const callbackUrl = inviteToken
              ? `/orgs/invites/accept?token=${inviteToken}`
              : "/";
            signIn("google", { callbackUrl });
          }}
        >
          Continue with Google
        </GoogleButton>

        <Box sx={{ mt: 3, textAlign: "center", width: "100%" }}>
          <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Don&apos;t have an account?{" "}
            <MuiLink
              component={Link}
              href="/auth/signup"
              sx={{
                color: (theme) => theme.palette.primary.main,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign up
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
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </SignInCard>
    </SignInContainer>
  );
}
