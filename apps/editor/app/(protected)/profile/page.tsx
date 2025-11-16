"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useSession } from "next-auth/react";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    isPersonal: boolean;
    userRole: string | null;
  } | null;
  accounts: Array<{
    provider: string;
    type: string;
  }>;
}

const ProfilePage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch user data");
      }
      if (!data.user) {
        throw new Error("User data not found in response");
      }
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load user data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for session to be loaded before fetching user data
    if (sessionStatus === "loading") {
      return;
    }
    if (sessionStatus === "unauthenticated") {
      setError("Please sign in to view your profile");
      setLoading(false);
      return;
    }
    if (sessionStatus === "authenticated" && session?.user?.id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.user?.id]);


  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      google: "Google",
      github: "GitHub",
      credentials: "Email/Password",
    };
    return labels[provider] || provider;
  };



  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <Box
        sx={(theme) => ({
          marginLeft: "392px",
          padding: "24px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Box sx={{ paddingBottom: 3 }}>
          <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
            Profile
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : error || !userData ? (
          <Box sx={{ maxWidth: 800 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "User not found"}
            </Alert>
            {error && (
              <Typography variant="body2" color="text.secondary">
                Please try refreshing the page or contact support if the problem
                persists.
              </Typography>
            )}
          </Box>
        ) : userData ? (
          <Box sx={{ maxWidth: 800 }}>
          <Paper
            sx={(theme) => ({
              p: 4,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(22, 24, 26, 0.85)"
                  : "#14171A",
              backdropFilter: "blur(20px) saturate(130%)",
              WebkitBackdropFilter: "blur(20px) saturate(130%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 1,
            })}
          >
            {/* Profile Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 4,
              }}
            >
              <Avatar
                src={userData.image || undefined}
                alt={userData.name || userData.email || "User"}
                sx={{ width: 80, height: 80, fontSize: "2rem" }}
              >
                {userData.name?.charAt(0)?.toUpperCase() ||
                  userData.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                  {userData.name || "No name set"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData.email}
                </Typography>
                {userData.emailVerified && (
                  <Chip
                    icon={<VerifiedUserIcon />}
                    label="Email Verified"
                    size="small"
                    color="success"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* User Information */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonIcon fontSize="small" /> Name
                </Typography>
                <Typography variant="body1">
                  {userData.name || "Not set"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EmailIcon fontSize="small" /> Email
                </Typography>
                <Typography variant="body1">{userData.email}</Typography>
              </Box>

              {userData.organization && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <BusinessIcon fontSize="small" /> Organization
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="body1">
                        {userData.organization.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Slug: {userData.organization.slug}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label={
                            userData.organization.isPersonal
                              ? "Personal"
                              : "Team"
                          }
                          size="small"
                          variant="outlined"
                        />
                        {userData.organization.userRole && (
                          <Chip
                            label={userData.organization.userRole}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              {userData.accounts.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Connected Accounts
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {userData.accounts.map((account, index) => (
                        <Chip
                          key={index}
                          label={getProviderLabel(account.provider)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  User ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  {userData.id}
                </Typography>
              </Box>
            </Box>
          </Paper>
          </Box>
        ) : null}
      </Box>
    </>
  );
};

export default ProfilePage;

