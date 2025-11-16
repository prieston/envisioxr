"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

const SettingsBillingPage = () => {
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

      {/* Main Content Area */}
      <Box
        sx={{
          marginLeft: "392px",
          padding: "24px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ paddingBottom: 3 }}>
          <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
            Billing
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage your subscription plan, invoices, and payment methods
          </Typography>
        </Box>

        {/* TODO: Add billing management */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Billing management coming soon...
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default SettingsBillingPage;

