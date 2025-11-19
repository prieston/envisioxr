"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  alpha,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  showToast,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useOrganization from "@/app/hooks/useOrganization";
import { useOrgId } from "@/app/hooks/useOrgId";
import { getPlans, Plan, createCheckoutSession } from "@/app/utils/api";
import useSWR from "swr";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import { CreateOrganizationModal } from "@/app/components/Organizations/CreateOrganizationModal";

interface Feature {
  id: string;
  label: string;
  category: string;
  getValue: (plan: Plan) => string | React.ReactNode;
  isIncluded: (plan: Plan) => boolean;
}

const ALL_FEATURES: Feature[] = [
  // Storage & Integrations
  {
    id: "storage",
    label: "Storage",
    category: "Storage & Integrations",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "TBT";
      return `${plan.includedStorageGb} GB`;
    },
    isIncluded: (plan) => plan.includedStorageGb > 0 || plan.code === "enterprise",
  },
  {
    id: "cesium_integrations",
    label: "Cesium integrations",
    category: "Storage & Integrations",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "Unlimited";
      return plan.includedCesiumIntegrations === null
        ? "Unlimited"
        : plan.includedCesiumIntegrations === 1
        ? "1"
        : String(plan.includedCesiumIntegrations);
    },
    isIncluded: (plan) =>
      plan.code === "enterprise" ||
      plan.code === "pro" ||
      (plan.includedCesiumIntegrations !== null && plan.includedCesiumIntegrations > 0),
  },
  {
    id: "cesium_upload_limit",
    label: "Cesium upload limit",
    category: "Storage & Integrations",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "Unlimited";
      return plan.cesiumUploadLimitGb === null
        ? "Unlimited"
        : `< ${plan.cesiumUploadLimitGb}GB`;
    },
    isIncluded: (plan) =>
      plan.code === "enterprise" ||
      plan.code === "pro" ||
      plan.cesiumUploadLimitGb !== null,
  },

  // Projects
  {
    id: "projects",
    label: "Projects",
    category: "Projects",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "Unlimited";
      return plan.includedProjects === null ? "Unlimited" : String(plan.includedProjects);
    },
    isIncluded: (plan) =>
      plan.code === "enterprise" ||
      plan.code === "pro" ||
      (plan.includedProjects !== null && plan.includedProjects > 0),
  },
  {
    id: "published_worlds",
    label: "Published worlds",
    category: "Projects",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "Unlimited";
      return plan.includedPublishedProjects === null
        ? "Unlimited"
        : `Up to ${plan.includedPublishedProjects}`;
    },
    isIncluded: (plan) =>
      plan.code === "enterprise" ||
      plan.code === "pro" ||
      (plan.includedPublishedProjects !== null && plan.includedPublishedProjects > 0),
  },
  {
    id: "private_shares",
    label: "Private shares",
    category: "Projects",
    getValue: (plan) => {
      if (plan.code === "enterprise") return "Unlimited";
      return plan.includedPrivateShares === null
        ? "Unlimited"
        : String(plan.includedPrivateShares);
    },
    isIncluded: (plan) =>
      plan.code === "enterprise" ||
      plan.code === "pro" ||
      (plan.includedPrivateShares !== null && plan.includedPrivateShares > 0),
  },

  // Users & RBAC
  {
    id: "members",
    label: "Members",
    category: "Users & RBAC",
    getValue: (plan) =>
      plan.includedSeats === 0
        ? "0 (Solo-only)"
        : plan.includedSeats >= 9999
        ? "Unlimited"
        : String(plan.includedSeats),
    isIncluded: (plan) => plan.includedSeats > 0 || plan.includedSeats >= 9999,
  },
  {
    id: "rbac",
    label: "RBAC (Role-based access control)",
    category: "Users & RBAC",
    getValue: (plan) => (plan.includedSeats > 0 ? "Full RBAC" : "No RBAC"),
    isIncluded: (plan) => plan.includedSeats > 0,
  },

  // Features
  {
    id: "full_engine",
    label: "Full engine",
    category: "Features",
    getValue: () => "",
    isIncluded: () => true, // All plans have this
  },
  {
    id: "full_cesium_viewer",
    label: "Full viewer",
    category: "Features",
    getValue: () => "",
    isIncluded: () => true, // All plans have this
  },
  {
    id: "branding",
    label: "Branding",
    category: "Features",
    getValue: () => "",
    isIncluded: (plan) => plan.code === "pro" || plan.code === "enterprise",
  },
  {
    id: "priority_support",
    label: "Priority support",
    category: "Features",
    getValue: () => "",
    isIncluded: (plan) => plan.code === "pro" || plan.code === "enterprise",
  },
  {
    id: "custom_workflows",
    label: "Custom workflow modules",
    category: "Features",
    getValue: () => "",
    isIncluded: (plan) => plan.code === "enterprise",
  },
  {
    id: "white_label",
    label: "White-label viewer",
    category: "Features",
    getValue: () => "",
    isIncluded: (plan) => plan.code === "enterprise",
  },
  {
    id: "reseller",
    label: "Reseller rights",
    category: "Features",
    getValue: () => "",
    isIncluded: (plan) => plan.code === "enterprise",
  },
];

const SettingsBillingPage = () => {
  const orgId = useOrgId();
  const {
    organization,
    loadingOrganization,
  } = useOrganization(orgId);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);

  const { data: plansData, error: plansError } = useSWR<{ plans: Plan[] }>(
    "/api/plans",
    getPlans
  );

  const plans = plansData?.plans || [];
  const currentPlanCode = organization?.planCode || "free";
  const currentPlan = plans.find((p) => p.code === currentPlanCode);

  const formatPrice = (cents: number | null) => {
    if (cents === null) return "Custom";
    if (cents === 0) return "Free";
    return `€${(cents / 100).toFixed(2)}`;
  };

  const handleUpgrade = async (planCode: string, billingInterval: "monthly" = "monthly") => {
    if (!orgId) return;
    if (planCode === "enterprise") {
      showToast("Please contact sales@klorad.com for Enterprise pricing", "info");
      return;
    }

    // If upgrading to Pro and current org is personal, open organization creation modal
    if (planCode === "pro" && organization?.isPersonal) {
      setCreateOrgModalOpen(true);
      return;
    }

    // For existing organization upgrades, go directly to checkout
    setLoadingCheckout(planCode);
    try {
      const { url } = await createCheckoutSession(orgId, planCode, billingInterval);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create checkout session",
        "error"
      );
      setLoadingCheckout(null);
    }
  };

  if (loadingOrganization || !plansData) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (plansError || plans.length === 0) {
    return (
      <Page>
        <PageHeader>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Billing & Plans
          </Typography>
        </PageHeader>
        <PageContent>
          <Typography color="error">
            Failed to load plans. Please try again later.
          </Typography>
        </PageContent>
      </Page>
    );
  }

  // Group features by category
  const featuresByCategory = ALL_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

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
        <PageHeader>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Billing & Plans
            </Typography>
            <PageDescription>
              Compare plans and choose the one that fits your needs
            </PageDescription>
          </Box>
        </PageHeader>

        <PageContent>
          {/* Current Plan Card */}
          {currentPlan && (
            <Card
              sx={{
                mb: 4,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.05),
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Current Plan: {currentPlan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentPlanCode === "free"
                        ? "You're on the Solo Workspace plan"
                        : currentPlanCode === "pro"
                        ? "Your Organisation Workspace subscription is active"
                        : "Enterprise plan with custom pricing"}
                    </Typography>
                  </Box>
                  {currentPlanCode !== "enterprise" && (
                    <Chip
                      label={currentPlanCode === "free" ? "Free Plan" : "Active"}
                      color={currentPlanCode === "free" ? "default" : "success"}
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Plan Comparison Table */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: "primary.main",
            }}
          >
            Compare Plans
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              mb: 4,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      backgroundColor: "background.paper",
                      minWidth: 250,
                    }}
                  >
                    Feature
                  </TableCell>
                  {plans.map((plan) => (
                    <TableCell
                      key={plan.code}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        position: "relative",
                        ...(plan.code === "pro" && {
                          backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.05),
                        }),
                      }}
                    >
                      <Box>
                        {plan.code === "pro" && (
                          <Chip
                            icon={<StarIcon />}
                            label="Popular"
                            color="primary"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, my: 1 }}>
                          {formatPrice(plan.monthlyPriceCents)}
                        </Typography>
                        {plan.monthlyPriceCents !== null && plan.monthlyPriceCents > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            per month
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(featuresByCategory).map(([category, features]) => (
                  <React.Fragment key={category}>
                    <TableRow>
                      <TableCell
                        colSpan={plans.length + 1}
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.05),
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          pt: 2,
                          pb: 1,
                        }}
                      >
                        {category}
                      </TableCell>
                    </TableRow>
                    {features.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell
                          sx={{
                            fontSize: "0.875rem",
                            position: "sticky",
                            left: 0,
                            zIndex: 5,
                            backgroundColor: "background.paper",
                          }}
                        >
                          {feature.label}
                        </TableCell>
                        {plans.map((plan) => {
                          const isIncluded = feature.isIncluded(plan);
                          const value = feature.getValue(plan);
                          return (
                            <TableCell
                              key={plan.code}
                              align="center"
                              sx={{
                                fontSize: "0.875rem",
                                ...(plan.code === "pro" && {
                                  backgroundColor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.02),
                                }),
                              }}
                            >
                              {isIncluded ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <CheckIcon
                                    sx={{
                                      color: "success.main",
                                      fontSize: "1.5rem",
                                    }}
                                  />
                                  {value && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "text.secondary",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {value}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <CloseIcon
                                  sx={{
                                    color: "text.disabled",
                                    fontSize: "1.5rem",
                                    opacity: 0.4,
                                  }}
                                />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Buttons */}
          <Grid container spacing={2}>
            {plans.map((plan) => {
              const isCurrentPlan = plan.code === currentPlanCode;
              const isEnterprise = plan.code === "enterprise";

              return (
                <Grid item xs={12} md={4} key={plan.code}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      ...(plan.code === "pro" && {
                        border: (theme) =>
                          `2px solid ${theme.palette.primary.main}`,
                      }),
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        {plan.code === "pro" && (
                          <Chip
                            icon={<StarIcon />}
                            label="Most Popular"
                            color="primary"
                            size="small"
                            sx={{ mb: 2 }}
                          />
                        )}
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {formatPrice(plan.monthlyPriceCents)}
                        </Typography>
                        {plan.monthlyPriceCents !== null && plan.monthlyPriceCents > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            per month
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      {isCurrentPlan ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          disabled
                          sx={{ textTransform: "none" }}
                        >
                          Current Plan
                        </Button>
                      ) : isEnterprise ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => handleUpgrade("enterprise", "monthly")}
                          sx={{ textTransform: "none" }}
                        >
                          Contact Sales
                        </Button>
                      ) : (
                        <Button
                          variant={plan.code === "pro" ? "contained" : "outlined"}
                          fullWidth
                          onClick={() => handleUpgrade(plan.code, "monthly")}
                          disabled={loadingCheckout === plan.code}
                          sx={{ textTransform: "none" }}
                        >
                          {loadingCheckout === plan.code ? (
                            <CircularProgress size={20} />
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </PageContent>
      </Page>

      {/* Create Organization Modal for upgrading from personal to pro */}
      {plansData && (
        <CreateOrganizationModal
          open={createOrgModalOpen}
          plans={plansData.plans}
          onClose={() => setCreateOrgModalOpen(false)}
        />
      )}
    </>
  );
};

export default SettingsBillingPage;
