"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Paper,
  Alert,
} from "@mui/material";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";
import { showToast } from "@envisio/ui";

interface Organization {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  userRole: string | null;
}

const SettingsPage = () => {
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
        <DashboardSidebar />
        <Box
          sx={{
            marginLeft: "392px",
            padding: "24px",
            backgroundColor: (theme) => theme.palette.background.default,
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
            Settings
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 600 }}>
          <Paper
            sx={(theme) => ({
              p: 3,
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

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
              </Box>

              <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Organization ID: {organization.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Type: {organization.isPersonal ? "Personal" : "Team"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Role: {organization.userRole || "Member"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default SettingsPage;

