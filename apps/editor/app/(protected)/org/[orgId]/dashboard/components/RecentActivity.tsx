"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { PageCard, ActivityItem } from "@klorad/ui";
import { useRouter } from "next/navigation";
import { useOrgId } from "@/app/hooks/useOrgId";

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
  const router = useRouter();
  const orgId = useOrgId();

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <PageCard>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Recent Activity
            </Typography>
          </Box>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Recent Activity
            </Typography>
          </Box>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Recent Activity
          </Typography>
          <Button
            onClick={() => router.push(orgId ? `/org/${orgId}/settings/activity` : "/settings/activity")}
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "#6B9CD8",
              minWidth: "auto",
              padding: "4px 8px",
              "&:hover": {
                backgroundColor: "rgba(107, 156, 216, 0.1)",
              },
            }}
          >
            View All
          </Button>
        </Box>
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

