"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { Box, Typography, Chip, alpha } from "@mui/material";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";

const LibraryDataSourcesPage = () => {
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
          pointerEvents: "none",
          opacity: 0.5,
        }}
      >
        <Box sx={{ paddingBottom: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600 }}>
              Data Sources
            </Typography>
            <Chip
              label="Coming Soon"
              size="small"
              sx={{
                backgroundColor: alpha("#6366f1", 0.15),
                color: "#6366f1",
                border: "1px solid",
                borderColor: alpha("#6366f1", 0.4),
                fontSize: "0.75rem",
                height: 24,
                fontWeight: 500,
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Manage Cesium Ion tokens, external APIs, cloud storage, IoT endpoints, and GIS layers
          </Typography>
        </Box>

        {/* TODO: Add data sources management */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Data sources management coming soon...
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default LibraryDataSourcesPage;

