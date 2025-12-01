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
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { PageContainer } from "../../components/PageContainer";
import {
  PageHeader,
  PageDescription,
  PageContent,
  MetricCard,
} from "@klorad/ui";
import {
  PeopleIcon,
  BusinessIcon,
  FolderIcon,
  StorageIcon,
  AddIcon,
  DeleteIcon,
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
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error.error || `Failed to fetch: ${res.statusText}`);
  }
  return res.json();
};

export default function AdminDashboard() {
  const { data: statsData, error: statsError, mutate: mutateStats } = useSWR<AdminStats>(
    "/api/stats",
    fetcher
  );
  const { data: plansData } = useSWR<{ plans: Plan[] }>("/api/plans", fetcher);

  const [loading, setLoading] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{ id: string; name: string } | null>(null);
  const [orgToUpgrade, setOrgToUpgrade] = useState<{ id: string; name: string } | null>(null);
  const [orgToUpdate, setOrgToUpdate] = useState<{
    id: string;
    name: string;
    planCode: string;
    subscriptionStatus: string | null;
  } | null>(null);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<{ id: string; name: string; isPersonal: boolean } | null>(null);

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
        error instanceof Error ? error.message : "Failed to create organization",
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
        error instanceof Error ? error.message : "Failed to delete organization",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [orgToDelete, mutateStats]);

  const handleOpenDeleteDialog = useCallback((org: { id: string; name: string }) => {
    setOrgToDelete(org);
    setDeleteOrgOpen(true);
  }, []);

  const handleUpgradeWorkspace = useCallback(async () => {
    if (!orgToUpgrade) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgToUpgrade.id}/upgrade`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upgrade workspace");
      }

      showToast("Personal workspace upgraded to organization successfully!", "success");
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

  const handleOpenUpgradeDialog = useCallback((org: { id: string; name: string }) => {
    setOrgToUpgrade(org);
    setUpgradeDialogOpen(true);
  }, []);

  const handleUpdateLicense = useCallback(async () => {
    if (!orgToUpdate) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgToUpdate.id}/license`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: selectedPlanCode || undefined,
          subscriptionStatus: selectedStatus || null,
        }),
      });

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

  const openLicenseDialog = useCallback((org: {
    id: string;
    name: string;
    planCode: string;
    subscriptionStatus: string | null;
  }) => {
    setOrgToUpdate(org);
    setSelectedPlanCode(org.planCode);
    setSelectedStatus(org.subscriptionStatus || "");
    setLicenseDialogOpen(true);
  }, []);

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
            {statsError instanceof Error ? statsError.message : "Failed to load statistics"}
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
  if ('error' in statsData) {
    return (
      <PageContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography color="error">
            {typeof statsData.error === 'string' ? statsData.error : "Failed to load statistics"}
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
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">
                      Organizations ({statsData.organizations.all.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setCreateOrgOpen(true)}
                      size="small"
                      sx={{ textTransform: "none" }}
                    >
                      Create Organization
                    </Button>
                  </Box>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Slug</TableCell>
                          <TableCell align="center">Type</TableCell>
                          <TableCell align="center">Plan</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="right">Members</TableCell>
                          <TableCell align="right">Projects</TableCell>
                          <TableCell align="right">Assets</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statsData.organizations.all.map((org) => (
                          <TableRow key={org.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {org.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {org.slug}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {org.isPersonal ? (
                                <Chip
                                  label="Personal"
                                  size="small"
                                  color="default"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              ) : (
                                <Chip
                                  label="Team"
                                  size="small"
                                  color="primary"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={org.planCode}
                                size="small"
                                color={org.planCode === "free" ? "default" : "success"}
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {org.subscriptionStatus ? (
                                <Chip
                                  label={org.subscriptionStatus}
                                  size="small"
                                  color={
                                    org.subscriptionStatus === "active"
                                      ? "success"
                                      : org.subscriptionStatus === "canceled"
                                      ? "error"
                                      : "warning"
                                  }
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              ) : (
                                <Chip
                                  label="N/A"
                                  size="small"
                                  color="default"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">{org.memberCount}</TableCell>
                            <TableCell align="right">{org.projectCount}</TableCell>
                            <TableCell align="right">{org.assetCount}</TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(org.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
                                {org.isPersonal && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      handleOpenUpgradeDialog({ id: org.id, name: org.name })
                                    }
                                    sx={{ textTransform: "none" }}
                                  >
                                    Upgrade to Organization
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<PeopleIcon />}
                                  onClick={() => {
                                    setSelectedOrg({ id: org.id, name: org.name, isPersonal: org.isPersonal });
                                    setMembersDialogOpen(true);
                                  }}
                                  disabled={org.isPersonal}
                                  sx={{ textTransform: "none" }}
                                  title={org.isPersonal ? "Personal organizations cannot have multiple members" : "Manage members"}
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
                                      subscriptionStatus: org.subscriptionStatus,
                                    })
                                  }
                                  sx={{ textTransform: "none", minWidth: 100 }}
                                >
                                  License
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() =>
                                    handleOpenDeleteDialog({ id: org.id, name: org.name })
                                  }
                                  sx={{ textTransform: "none" }}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Users Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Users ({statsData.users.all.length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell align="center">Verified</TableCell>
                          <TableCell align="right">Organizations</TableCell>
                          <TableCell align="right">Activities</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statsData.users.all.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              {user.name || (
                                <Typography variant="body2" color="text.secondary">
                                  No name
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {user.email || "No email"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {user.emailVerified ? (
                                <Chip
                                  label="Yes"
                                  size="small"
                                  color="success"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              ) : (
                                <Chip
                                  label="No"
                                  size="small"
                                  color="default"
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">{user.organizationCount}</TableCell>
                            <TableCell align="right">{user.activityCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </PageContent>
      </PageContainer>

      {/* Create Organization Dialog */}
      <Dialog open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Slug"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              fullWidth
              required
              helperText="Lowercase letters, numbers, hyphens, and underscores only"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOrgOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrganization}
            variant="contained"
            disabled={saving || !orgName.trim() || !orgSlug.trim()}
            sx={{ textTransform: "none" }}
          >
            {saving ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteOrgOpen} onClose={() => setDeleteOrgOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{orgToDelete?.name}&quot;? This action
            cannot be undone and will permanently delete all associated data,
            including projects, assets, members, and integrations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOrgOpen(false)} disabled={loading} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteOrganization}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Workspace Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upgrade Personal Workspace to Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to upgrade &quot;{orgToUpgrade?.name}&quot; from a personal workspace to a full organization?
            <br />
            <br />
            This will:
            <ul>
              <li>Enable multiple members to join the organization</li>
              <li>Allow organization invitations</li>
              <li>Preserve all existing projects, assets, and data</li>
            </ul>
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)} disabled={loading} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpgradeWorkspace}
            color="success"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Upgrading..." : "Upgrade to Organization"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* License Management Dialog */}
      <Dialog open={licenseDialogOpen} onClose={() => setLicenseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage License - {orgToUpdate?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Plan</InputLabel>
              <Select
                value={selectedPlanCode}
                onChange={(e) => setSelectedPlanCode(e.target.value)}
                label="Plan"
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.code} value={plan.code}>
                    {plan.name} ({plan.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Subscription Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Subscription Status"
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
                <MenuItem value="past_due">Past Due</MenuItem>
                <MenuItem value="trialing">Trialing</MenuItem>
                <MenuItem value="incomplete">Incomplete</MenuItem>
                <MenuItem value="incomplete_expired">Incomplete Expired</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLicenseDialogOpen(false)} disabled={loading} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateLicense}
            variant="contained"
            disabled={loading}
            sx={{ textTransform: "none" }}
          >
            {loading ? "Updating..." : "Update License"}
          </Button>
        </DialogActions>
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
    </>
  );
}

