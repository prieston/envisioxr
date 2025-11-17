"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { PageCard } from "@envisio/ui";

interface UsageSummaryProps {
  storageUsed: string;
}

export const UsageSummary: React.FC<UsageSummaryProps> = ({ storageUsed }) => {
  const usageItems = [
    { label: `Storage: ${storageUsed} / 100 GB` },
    { label: "API Calls: 12.4K this month" },
    { label: "Renders: 847 this month" },
  ];

  return (
    <Box sx={{ mt: 3 }}>
      <PageCard>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Usage Summary
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {usageItems.map((item, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: "4px",
                  height: "20px",
                  backgroundColor: "#6B9CD8",
                  borderRadius: "2px",
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </PageCard>
    </Box>
  );
};

