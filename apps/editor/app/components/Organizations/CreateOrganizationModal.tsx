"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  Divider,
  alpha,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Plan } from "@/app/utils/api";
import { createOrganizationCheckoutSession } from "@/app/utils/api";
import { showToast } from "@envisio/ui";
import { textFieldStyles, SettingContainer, SettingLabel } from "@envisio/ui";

interface CreateOrganizationModalProps {
  open: boolean;
  plans: Plan[];
  onClose: () => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  open,
  plans,
  onClose,
}) => {
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const proPlan = plans.find((p) => p.code === "pro");

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Custom";
    if (cents === 0) return "Free";
    return `€${(cents / 100).toFixed(2)}`;
  };

  const handleContinue = async () => {
    if (!orgName.trim() || !orgSlug.trim()) {
      showToast("Please fill in organization name and slug", "error");
      return;
    }

    if (!proPlan) {
      showToast("Pro plan not found", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await createOrganizationCheckoutSession(
        "pro",
        "monthly",
        orgName.trim(),
        orgSlug.trim()
      );
      if (result.url) {
        // If billing was bypassed, result will have bypassed: true
        if (result.bypassed) {
          showToast("Organization created successfully!", "success");
          onClose();
          // Small delay to ensure toast is visible, then redirect
          setTimeout(() => {
            window.location.href = result.url;
          }, 500);
        } else {
          // Regular flow: redirect to Stripe checkout
          window.location.href = result.url;
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      console.error("Error data:", error?.data);

      let errorMessage = "Failed to create checkout session";

      // Extract error message from ApiError
      if (error?.data) {
        if (typeof error.data === "string") {
          errorMessage = error.data;
        } else if (error.data?.error) {
          errorMessage = error.data.error;
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error("Displaying error:", errorMessage);
      showToast(errorMessage, "error");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setOrgName("");
      setOrgSlug("");
      onClose();
    }
  };

  if (!proPlan) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 1500, // Higher than sidebar (1400)
        "& .MuiBackdrop-root": {
          zIndex: 1499, // Backdrop should be just below dialog
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#14171A",
          borderRadius: 2,
          boxShadow: "none",
          backgroundImage: "none",
          zIndex: 1500,
        },
      }}
      slotProps={{
        backdrop: {
          sx: (theme) => ({
            backgroundColor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: "blur(4px)",
          }),
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Create Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Organizations require a Pro plan. Enter your organization details and proceed to payment.
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Organization Details */}
        <Box sx={{ mb: 3 }}>
          <SettingContainer sx={{ borderBottom: "none", padding: 0, mb: 2 }}>
            <SettingLabel>Organization Name</SettingLabel>
            <TextField
              id="org-name"
              name="org-name"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
                // Auto-generate slug from name if slug is empty or matches previous name
                if (!orgSlug || orgSlug === orgName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) {
                  const autoSlug = e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  setOrgSlug(autoSlug);
                }
              }}
              placeholder="Enter organization name"
              fullWidth
              size="small"
              variant="outlined"
              disabled={loading}
              sx={textFieldStyles}
            />
          </SettingContainer>

          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Slug</SettingLabel>
            <TextField
              id="org-slug"
              name="org-slug"
              value={orgSlug}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");
                setOrgSlug(value);
              }}
              placeholder="organization-slug"
              fullWidth
              size="small"
              variant="outlined"
              disabled={loading}
              sx={textFieldStyles}
              helperText="Used in URLs. Only lowercase letters, numbers, hyphens, and underscores."
            />
          </SettingContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Plan Selection */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: "text.secondary" }}>
            Selected Plan
          </Typography>
          <Card
            sx={{
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              position: "relative",
            }}
          >
            <Chip
              icon={<StarIcon />}
              label="Recommended"
              color="primary"
              size="small"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
              }}
            />
            <CardContent sx={{ pt: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {proPlan.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {formatPrice(proPlan.monthlyPriceCents)}
                </Typography>
                {proPlan.monthlyPriceCents !== null && proPlan.monthlyPriceCents > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Perfect for teams and organizations. Includes unlimited projects, members, and
                advanced features.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          variant="contained"
          disabled={!orgName.trim() || !orgSlug.trim() || loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Processing..." : "Continue to Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

