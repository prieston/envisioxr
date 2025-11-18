"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { PageCard } from "@envisio/ui";

interface Announcement {
  title: string;
}

interface ChangelogProps {
  announcements: Announcement[];
}

export const Changelog: React.FC<ChangelogProps> = ({ announcements }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <PageCard>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Changelog
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {announcements.map((announcement, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#6B9CD8",
                  mt: 1,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {announcement.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </PageCard>
    </Box>
  );
};

