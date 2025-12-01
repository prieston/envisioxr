"use client";

import React from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import { PageCard } from "@klorad/ui";
import { useOrgId } from "@/app/hooks/useOrgId";
import { getUsageStats, UsageStats } from "@/app/utils/api";
import useSWR from "swr";
import { useRouter } from "next/navigation";

export const UsageSummary: React.FC = () => {
  const orgId = useOrgId();
  const router = useRouter();

  const {
    data: usageData,
    error,
    isLoading,
  } = useSWR<UsageStats>(
    orgId ? `/api/organizations/${orgId}/usage` : null,
    () => getUsageStats(orgId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const formatStorage = (gb: number): string => {
    if (gb < 0.01) {
      return `${(gb * 1024).toFixed(2)} MB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  const formatLimit = (limit: number | null, isStorage: boolean = false): string => {
    if (limit === null) {
      return "Unlimited";
    }
    return isStorage ? formatStorage(limit) : limit.toString();
  };

  const usageItems = usageData
    ? [
        {
          label: `Storage: ${formatStorage(usageData.usage.storageGb)} / ${formatLimit(usageData.limits.storageGb, true)}`,
        },
        {
          label: `Members: ${Math.floor(usageData.usage.members)} / ${formatLimit(usageData.limits.members)}`,
        },
        {
          label: `Projects: ${Math.floor(usageData.usage.projects)} / ${formatLimit(usageData.limits.projects)}`,
        },
      ]
    : [];

  return (
    <Box sx={{ mt: 3 }}>
      <PageCard>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Usage Summary
          </Typography>
          {orgId && (
            <Button
              onClick={() => router.push(`/org/${orgId}/settings/usage`)}
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
          )}
        </Box>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100px",
            }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : error || !usageData ? (
          <Typography variant="body2" color="text.secondary">
            Failed to load usage data
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {usageItems.map((item, index) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
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
        )}
      </PageCard>
    </Box>
  );
};

