"use client";

import React, { useState, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Divider,
  alpha,
  Menu,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { PageContainer } from "../../components/PageContainer";
import {
  PageHeader,
  PageDescription,
  PageContent,
  MetricCard,
  PageCard,
  textFieldStyles,
  SettingContainer,
  SettingLabel,
} from "@klorad/ui";
import {
  PeopleIcon,
  BusinessIcon,
  FolderIcon,
  StorageIcon,
  AddIcon,
  CloseIcon,
} from "@klorad/ui";
import MembersDialog from "./MembersDialog";
import { showToast } from "@klorad/ui";
import useSWR from "swr";
import { AdminHeader } from "../../components/AdminHeader";

interface AdminStats {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
    totalProjects: number;
    totalAssets: number;
    totalActivities: number;
    totalStorageGB: number;
  };
  organizations: {
    total: number;
    personal: number;
    team: number;
    byPlan: Array<{ planCode: string; count: number }>;
    all: Array<{
      id: string;
      name: string;
      slug: string;
      isPersonal: boolean;
      planCode: string;
      subscriptionStatus: string | null;
      memberCount: number;
      projectCount: number;
      assetCount: number;
      createdAt: Date;
    }>;
  };
  users: {
    total: number;
    all: Array<{
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      organizationCount: number;
      activityCount: number;
    }>;
  };
}

interface Plan {
  code: string;
  name: string;
}

const formatStorage = (gb: number): string => {
  if (gb < 0.001) return "0 MB";
  if (gb < 1) return `${(gb * 1024).toFixed(2)} MB`;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  return `${(gb / 1024).toFixed(2)} TB`;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error.error || `Failed to fetch: ${res.statusText}`);
  }
  return res.json();
};

export default function AdminDashboard() {
  const {
    data: statsData,
    error: statsError,
    mutate: mutateStats,
  } = useSWR<AdminStats>("/api/stats", fetcher);
  const { data: plansData } = useSWR<{ plans: Plan[] }>("/api/plans", fetcher);

  const [loading, setLoading] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [orgToUpgrade, setOrgToUpgrade] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [orgToUpdate, setOrgToUpdate] = useState<{
    id: string;
    name: string;
    planCode: string;
    subscriptionStatus: string | null;
  } | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{
    id: string;
    name: string;
    isPersonal: boolean;
  } | null>(null);

  // Create organization form state
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saving, setSaving] = useState(false);

  // License update form state
  const [selectedPlanCode, setSelectedPlanCode] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const plans = plansData?.plans || [];

  const handleCreateOrganization = useCallback(async () => {
    if (!orgName.trim() || !orgSlug.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
          slug: orgSlug.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create organization");
      }

      showToast("Organization created successfully!", "success");
      await mutateStats();
      setCreateOrgOpen(false);
      setOrgName("");
      setOrgSlug("");
    } catch (error) {
      console.error("Error creating organization:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to create organization",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }, [orgName, orgSlug, mutateStats]);

  const handleDeleteOrganization = useCallback(async () => {
    if (!orgToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete organization");
      }

      showToast("Organization deleted successfully!", "success");
      await mutateStats();
      setDeleteOrgOpen(false);
      setOrgToDelete(null);
    } catch (error) {
      console.error("Error deleting organization:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [orgToDelete, mutateStats]);

  const handleOpenDeleteDialog = useCallback(
    (org: { id: string; name: string }) => {
      setOrgToDelete(org);
      setDeleteOrgOpen(true);
      setMenuAnchor(null);
    },
    []
  );

  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement;
    orgId: string;
    orgName: string;
  } | null>(null);

  const handleMenuOpen = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      org: { id: string; name: string }
    ) => {
      setMenuAnchor({
        element: event.currentTarget,
        orgId: org.id,
        orgName: org.name,
      });
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleUpgradeWorkspace = useCallback(async () => {
    if (!orgToUpgrade) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${orgToUpgrade.id}/upgrade`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upgrade workspace");
      }

      showToast(
        "Personal workspace upgraded to organization successfully!",
        "success"
      );
      await mutateStats();
      setUpgradeDialogOpen(false);
      setOrgToUpgrade(null);
    } catch (error) {
      console.error("Error upgrading workspace:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to upgrade workspace",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [orgToUpgrade, mutateStats]);

  const handleOpenUpgradeDialog = useCallback(
    (org: { id: string; name: string }) => {
      setOrgToUpgrade(org);
      setUpgradeDialogOpen(true);
    },
    []
  );

  const handleUpdateLicense = useCallback(async () => {
    if (!orgToUpdate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${orgToUpdate.id}/license`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planCode: selectedPlanCode || undefined,
            subscriptionStatus: selectedStatus || null,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update license");
      }

      showToast("License updated successfully!", "success");
      await mutateStats();
      setLicenseDialogOpen(false);
      setOrgToUpdate(null);
      setSelectedPlanCode("");
      setSelectedStatus("");
    } catch (error) {
      console.error("Error updating license:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to update license",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [orgToUpdate, selectedPlanCode, selectedStatus, mutateStats]);

  const openLicenseDialog = useCallback(
    (org: {
      id: string;
      name: string;
      planCode: string;
      subscriptionStatus: string | null;
    }) => {
      setOrgToUpdate(org);
      setSelectedPlanCode(org.planCode);
      setSelectedStatus(org.subscriptionStatus || "");
      setLicenseDialogOpen(true);
    },
    []
  );

  if (statsError) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography color="error">
            {statsError instanceof Error
              ? statsError.message
              : "Failed to load statistics"}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  if (!statsData || !statsData.overview) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Check if API returned an error
  if ("error" in statsData) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography color="error">
            {typeof statsData.error === "string"
              ? statsData.error
              : "Failed to load statistics"}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <>
      <AdminHeader />
      <PageContainer>
        <PageHeader title="Admin Dashboard" />
        <PageDescription>
          Manage organizations, licenses, and view platform analytics
        </PageDescription>

        <PageContent maxWidth="full">
          {/* Overview Metrics */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Total Users"
                value={statsData.overview.totalUsers.toString()}
                icon={<PeopleIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Organizations"
                value={statsData.overview.totalOrganizations.toString()}
                icon={<BusinessIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Projects"
                value={statsData.overview.totalProjects.toString()}
                icon={<FolderIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Storage Used"
                value={formatStorage(statsData.overview.totalStorageGB)}
                icon={<StorageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
          </Grid>

          {/* Organizations Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <PageCard>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      Organizations ({statsData.organizations.all.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateOrgOpen(true)}
                      size="small"
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
                      Create Organization
                    </Button>
                  </Box>
                  <TableContainer
                    component={Box}
                    sx={{
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      maxHeight: 600,
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "transparent" }}>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Slug
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Type
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Plan
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Status
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Members
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Projects
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Assets
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Created
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statsData.organizations.all.map((org) => (
                          <TableRow
                            key={org.id}
                            sx={{
                              backgroundColor: "transparent",
                              "&:hover": { backgroundColor: "transparent" },
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {org.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                {org.slug}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {org.isPersonal ? (
                                <Chip
                                  label="Personal"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: alpha("#6B9CD8", 0.1),
                                    color: "#6B9CD8",
                                    border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Team"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: alpha("#6B9CD8", 0.1),
                                    color: "#6B9CD8",
                                    border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={org.planCode}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  backgroundColor:
                                    org.planCode === "free"
                                      ? alpha("#6B9CD8", 0.1)
                                      : alpha("#22c55e", 0.1),
                                  color:
                                    org.planCode === "free"
                                      ? "#6B9CD8"
                                      : "#22c55e",
                                  border: `1px solid ${
                                    org.planCode === "free"
                                      ? alpha("#6B9CD8", 0.3)
                                      : alpha("#22c55e", 0.3)
                                  }`,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {org.subscriptionStatus ? (
                                <Chip
                                  label={org.subscriptionStatus}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor:
                                      org.subscriptionStatus === "active"
                                        ? alpha("#22c55e", 0.1)
                                        : org.subscriptionStatus === "canceled"
                                          ? alpha("#ef4444", 0.1)
                                          : alpha("#f59e0b", 0.1),
                                    color:
                                      org.subscriptionStatus === "active"
                                        ? "#22c55e"
                                        : org.subscriptionStatus === "canceled"
                                          ? "#ef4444"
                                          : "#f59e0b",
                                    border: `1px solid ${
                                      org.subscriptionStatus === "active"
                                        ? alpha("#22c55e", 0.3)
                                        : org.subscriptionStatus === "canceled"
                                          ? alpha("#ef4444", 0.3)
                                          : alpha("#f59e0b", 0.3)
                                    }`,
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="N/A"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: alpha("#6B9CD8", 0.1),
                                    color: "#6B9CD8",
                                    border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {org.memberCount}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {org.projectCount}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {org.assetCount}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                {new Date(org.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  justifyContent: "flex-end",
                                  flexWrap: "wrap",
                                }}
                              >
                                {org.isPersonal && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                      handleOpenUpgradeDialog({
                                        id: org.id,
                                        name: org.name,
                                      })
                                    }
                                    sx={(theme) => ({
                                      textTransform: "none",
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
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
                                            : alpha(
                                                theme.palette.primary.main,
                                                0.05
                                              ),
                                        borderColor: alpha(
                                          theme.palette.primary.main,
                                          0.5
                                        ),
                                      },
                                    })}
                                  >
                                    Upgrade to Organization
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<PeopleIcon />}
                                  onClick={() => {
                                    setSelectedOrg({
                                      id: org.id,
                                      name: org.name,
                                      isPersonal: org.isPersonal,
                                    });
                                    setMembersDialogOpen(true);
                                  }}
                                  disabled={org.isPersonal}
                                  sx={(theme) => ({
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    borderColor: alpha(
                                      theme.palette.primary.main,
                                      0.3
                                    ),
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      borderColor: alpha(
                                        theme.palette.primary.main,
                                        0.5
                                      ),
                                      backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.05
                                      ),
                                    },
                                    "&.Mui-disabled": {
                                      borderColor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                      color: alpha(
                                        theme.palette.primary.main,
                                        0.3
                                      ),
                                    },
                                  })}
                                  title={
                                    org.isPersonal
                                      ? "Personal organizations cannot have multiple members"
                                      : "Manage members"
                                  }
                                >
                                  Members
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() =>
                                    openLicenseDialog({
                                      id: org.id,
                                      name: org.name,
                                      planCode: org.planCode,
                                      subscriptionStatus:
                                        org.subscriptionStatus,
                                    })
                                  }
                                  sx={(theme) => ({
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    fontWeight: 500,
                                    minWidth: 100,
                                    borderColor: alpha(
                                      theme.palette.primary.main,
                                      0.3
                                    ),
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      borderColor: alpha(
                                        theme.palette.primary.main,
                                        0.5
                                      ),
                                      backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.05
                                      ),
                                    },
                                  })}
                                >
                                  License
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={(e) =>
                                    handleMenuOpen(e, {
                                      id: org.id,
                                      name: org.name,
                                    })
                                  }
                                  sx={(theme) => ({
                                    color: theme.palette.text.secondary,
                                    padding: "4px",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 255, 255, 0.08)",
                                      color: theme.palette.text.primary,
                                    },
                                  })}
                                >
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </PageCard>
              </Box>
            </Grid>

            {/* Users Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <PageCard>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 600, fontSize: "1rem" }}
                  >
                    Users ({statsData.users.all.length})
                  </Typography>
                  <TableContainer
                    component={Box}
                    sx={{
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      maxHeight: 600,
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "transparent" }}>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Name
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Email
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Verified
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Organizations
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontWeight: 600,
                              backgroundColor: "transparent",
                            }}
                          >
                            Activities
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statsData.users.all.map((user) => (
                          <TableRow
                            key={user.id}
                            sx={{
                              backgroundColor: "transparent",
                              "&:hover": { backgroundColor: "transparent" },
                            }}
                          >
                            <TableCell>
                              {user.name ? (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: "0.75rem",
                                    color: "text.primary",
                                  }}
                                >
                                  {user.name}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: "0.75rem",
                                    color: "text.secondary",
                                  }}
                                >
                                  No name
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {user.email || "No email"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {user.emailVerified ? (
                                <Chip
                                  label="Yes"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: alpha("#22c55e", 0.1),
                                    color: "#22c55e",
                                    border: `1px solid ${alpha("#22c55e", 0.3)}`,
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="No"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: alpha("#6B9CD8", 0.1),
                                    color: "#6B9CD8",
                                    border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {user.organizationCount}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {user.activityCount}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </PageCard>
              </Box>
            </Grid>
          </Grid>
        </PageContent>
      </PageContainer>

      {/* Create Organization Dialog */}
      <Dialog
        open={createOrgOpen}
        onClose={() => setCreateOrgOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          "& .MuiDialog-paper": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        })}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            boxShadow: "none",
            backgroundImage: "none",
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
              boxShadow: "none",
            },
          }),
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A"
                : theme.palette.background.paper,
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Create Organization
            </Typography>
            <IconButton
              onClick={() => setCreateOrgOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <SettingContainer>
                <SettingLabel>Organization Name</SettingLabel>
                <TextField
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  fullWidth
                  required
                  sx={textFieldStyles}
                />
              </SettingContainer>
              <SettingContainer>
                <SettingLabel>Slug</SettingLabel>
                <TextField
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  fullWidth
                  required
                  helperText="Lowercase letters, numbers, hyphens, and underscores only"
                  sx={textFieldStyles}
                />
              </SettingContainer>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              p: 2,
            }}
          >
            <Button
              onClick={() => setCreateOrgOpen(false)}
              disabled={saving}
              variant="outlined"
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              variant="contained"
              disabled={saving || !orgName.trim() || !orgSlug.trim()}
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: alpha(theme.palette.primary.main, 0.3),
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                },
              })}
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog
        open={deleteOrgOpen}
        onClose={() => setDeleteOrgOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          "& .MuiDialog-paper": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        })}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            boxShadow: "none",
            backgroundImage: "none",
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
              boxShadow: "none",
            },
          }),
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A"
                : theme.palette.background.paper,
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Delete Organization
            </Typography>
            <IconButton
              onClick={() => setDeleteOrgOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", color: "text.secondary" }}
            >
              Are you sure you want to delete &quot;{orgToDelete?.name}&quot;?
              This action cannot be undone and will permanently delete all
              associated data, including projects, assets, members, and
              integrations.
            </Typography>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              p: 2,
            }}
          >
            <Button
              onClick={() => setDeleteOrgOpen(false)}
              disabled={loading}
              variant="outlined"
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteOrganization}
              variant="contained"
              disabled={loading}
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.error.main, 0.15),
                  borderColor: alpha(theme.palette.error.main, 0.5),
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                  color: alpha(theme.palette.error.main, 0.3),
                  borderColor: alpha(theme.palette.error.main, 0.1),
                },
              })}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Upgrade Workspace Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          "& .MuiDialog-paper": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        })}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            boxShadow: "none",
            backgroundImage: "none",
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
              boxShadow: "none",
            },
          }),
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A"
                : theme.palette.background.paper,
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Upgrade Personal Workspace to Organization
            </Typography>
            <IconButton
              onClick={() => setUpgradeDialogOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 2 }}
            >
              Are you sure you want to upgrade &quot;{orgToUpgrade?.name}&quot;
              from a personal workspace to a full organization?
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 1 }}
            >
              This will:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mb: 2 }}>
              <Typography
                component="li"
                variant="body2"
                sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
              >
                Enable multiple members to join the organization
              </Typography>
              <Typography
                component="li"
                variant="body2"
                sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
              >
                Allow organization invitations
              </Typography>
              <Typography
                component="li"
                variant="body2"
                sx={{ fontSize: "0.75rem", color: "text.secondary" }}
              >
                Preserve all existing projects, assets, and data
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.75rem", color: "text.secondary" }}
            >
              This action cannot be undone.
            </Typography>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              p: 2,
            }}
          >
            <Button
              onClick={() => setUpgradeDialogOpen(false)}
              disabled={loading}
              variant="outlined"
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpgradeWorkspace}
              variant="contained"
              disabled={loading}
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: alpha(theme.palette.primary.main, 0.3),
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                },
              })}
            >
              {loading ? "Upgrading..." : "Upgrade to Organization"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* License Management Dialog */}
      <Dialog
        open={licenseDialogOpen}
        onClose={() => setLicenseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={(theme) => ({
          "& .MuiDialog-paper": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        })}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            boxShadow: "none",
            backgroundImage: "none",
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
              boxShadow: "none",
            },
          }),
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A"
                : theme.palette.background.paper,
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              pb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
              Manage License - {orgToUpdate?.name}
            </Typography>
            <IconButton
              onClick={() => setLicenseDialogOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <SettingContainer>
                <SettingLabel>Plan</SettingLabel>
                <FormControl fullWidth>
                  <Select
                    value={selectedPlanCode}
                    onChange={(e) => setSelectedPlanCode(e.target.value)}
                    sx={textFieldStyles}
                  >
                    {plans.map((plan) => (
                      <MenuItem key={plan.code} value={plan.code}>
                        {plan.name} ({plan.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </SettingContainer>
              <SettingContainer>
                <SettingLabel>Subscription Status</SettingLabel>
                <FormControl fullWidth>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                    <MenuItem value="past_due">Past Due</MenuItem>
                    <MenuItem value="trialing">Trialing</MenuItem>
                    <MenuItem value="incomplete">Incomplete</MenuItem>
                    <MenuItem value="incomplete_expired">
                      Incomplete Expired
                    </MenuItem>
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                  </Select>
                </FormControl>
              </SettingContainer>
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              p: 2,
            }}
          >
            <Button
              onClick={() => setLicenseDialogOpen(false)}
              disabled={loading}
              variant="outlined"
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLicense}
              variant="contained"
              disabled={loading}
              sx={(theme) => ({
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                boxShadow: "none",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&.Mui-disabled": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  color: alpha(theme.palette.primary.main, 0.3),
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                },
              })}
            >
              {loading ? "Updating..." : "Update License"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Members Management Dialog */}
      {selectedOrg && (
        <MembersDialog
          open={membersDialogOpen}
          orgId={selectedOrg.id}
          orgName={selectedOrg.name}
          isPersonal={selectedOrg.isPersonal}
          onClose={() => {
            setMembersDialogOpen(false);
            setSelectedOrg(null);
          }}
          onUpdate={mutateStats}
        />
      )}

      {/* Three-Dot Menu for Organizations */}
      <Menu
        anchorEl={menuAnchor?.element || null}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#14171A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "none",
            borderRadius: "4px",
            minWidth: "120px",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              handleOpenDeleteDialog({
                id: menuAnchor.orgId,
                name: menuAnchor.orgName,
              });
            }
          }}
          sx={{
            fontSize: "0.75rem",
            color: "error.main",
            padding: "8px 16px",
            "&:hover": {
              backgroundColor: alpha("#ef4444", 0.1),
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
