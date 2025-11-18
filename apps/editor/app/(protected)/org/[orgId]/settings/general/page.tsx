"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  PageSection,
  textFieldStyles,
  showToast,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import { updateOrganization } from "@/app/utils/api";
import useOrganization from "@/app/hooks/useOrganization";
import { useOrgId } from "@/app/hooks/useOrgId";

const SettingsGeneralPage = () => {
  const orgId = useOrgId();
  const [saving, setSaving] = useState(false);
  const {
    organization,
    loadingOrganization,
    error: orgError,
    mutate,
  } = useOrganization(orgId);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  // Sync organization data to form when it loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        slug: organization.slug || "",
      });
    }
  }, [organization]);

  const loading = loadingOrganization;
  const error = orgError ? "Failed to load organization data" : null;

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);

    try {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      await updateOrganization({
        name: formData.name,
        slug: formData.slug,
      }, orgId);

      mutate(); // Refresh organization from SWR
      showToast("Organization updated successfully", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update organization";
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange =
    (field: "name" | "slug") => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (loading) {
    return (
      <>
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
          <PageHeader title="General Settings" />
          <PageDescription>
            Organization name, logo, domain, and default coordinate system
          </PageDescription>
          <PageContent maxWidth="5xl">
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          </PageContent>
        </Page>
      </>
    );
  }

  if (!organization) {
    return (
      <>
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
          <PageHeader title="General Settings" />
          <PageDescription>
            Organization name, logo, domain, and default coordinate system
          </PageDescription>
          <PageContent maxWidth="5xl">
            <Alert severity="error">Organization not found</Alert>
          </PageContent>
        </Page>
      </>
    );
  }

  const hasChanges =
    formData.name !== organization.name || formData.slug !== organization.slug;
  const canEdit =
    organization.userRole === "owner" || organization.userRole === "admin";

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
        <PageHeader title="General Settings" />
        <PageDescription>
          Organization name, logo, domain, and default coordinate system
        </PageDescription>

        <PageContent maxWidth="5xl">
          {/* Actions Toolbar */}
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 2,
              mb: 3,
              pb: 3,
              alignItems: "center",
              justifyContent: "flex-end",
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            {hasChanges && (
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({
                    name: organization.name,
                    slug: organization.slug,
                  });
                }}
                disabled={saving}
                size="small"
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  padding: "6px 16px",
                })}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!canEdit || !hasChanges || saving}
              size="small"
              sx={(theme) => ({
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
                minWidth: 120,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              })}
            >
              {saving ? <CircularProgress size={16} /> : "Save"}
            </Button>
          </Box>

          <PageCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Organization Settings
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!canEdit && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You need admin or owner role to edit organization settings.
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  Organization Name *
                </Typography>
                <TextField
                  id="org-name"
                  name="org-name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  fullWidth
                  size="small"
                  disabled={!canEdit || saving}
                  placeholder="Enter organization name"
                  sx={textFieldStyles}
                />
              </Box>

              <Box>
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  Slug *
                </Typography>
                <TextField
                  id="org-slug"
                  name="org-slug"
                  value={formData.slug}
                  onChange={handleChange("slug")}
                  fullWidth
                  size="small"
                  disabled={!canEdit || saving || organization.isPersonal}
                  placeholder="Enter organization slug"
                  sx={textFieldStyles}
                />
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    color: theme.palette.text.secondary,
                    mt: 0.5,
                  })}
                >
                  {organization.isPersonal
                    ? "Personal organization slug cannot be changed"
                    : "URL-friendly identifier (lowercase letters, numbers, hyphens, underscores)"}
                </Typography>
              </Box>

              <PageSection title="Organization Information" spacing="tight">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Organization ID: {organization.id}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Type: {organization.isPersonal ? "Personal" : "Team"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Role: {organization.userRole || "Member"}
                </Typography>
              </PageSection>
            </Box>
          </PageCard>
        </PageContent>
      </Page>
    </>
  );
};

export default SettingsGeneralPage;
