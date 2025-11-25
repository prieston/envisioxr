"use client";

import React from "react";
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
} from "@mui/material";
import { StarIcon } from "@klorad/ui";
import { Plan } from "@/app/utils/api";
import { createOrganizationCheckoutSession } from "@/app/utils/api";
import { showToast } from "@klorad/ui";

interface PlanSelectionModalProps {
  open: boolean;
  orgName: string;
  orgSlug: string;
  plans: Plan[];
  onClose: () => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  open,
  orgName,
  orgSlug,
  plans,
  onClose,
}) => {
  const [loading, setLoading] = React.useState(false);
  const proPlan = plans.find((p) => p.code === "pro");

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Custom";
    if (cents === 0) return "Free";
    return `€${(cents / 100).toFixed(2)}`;
  };

  const handleContinue = async () => {
    if (!proPlan) {
      showToast("Pro plan not found", "error");
      return;
    }

    setLoading(true);
    try {
      const { url } = await createOrganizationCheckoutSession(
        "pro",
        "monthly",
        orgName,
        orgSlug
      );
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create checkout session",
        "error"
      );
      setLoading(false);
    }
  };

  if (!proPlan) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          backgroundColor:
            theme.palette.mode === "dark" ? "#14171A" : theme.palette.background.paper,
          borderRadius: 2,
        }),
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Choose Your Plan
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Organizations require a Pro plan. Select your billing plan to continue.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Card
          sx={{
            border: (theme) => `2px solid ${theme.palette.primary.main}`,
            position: "relative",
            mt: 1,
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
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          variant="contained"
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {loading ? "Processing..." : "Continue to Checkout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

