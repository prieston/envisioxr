"use client";

import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useSession } from "next-auth/react";
import useUser from "@/app/hooks/useUser";

const ProfilePage = () => {
  const { status: sessionStatus } = useSession();
  const { user: userData, loadingUser, error: userError } = useUser();

  // Determine loading and error states
  const loading = sessionStatus === "loading" || loadingUser;
  const error =
    sessionStatus === "unauthenticated"
      ? "Please sign in to view your profile"
      : userError
        ? userError.message || "Failed to load user data"
        : null;

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

      <Page>
        <PageHeader title="Profile" />
        <PageDescription>
          View your account information, organization details, and connected
          accounts
        </PageDescription>

        <Box sx={{ "& > div": { mt: "24px !important" } }}>
          <PageContent maxWidth="5xl">
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
              <PageCard>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error || "User not found"}
                </Alert>
                {error && (
                  <Typography variant="body2" color="text.secondary">
                    Please try refreshing the page or contact support if the
                    problem persists.
                  </Typography>
                )}
              </PageCard>
            ) : (
              <>
                {/* Profile Header Card */}
                <Box sx={{ mb: 3 }}>
                  <PageCard padding={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
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
                        <Typography
                          variant="h6"
                          sx={{ mb: 0.5, fontWeight: 600 }}
                        >
                          {userData.name || "No name set"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                  </PageCard>
                </Box>

                {/* User Information Card */}
                <PageCard padding={2}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Account Information
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 3,
                    }}
                  >
                    <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                      <Typography
                        sx={(theme) => ({
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        })}
                      >
                        Name
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PersonIcon
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.primary">
                          {userData.name || "Not set"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                      <Typography
                        sx={(theme) => ({
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        })}
                      >
                        Email
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <EmailIcon
                          fontSize="small"
                          sx={{ color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.primary">
                          {userData.email}
                        </Typography>
                      </Box>
                    </Box>

                    {userData.organization && (
                      <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                        <Typography
                          sx={(theme) => ({
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            mb: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          })}
                        >
                          Organization
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <BusinessIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2" color="text.primary">
                            {userData.organization.name}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
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
                    )}

                    {userData.accounts.length > 0 && (
                      <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                        <Typography
                          sx={(theme) => ({
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            mb: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          })}
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
                    )}

                    <Box sx={{ minWidth: "200px", flex: "1 1 auto" }}>
                      <Typography
                        sx={(theme) => ({
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          mb: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        })}
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
                </PageCard>
              </>
            )}
          </PageContent>
        </Box>
      </Page>
    </>
  );
};

export default ProfilePage;
