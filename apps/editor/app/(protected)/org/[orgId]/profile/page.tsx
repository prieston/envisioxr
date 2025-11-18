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
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Button, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useUser from "@/app/hooks/useUser";
import useOrganizations from "@/app/hooks/useOrganizations";
import { createOrganization } from "@/app/utils/api";
import { CreateOrganizationDrawer } from "@/app/components/Organizations/CreateOrganizationDrawer";
import { showToast } from "@envisio/ui";

const ADMIN_EMAIL = "theofilos@prieston.gr";

const ProfilePage = () => {
  const router = useRouter();
  const theme = useTheme();
  const { status: sessionStatus } = useSession();
  const { user: userData, loadingUser, error: userError } = useUser();
  const {
    organizations,
    loadingOrganizations,
    mutate: mutateOrganizations,
  } = useOrganizations();
  const isAdmin = userData?.email === ADMIN_EMAIL;

  // Create organization drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateOrganization = useCallback(() => {
    setDrawerOpen(true);
    setOrgName("");
    setOrgSlug("");
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setOrgName("");
    setOrgSlug("");
  }, []);

  const handleSaveOrganization = useCallback(async () => {
    if (!orgName.trim() || !orgSlug.trim()) return;

    setSaving(true);
    try {
      const response = await createOrganization({
        name: orgName.trim(),
        slug: orgSlug.trim(),
      });

      // Refresh organizations list
      mutateOrganizations();

      showToast("Organization created successfully!", "success");

      // Navigate to the new organization's dashboard
      router.push(`/org/${response.organization.id}/dashboard`);

      handleCloseDrawer();
    } catch (error) {
      console.error("Error creating organization:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to create organization",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }, [orgName, orgSlug, mutateOrganizations, router, handleCloseDrawer]);

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
                <Box sx={{ mt: 3 }}>
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
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
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
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
                </Box>

                {/* My Organizations Card */}
                <Box sx={{ mt: 3 }}>
                  <PageCard padding={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        My Organizations
                      </Typography>
                      {isAdmin && (
                        <Button
                          variant="contained"
                          onClick={handleCreateOrganization}
                          size="small"
                          sx={{
                            borderRadius: `${theme.shape.borderRadius}px`,
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.75rem",
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "#161B20"
                                : theme.palette.background.paper,
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            padding: "6px 16px",
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "#1a1f26"
                                  : alpha(theme.palette.primary.main, 0.05),
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.5
                              ),
                            },
                          }}
                        >
                          + New Organisation
                        </Button>
                      )}
                    </Box>

                    {loadingOrganizations ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    ) : organizations.length === 0 ? (
                      <Alert severity="info">
                        You are not a member of any organizations yet.
                      </Alert>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                          },
                          gap: 2,
                        }}
                      >
                        {organizations.map((org) => (
                          <Box
                            key={org.id}
                            sx={{
                              p: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "border-color 0.2s",
                              "&:hover": {
                                borderColor: "primary.main",
                              },
                            }}
                            onClick={() => {
                              router.push(`/org/${org.id}/dashboard`);
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                mb: 1,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: org.isPersonal
                                    ? "primary.main"
                                    : "secondary.main",
                                }}
                              >
                                <BusinessIcon />
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {org.name}
                                </Typography>
                                {org.isPersonal && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    Your Workspace
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                mt: 1,
                              }}
                            >
                              <Chip
                                label={org.isPersonal ? "Personal" : "Team"}
                                size="small"
                                variant="outlined"
                                color={org.isPersonal ? "primary" : "default"}
                              />
                              {org.userRole && (
                                <Chip
                                  label={org.userRole}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            {org.slug && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: 1,
                                  fontFamily: "monospace",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {org.slug}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </PageCard>
                </Box>
              </>
            )}
          </PageContent>
        </Box>
      </Page>

      {/* Create Organization Drawer - Only for admin */}
      {isAdmin && (
        <CreateOrganizationDrawer
          open={drawerOpen}
          name={orgName}
          slug={orgSlug}
          saving={saving}
          onClose={handleCloseDrawer}
          onNameChange={setOrgName}
          onSlugChange={setOrgSlug}
          onSave={handleSaveOrganization}
        />
      )}
    </>
  );
};

export default ProfilePage;
