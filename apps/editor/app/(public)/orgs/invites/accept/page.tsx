"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { signIn, signOut, useSession } from "next-auth/react";

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

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "needs-auth">("loading");
  const [message, setMessage] = useState<string>("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    userEmail?: string;
    inviteEmail?: string;
  } | null>(null);
  const hasProcessed = useRef(false);
  const isMounted = useRef(true);
  const hasRedirected = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Track mount status
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      // Clear any pending redirect
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Prevent double calls in React StrictMode
    if (hasProcessed.current) {
      return;
    }

    // Check for token in URL or sessionStorage (for retry after logout)
    let token = searchParams.get("token");
    if (!token && typeof window !== "undefined") {
      token = sessionStorage.getItem("inviteToken") || null;
    }

    if (!token) {
      if (isMounted.current) {
        setStatus("error");
        setMessage("Invalid invitation link. No token provided.");
      }
      hasProcessed.current = true;
      return;
    }

    // Check if user is authenticated
    if (sessionStatus === "loading") {
      return; // Wait for session to load
    }

    if (sessionStatus === "unauthenticated") {
      if (isMounted.current) {
        setStatus("needs-auth");
      }
      hasProcessed.current = true;
      return;
    }

    // User is authenticated, process the invitation
    hasProcessed.current = true;

    fetch("/api/organizations/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        if (!isMounted.current) return;

        const data = await response.json();

        if (!response.ok) {
          if (isMounted.current) {
            setStatus("error");
            setMessage(data.error || "Failed to accept invitation");
            // Store error details if available
            if (data.userEmail || data.inviteEmail) {
              setErrorDetails({
                userEmail: data.userEmail,
                inviteEmail: data.inviteEmail,
              });
            } else {
              setErrorDetails(null);
            }
          }
          return;
        }

        if (isMounted.current) {
          setStatus("success");
          setMessage(data.message || "Invitation accepted successfully!");
          // Clear stored token after successful acceptance
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("inviteToken");
          }
          if (data.organizationId) {
            setOrgId(data.organizationId);
            // Auto-redirect after a short delay using window.location for full page reload
            // Using window.location.href avoids React DOM manipulation issues during navigation
            redirectTimeoutRef.current = setTimeout(() => {
              if (!hasRedirected.current) {
                hasRedirected.current = true;
                window.location.href = `/org/${data.organizationId}/dashboard`;
              }
            }, 2000);
          }
        }
      })
      .catch((error) => {
        if (!isMounted.current) return;
        console.error("[Accept Invite] Error:", error);
        if (isMounted.current) {
          setStatus("error");
          setMessage("An unexpected error occurred. Please try again.");
        }
      });
  }, [searchParams, sessionStatus, router]);

  const handleSignIn = () => {
    const token = searchParams.get("token");
    if (token) {
      // Store token in sessionStorage to use after sign in
      sessionStorage.setItem("inviteToken", token);
      // Redirect to sign-in page with callbackUrl pointing back to this invite page
      const inviteUrl = window.location.href;
      signIn(undefined, { callbackUrl: inviteUrl });
    } else {
      signIn();
    }
  };

  const handleLogoutAndRetry = async () => {
    const token = searchParams.get("token");
    // Store token before logout
    if (token) {
      sessionStorage.setItem("inviteToken", token);
    }
    // Sign out and redirect to the same page
    await signOut({
      callbackUrl: window.location.href,
      redirect: true,
    });
  };

  if (status === "needs-auth") {
    return (
      <SignInContainer>
        <SignInCard>
          <Box mb={4}>
            <LogoHeader />
          </Box>
          <Alert severity="info" sx={{ mb: 3, width: "100%" }}>
            You need to sign in to accept this invitation.
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
            Accept Organization Invitation
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mb: 3,
              textAlign: "center",
            }}
          >
            Please sign in to your account to accept this organization invitation.
            If you don&apos;t have an account, you can create one after signing in.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSignIn}
            fullWidth
            sx={{
              mb: 2,
              backgroundColor: "#6366f1",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            Sign In to Accept
          </Button>
          <Button component={Link} href="/auth/signin" variant="outlined" fullWidth>
            Go to Sign In Page
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
              Accepting invitation...
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => alpha(theme.palette.text.secondary, 0.8),
                textAlign: "center",
              }}
            >
              Please wait while we process your invitation.
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
              Invitation Accepted!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.palette.text.secondary,
                mb: 3,
                textAlign: "center",
              }}
            >
              You have successfully joined the organization. You can now access
              the organization dashboard.
            </Typography>
            <Button
              component={Link}
              href={orgId ? `/org/${orgId}/dashboard` : "/"}
              variant="contained"
              fullWidth
              onClick={(e) => {
                if (hasRedirected.current) {
                  e.preventDefault();
                  return;
                }
                hasRedirected.current = true;
              }}
              sx={{
                backgroundColor: "#6366f1",
                "&:hover": {
                  backgroundColor: "#4f46e5",
                },
              }}
            >
              Go to Organization Dashboard
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
              Invitation Failed
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
                ? "This invitation link has expired. Please contact the organization administrator for a new invitation."
                : message.includes("different email address") && errorDetails?.userEmail
                ? `This invitation was sent to ${errorDetails.inviteEmail || "a different email address"}, but you are currently logged in as ${errorDetails.userEmail}. You must logout in order to accept this invitation.`
                : "There was a problem accepting the invitation. Please try again or contact support."}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
              {message.includes("different email address") && errorDetails?.userEmail && sessionStatus === "authenticated" ? (
                <>
                  <Button
                    variant="contained"
                    onClick={handleLogoutAndRetry}
                    fullWidth
                    sx={{
                      backgroundColor: "#6366f1",
                      "&:hover": {
                        backgroundColor: "#4f46e5",
                      },
                    }}
                  >
                    Logout and Retry
                  </Button>
                  <Button
                    component={Link}
                    href="/"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: (theme) => theme.palette.divider,
                      color: (theme) => theme.palette.text.secondary,
                      "&:hover": {
                        borderColor: (theme) => theme.palette.divider,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} href="/" variant="contained" fullWidth>
                    Go to Dashboard
                  </Button>
                  {sessionStatus === "authenticated" && (
                    <Button component={Link} href="/auth/signin" variant="outlined" fullWidth>
                      Sign In
                    </Button>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </SignInCard>
    </SignInContainer>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <SignInContainer>
          <SignInCard>
            <Box mb={4}>
              <LogoHeader />
            </Box>
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
              Loading...
            </Typography>
          </SignInCard>
        </SignInContainer>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

