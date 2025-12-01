"use client";

import React from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  alpha,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import { useOrgId } from "@/app/hooks/useOrgId";
import { getUsageStats, UsageStats } from "@/app/utils/api";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { CheckIcon, WarningIcon } from "@klorad/ui";

interface UsageMetricProps {
  label: string;
  used: number;
  limit: number | null;
  unit?: string;
  formatValue?: (value: number) => string;
}

const UsageMetric: React.FC<UsageMetricProps> = ({
  label,
  used,
  limit,
  unit = "",
  formatValue = (v) => v.toFixed(2),
}) => {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isOverLimit = !isUnlimited && used > limit;

  const displayValue = (value: number) => {
    if ((unit === "GB" || unit === "GiB") && value < 0.01) {
      return `${(value * 1024).toFixed(2)} MB`;
    }
    return `${formatValue(value)} ${unit}`.trim();
  };

  return (
    <PageCard>
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {isUnlimited ? (
            <Chip
              icon={
                <CheckIcon
                  sx={{
                    color: (theme) => theme.palette.primary.main,
                  }}
                />
              }
              label="Unlimited"
              size="small"
              sx={(theme) => ({
                height: 20,
                fontSize: "0.688rem",
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: theme.palette.primary.main,
                },
              })}
            />
          ) : isOverLimit ? (
            <Chip
              icon={
                <WarningIcon
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  }}
                />
              }
              label="Over Limit"
              size="small"
              sx={(theme) => ({
                height: 20,
                fontSize: "0.688rem",
                backgroundColor: alpha(
                  theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  0.15
                ),
                color: theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                border: `1px solid ${alpha(
                  theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  0.3
                )}`,
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                },
              })}
            />
          ) : isNearLimit ? (
            <Chip
              icon={
                <WarningIcon
                  sx={{
                    color: (theme) =>
                      theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  }}
                />
              }
              label="Near Limit"
              size="small"
              sx={(theme) => ({
                height: 20,
                fontSize: "0.688rem",
                backgroundColor: alpha(
                  theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  0.15
                ),
                color: theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                border: `1px solid ${alpha(
                  theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                  0.3
                )}`,
                fontWeight: 500,
                "& .MuiChip-icon": {
                  color: theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                },
              })}
            />
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            mb: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {displayValue(used)}
          </Typography>
          {!isUnlimited && (
            <>
              <Typography variant="body2" color="text.secondary">
                /
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayValue(limit)}
              </Typography>
            </>
          )}
        </Box>
      </Box>
      {!isUnlimited && (
        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          sx={(theme) => ({
            height: 8,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            "& .MuiLinearProgress-bar": {
              backgroundColor: isOverLimit
                ? theme.palette.mode === "dark"
                  ? "#ff5656"
                  : "#ef4444"
                : isNearLimit
                  ? theme.palette.mode === "dark"
                    ? "#ff5656"
                    : "#ef4444"
                  : theme.palette.primary.main,
            },
          })}
        />
      )}
      {isUnlimited && (
        <Box
          sx={(theme) => ({
            height: 8,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        />
      )}
    </PageCard>
  );
};

const SettingsUsagePage = () => {
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
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  if (isLoading) {
    return (
      <>
        <AnimatedBackground>
          <GlowingContainer>
            <GlowingSpan index={1} />
            <GlowingSpan index={2} />
            <GlowingSpan index={3} />
          </GlowingContainer>
        </AnimatedBackground>
        <Page>
          <PageContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          </PageContent>
        </Page>
      </>
    );
  }

  if (error || !usageData) {
    return (
      <>
        <AnimatedBackground>
          <GlowingContainer>
            <GlowingSpan index={1} />
            <GlowingSpan index={2} />
            <GlowingSpan index={3} />
          </GlowingContainer>
        </AnimatedBackground>
        <Page>
          <PageHeader title="Usage" />
          <PageContent>
            <Typography color="error">
              Failed to load usage statistics. Please try again later.
            </Typography>
          </PageContent>
        </Page>
      </>
    );
  }

  const { usage, limits, plan } = usageData;

  return (
    <>
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
      </AnimatedBackground>

      <Page>
        <PageHeader title="Usage" />
        <PageDescription>
          Monitor your organization&apos;s usage against plan limits
        </PageDescription>

        <PageContent>
          {/* Current Plan Info */}
          <Box sx={{ mb: 3 }}>
            <PageCard>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Current Plan: {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.code === "free"
                    ? "Solo Workspace"
                    : plan.code === "pro"
                      ? "Organisation Workspace"
                      : "Enterprise"}
                </Typography>
              </Box>
              <Chip
                label={plan.code === "free" ? "Free Plan" : "Active"}
                size="small"
                sx={(theme) => ({
                  backgroundColor:
                    plan.code === "free"
                      ? alpha(theme.palette.text.secondary, 0.15)
                      : alpha(theme.palette.primary.main, 0.15),
                  color:
                    plan.code === "free"
                      ? theme.palette.text.secondary
                      : theme.palette.primary.main,
                  border: `1px solid ${
                    plan.code === "free"
                      ? alpha(theme.palette.text.secondary, 0.3)
                      : alpha(theme.palette.primary.main, 0.3)
                  }`,
                  fontWeight: 500,
                  fontSize: "0.688rem",
                  height: 20,
                })}
              />
            </Box>
            </PageCard>
          </Box>

          {/* Usage Metrics */}
          <Grid container spacing={3} sx={{ mb: 3, mt: 0 }}>
            {/* Storage */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Storage"
                used={usage.storageGb}
                limit={limits.storageGb}
                unit="GB"
              />
            </Grid>

            {/* Members */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Members"
                used={usage.members}
                limit={limits.members}
                formatValue={(v) => Math.floor(v).toString()}
              />
            </Grid>

            {/* Projects */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Projects"
                used={usage.projects}
                limit={limits.projects}
                formatValue={(v) => Math.floor(v).toString()}
              />
            </Grid>

            {/* Published Projects */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Published Worlds"
                used={usage.publishedProjects}
                limit={limits.publishedProjects}
                formatValue={(v) => Math.floor(v).toString()}
              />
            </Grid>

            {/* Private Shares */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Private Shares"
                used={usage.privateShares}
                limit={limits.privateShares}
                formatValue={(v) => Math.floor(v).toString()}
              />
            </Grid>

            {/* Cesium Integrations */}
            <Grid item xs={12} md={6}>
              <UsageMetric
                label="Cesium Integrations"
                used={usage.cesiumIntegrations}
                limit={limits.cesiumIntegrations}
                formatValue={(v) => Math.floor(v).toString()}
              />
            </Grid>

            {/* Cesium Upload Limit */}
            {limits.cesiumUploadGib !== null && (
              <Grid item xs={12} md={6}>
                <UsageMetric
                  label="Cesium Upload Limit"
                  used={usage.cesiumUploadGib}
                  limit={limits.cesiumUploadGib}
                  unit="GiB"
                />
              </Grid>
            )}
          </Grid>

          {/* Upgrade Prompt */}
          {plan.code === "free" && (
            <Box sx={{ mt: 4 }}>
              <PageCard>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Need More?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upgrade to Organisation Workspace for unlimited projects,
                    members, and advanced features.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/org/${orgId}/billing`)}
                  sx={(theme) => ({
                    borderRadius: `${theme.shape.borderRadius}px`,
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "#161B20"
                        : theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    padding: "6px 16px",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "#1a1f26"
                          : alpha(theme.palette.primary.main, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                    },
                  })}
                >
                  Upgrade
                </Button>
              </Box>
              </PageCard>
            </Box>
          )}
        </PageContent>
      </Page>
    </>
  );
};

export default SettingsUsagePage;
