"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isGodUser } from "@/lib/config/godusers";
import {
  Box,
  Button,
  Typography,
  TextField,
  Divider,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import {
  PageCard,
  textFieldStyles,
  SettingContainer,
  SettingLabel,
} from "@klorad/ui";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for error in URL params (from middleware redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "access_denied") {
      setError("Access denied. Admin access required.");
    }
  }, []);

  useEffect(() => {
    // Check if already signed in and is a god user
    getSession().then((session) => {
      if (session?.user?.email && isGodUser(session.user.email)) {
        router.push("/dashboard");
      } else if (session?.user?.email) {
        // User is logged in but not a god user - show error
        setError("Access denied. Admin access required.");
      }
    });
  }, [router]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Check if user is a god user
        const session = await getSession();
        if (session?.user?.email && isGodUser(session.user.email)) {
          router.push("/dashboard");
        } else {
          setError("Access denied. Admin access required.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    try {
      // OAuth will redirect, but we need to handle the callback
      // The middleware will check if user is a god user and redirect accordingly
      await signIn(provider, {
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ maxWidth: 400, width: "100%" }}>
        <PageCard>
          <Box sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 600, fontSize: "1rem", mb: 1 }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
                align: "center",
                mb: 3,
              }}
            >
              Sign in to access the admin panel
            </Typography>

            {error && (
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: alpha("#ef4444", 0.1),
                  color: "#ef4444",
                  borderRadius: 1,
                  border: `1px solid ${alpha("#ef4444", 0.3)}`,
                }}
              >
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                sx={(theme) => ({
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                })}
              >
                Sign in with Google
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<GitHubIcon />}
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                sx={(theme) => ({
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  "&:hover": {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                })}
              >
                Sign in with GitHub
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                >
                  OR
                </Typography>
              </Divider>

              <form onSubmit={handleCredentialsSignIn}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <SettingContainer>
                    <SettingLabel>Email</SettingLabel>
                    <TextField
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      fullWidth
                      disabled={loading}
                      sx={textFieldStyles}
                    />
                  </SettingContainer>
                  <SettingContainer>
                    <SettingLabel>Password</SettingLabel>
                    <TextField
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      disabled={loading}
                      sx={textFieldStyles}
                    />
                  </SettingContainer>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={(theme) => ({
                      textTransform: "none",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      mt: 1,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#161B20"
                          : theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      boxShadow: "none",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "#1a1f26"
                            : alpha(theme.palette.primary.main, 0.05),
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                      },
                      "&.Mui-disabled": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        color: alpha(theme.palette.primary.main, 0.3),
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    })}
                  >
                    {loading ? <CircularProgress size={20} /> : "Sign In"}
                  </Button>
                </Box>
              </form>
            </Box>
          </Box>
        </PageCard>
      </Box>
    </Box>
  );
}
