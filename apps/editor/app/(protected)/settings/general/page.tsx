"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageActions,
  PageContent,
  PageCard,
  PageSection,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import { showToast } from "@envisio/ui";

interface Organization {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  userRole: string | null;
}

const SettingsGeneralPage = () => {
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const res = await fetch("/api/organizations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch organization");
      const data = await res.json();
      setOrganization(data.organization);
      setFormData({
        name: data.organization.name || "",
        slug: data.organization.slug || "",
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
      setError("Failed to load organization data");
    }
  };

  const handleSave = async () => {
    if (!organization) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update organization");
      }

      const data = await res.json();
      setOrganization(data.organization);
      showToast("Organization updated successfully", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update organization";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: "name" | "slug") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (!organization) {
    return (
      <>
        <Box
          sx={{
            marginLeft: "392px",
            padding: "24px",
          }}
        >
          <Alert severity="error">Organization not found</Alert>
        </Box>
      </>
    );
  }

  const hasChanges =
    formData.name !== organization.name || formData.slug !== organization.slug;
  const canEdit = organization.userRole === "owner" || organization.userRole === "admin";

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

        <PageActions>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!canEdit || !hasChanges || saving}
            sx={{ minWidth: 120 }}
          >
            {saving ? <CircularProgress size={24} /> : "Save"}
          </Button>
          {hasChanges && (
            <Button
              variant="outlined"
              onClick={() => {
                setFormData({
                  name: organization.name,
                  slug: organization.slug,
                });
                setError(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
        </PageActions>

        <PageContent maxWidth="5xl">
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
              <TextField
                label="Organization Name"
                value={formData.name}
                onChange={handleChange("name")}
                fullWidth
                disabled={!canEdit || saving}
                required
              />

              <TextField
                label="Slug"
                value={formData.slug}
                onChange={handleChange("slug")}
                fullWidth
                disabled={!canEdit || saving || organization.isPersonal}
                required
                helperText={
                  organization.isPersonal
                    ? "Personal organization slug cannot be changed"
                    : "URL-friendly identifier (lowercase letters, numbers, hyphens, underscores)"
                }
              />

              <PageSection title="Organization Information" spacing="tight">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Organization ID: {organization.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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

