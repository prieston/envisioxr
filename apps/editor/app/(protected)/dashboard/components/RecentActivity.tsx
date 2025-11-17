"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { PageCard, ActivityItem } from "@envisio/ui";

interface Activity {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <PageCard>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.7)",
              fontStyle: "italic",
            }}
          >
            Loading...
          </Typography>
        </PageCard>
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <PageCard>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(100, 116, 139, 0.7)",
              fontStyle: "italic",
            }}
          >
            No recent activity
          </Typography>
        </PageCard>
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 3 }}>
      <PageCard>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Activity
        </Typography>
        <Box
          sx={{
            maxHeight: "300px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(107, 156, 216, 0.08)",
              borderRadius: "4px",
              margin: "4px 0",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(107, 156, 216, 0.24)",
              borderRadius: "4px",
              border: "2px solid transparent",
              backgroundClip: "padding-box",
              transition: "background 0.2s ease",
              "&:hover": {
                background: "rgba(107, 156, 216, 0.38)",
                backgroundClip: "padding-box",
              },
            },
          }}
        >
          {activities.map((activity, index) => (
            <ActivityItem
              key={index}
              icon={activity.icon}
              title={activity.title}
              description={activity.description}
              timestamp={activity.timestamp}
            />
          ))}
        </Box>
      </PageCard>
    </Box>
  );
};

