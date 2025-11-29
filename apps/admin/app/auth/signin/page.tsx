"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isGodUser } from "@/lib/config/godusers";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Google as GoogleIcon, GitHub as GitHubIcon } from "@mui/icons-material";

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
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to access the admin panel
          </Typography>

          {error && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "error.light",
                color: "error.contrastText",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              Sign in with Google
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GitHubIcon />}
              onClick={() => handleOAuthSignIn("github")}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              Sign in with GitHub
            </Button>

            <Divider sx={{ my: 1 }}>OR</Divider>

            <form onSubmit={handleCredentialsSignIn}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ textTransform: "none", mt: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign In"}
                </Button>
              </Box>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

