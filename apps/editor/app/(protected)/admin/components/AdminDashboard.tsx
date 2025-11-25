"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  MetricCard,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import FolderIcon from "@mui/icons-material/Folder";
import StorageIcon from "@mui/icons-material/Storage";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ActivityIcon from "@mui/icons-material/Timeline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SessionIcon from "@mui/icons-material/VpnKey";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { createOrganization, deleteOrganization } from "@/app/utils/api";
import { CreateOrganizationDrawer } from "@/app/components/Organizations/CreateOrganizationDrawer";
import { showToast } from "@klorad/ui";
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";

interface AdminStats {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
    totalProjects: number;
    totalAssets: number;
    totalSubscriptions: number;
    totalActivities: number;
    totalAccounts: number;
    totalSessions: number;
    totalVerificationTokens: number;
    totalStorageBytes: number;
    totalStorageGB: number;
  };
  users: {
    total: number;
    verified: number;
    withSubscriptions: number;
    withPassword: number;
    withPasswordReset: number;
    byProvider: Array<{ provider: string; count: number }>;
    recent: number;
    all: Array<{
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      image: string | null;
      activityCount: number;
      organizationCount: number;
      accountCount: number;
      sessionCount: number;
    }>;
    topByActivity: Array<{
      id: string;
      name: string | null;
      email: string | null;
      activityCount: number;
    }>;
    topByOrganizations: Array<{
      id: string;
      name: string | null;
      email: string | null;
      organizationCount: number;
    }>;
  };
  accounts: {
    total: number;
    byType: Array<{ type: string; count: number }>;
  };
  sessions: {
    total: number;
    active: number;
    expired: number;
  };
  organizations: {
    total: number;
    personal: number;
    team: number;
    avgMembersPerOrg: number;
    membersByRole: Array<{ role: string; count: number }>;
    topByProjects: Array<{
      id: string;
      name: string;
      slug: string;
      projectCount: number;
    }>;
    topByAssets: Array<{
      id: string;
      name: string;
      slug: string;
      assetCount: number;
    }>;
    all: Array<{
      id: string;
      name: string;
      slug: string;
      isPersonal: boolean;
      createdAt: Date;
      memberCount: number;
      projectCount: number;
      assetCount: number;
    }>;
  };
  projects: {
    total: number;
    published: number;
    public: number;
    withThumbnail: number;
    withPublishedUrl: number;
    recent: number;
    byEngine: Array<{ engine: string; count: number }>;
  };
  assets: {
    total: number;
    withProjects: number;
    withThumbnail: number;
    withMetadata: number;
    cesiumIonAssets: number;
    cesiumIonAssetsWithApiKey: number;
    byType: Array<{ type: string; count: number }>;
    byFileType: Array<{ fileType: string; count: number }>;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    byStatus: Array<{ status: string; count: number }>;
    byPlan: Array<{ planId: string; count: number }>;
  };
  activities: {
    total: number;
    recent: number;
    withMetadata: number;
    withMessage: number;
    projectLevel: number;
    orgLevel: number;
    byType: Array<{ entityType: string; count: number }>;
    byAction: Array<{ action: string; count: number }>;
    byDay: Record<string, number>;
  };
  verificationTokens: {
    total: number;
  };
}

const formatStorage = (gb: number): string => {
  if (gb < 0.001) return "0 MB";
  if (gb < 1) return `${(gb * 1024).toFixed(2)} MB`;
  if (gb < 1024) return `${gb.toFixed(2)} GB`;
  return `${(gb / 1024).toFixed(2)} TB`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create organization drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete organization dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateOrganization = useCallback(() => {
    setDrawerOpen(true);
    setOrgName("");
    setOrgSlug("");
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setOrgName("");
    setOrgSlug("");
  }, []);

  const handleSaveOrganization = useCallback(async () => {
    if (!orgName.trim() || !orgSlug.trim()) return;

    setSaving(true);
    try {
      const response = await createOrganization({
        name: orgName.trim(),
        slug: orgSlug.trim(),
      });

      showToast("Organization created successfully!", "success");

      // Refresh stats
      await fetchStats();

      // Navigate to the new organization's dashboard
      router.push(`/org/${response.organization.id}/dashboard`);

      handleCloseDrawer();
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
  }, [orgName, orgSlug, router, handleCloseDrawer, fetchStats]);

  const handleOpenDeleteDialog = useCallback((org: { id: string; name: string }) => {
    setOrgToDelete(org);
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
  }, []);

  const handleDeleteOrganization = useCallback(async () => {
    if (!orgToDelete) return;

    setDeleting(true);
    try {
      await deleteOrganization(orgToDelete.id);
      showToast("Organization deleted successfully!", "success");
      await fetchStats();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting organization:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }, [orgToDelete, fetchStats, handleCloseDeleteDialog]);

  if (loading) {
    return (
      <Page>
        <PageContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </PageContent>
      </Page>
    );
  }

  if (error || !stats) {
    return (
      <Page>
        <PageContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <Typography color="error">
              {error || "Failed to load statistics"}
            </Typography>
          </Box>
        </PageContent>
      </Page>
    );
  }

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
        <PageHeader title="Admin Dashboard" />
        <PageDescription>
          Comprehensive platform statistics and analytics
        </PageDescription>

        <PageContent maxWidth="6xl">
          {/* Overview Metrics */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Total Users"
                value={stats.overview.totalUsers.toString()}
                icon={<PeopleIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Organizations"
                value={stats.overview.totalOrganizations.toString()}
                icon={<BusinessIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Projects"
                value={stats.overview.totalProjects.toString()}
                icon={<FolderIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Assets"
                value={stats.overview.totalAssets.toString()}
                icon={<ThreeDRotationIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Subscriptions"
                value={stats.overview.totalSubscriptions.toString()}
                icon={<CreditCardIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Activities"
                value={stats.overview.totalActivities.toString()}
                icon={<ActivityIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Storage Used"
                value={formatStorage(stats.overview.totalStorageGB)}
                icon={<StorageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Active Sessions"
                value={stats.sessions.active.toString()}
                icon={<SessionIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <MetricCard
                label="Verification Tokens"
                value={stats.overview.totalVerificationTokens.toString()}
                icon={<AccountCircleIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
          </Grid>

          {/* Detailed Statistics */}
          <Grid container spacing={3}>
            {/* Users Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Verified Emails
                      </Typography>
                      <Typography variant="h6">
                        {stats.users.verified} / {stats.users.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Subscriptions
                      </Typography>
                      <Typography variant="h6">
                        {stats.users.withSubscriptions}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Password
                      </Typography>
                      <Typography variant="h6">
                        {stats.users.withPassword}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Password Reset Active
                      </Typography>
                      <Typography variant="h6">
                        {stats.users.withPasswordReset}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        New (7 days)
                      </Typography>
                      <Typography variant="h6">{stats.users.recent}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Users by Provider
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Provider</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.users.byProvider.map((item) => (
                            <TableRow key={item.provider}>
                              <TableCell>{item.provider}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Top Users by Activity
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell align="right">Activities</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.users.topByActivity.slice(0, 5).map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                {user.name || user.email || "Unknown"}
                              </TableCell>
                              <TableCell align="right">
                                {user.activityCount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* All Users Section */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    All Users ({stats.users.all.length})
                  </Typography>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell align="center">Verified</TableCell>
                          <TableCell align="right">Activities</TableCell>
                          <TableCell align="right">Organizations</TableCell>
                          <TableCell align="right">Accounts</TableCell>
                          <TableCell align="right">Sessions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.users.all.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              {user.name || (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
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
                            <TableCell align="right">
                              {user.activityCount}
                            </TableCell>
                            <TableCell align="right">
                              {user.organizationCount}
                            </TableCell>
                            <TableCell align="right">
                              {user.accountCount}
                            </TableCell>
                            <TableCell align="right">
                              {user.sessionCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Accounts Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Accounts
                      </Typography>
                      <Typography variant="h6">
                        {stats.accounts.total}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Accounts by Type
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.accounts.byType.map((item) => (
                            <TableRow key={item.type}>
                              <TableCell>{item.type}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Sessions Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Session Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Sessions
                      </Typography>
                      <Typography variant="h6">
                        {stats.sessions.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Active Sessions
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {stats.sessions.active}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expired Sessions
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {stats.sessions.expired}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Organizations Section */}
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
                      All Organizations ({stats.organizations.all.length})
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateOrganization}
                      size="small"
                      sx={{
                        textTransform: "none",
                      }}
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
                          <TableCell align="right">Members</TableCell>
                          <TableCell align="right">Projects</TableCell>
                          <TableCell align="right">Assets</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.organizations.all.map((org) => (
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
                            <TableCell align="right">
                              {org.memberCount}
                            </TableCell>
                            <TableCell align="right">
                              {org.projectCount}
                            </TableCell>
                            <TableCell align="right">
                              {org.assetCount}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(org.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() =>
                                  handleOpenDeleteDialog({
                                    id: org.id,
                                    name: org.name,
                                  })
                                }
                                sx={{ textTransform: "none" }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Organizations Statistics Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Organization Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Personal Orgs
                      </Typography>
                      <Typography variant="h6">
                        {stats.organizations.personal}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Team Orgs
                      </Typography>
                      <Typography variant="h6">
                        {stats.organizations.team}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Members/Org
                      </Typography>
                      <Typography variant="h6">
                        {stats.organizations.avgMembersPerOrg.toFixed(1)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Members by Role
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {stats.organizations.membersByRole.map((item) => (
                        <Chip
                          key={item.role}
                          label={`${item.role}: ${item.count}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Top Organizations by Projects
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Organization</TableCell>
                            <TableCell align="right">Projects</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.organizations.topByProjects
                            .slice(0, 5)
                            .map((org) => (
                              <TableRow key={org.id}>
                                <TableCell>{org.name}</TableCell>
                                <TableCell align="right">
                                  {org.projectCount}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Projects Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Published
                      </Typography>
                      <Typography variant="h6">
                        {stats.projects.published}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Public
                      </Typography>
                      <Typography variant="h6">
                        {stats.projects.public}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        New (7 days)
                      </Typography>
                      <Typography variant="h6">
                        {stats.projects.recent}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Thumbnail
                      </Typography>
                      <Typography variant="h6">
                        {stats.projects.withThumbnail}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Published URL
                      </Typography>
                      <Typography variant="h6">
                        {stats.projects.withPublishedUrl}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Projects by Engine
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {stats.projects.byEngine.map((item) => (
                        <Chip
                          key={item.engine}
                          label={`${item.engine}: ${item.count}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Assets Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Asset Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Linked to Projects
                      </Typography>
                      <Typography variant="h6">
                        {stats.assets.withProjects}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Thumbnail
                      </Typography>
                      <Typography variant="h6">
                        {stats.assets.withThumbnail}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Metadata
                      </Typography>
                      <Typography variant="h6">
                        {stats.assets.withMetadata}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cesium Ion Assets
                      </Typography>
                      <Typography variant="h6">
                        {stats.assets.cesiumIonAssets}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Cesium Ion w/ API Key
                      </Typography>
                      <Typography variant="h6">
                        {stats.assets.cesiumIonAssetsWithApiKey}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Assets by Type
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                    >
                      {stats.assets.byType.map((item) => (
                        <Chip
                          key={item.type}
                          label={`${item.type}: ${item.count}`}
                          size="small"
                        />
                      ))}
                    </Box>

                    <Typography variant="subtitle2" gutterBottom>
                      Top File Types
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>File Type</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.assets.byFileType.slice(0, 5).map((item) => (
                            <TableRow key={item.fileType}>
                              <TableCell>{item.fileType}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Subscriptions Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Subscription Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Active
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {stats.subscriptions.active}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Expired
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {stats.subscriptions.expired}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Subscriptions by Status
                    </Typography>
                    {stats.subscriptions.byStatus.map((item) => (
                      <Box
                        key={item.status}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">{item.status}</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {item.count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Subscriptions by Plan
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Plan ID</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.subscriptions.byPlan.map((item) => (
                            <TableRow key={item.planId}>
                              <TableCell>{item.planId}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Activities Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Activity Statistics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last 24 Hours
                      </Typography>
                      <Typography variant="h6">
                        {stats.activities.recent}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Metadata
                      </Typography>
                      <Typography variant="h6">
                        {stats.activities.withMetadata}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        With Message
                      </Typography>
                      <Typography variant="h6">
                        {stats.activities.withMessage}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Project Level
                      </Typography>
                      <Typography variant="h6">
                        {stats.activities.projectLevel}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Org Level
                      </Typography>
                      <Typography variant="h6">
                        {stats.activities.orgLevel}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Activities by Type
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Entity Type</TableCell>
                            <TableCell align="right">Count</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stats.activities.byType.map((item) => (
                            <TableRow key={item.entityType}>
                              <TableCell>{item.entityType}</TableCell>
                              <TableCell align="right">{item.count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Activities by Action
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {stats.activities.byAction.map((item) => (
                        <Chip
                          key={item.action}
                          label={`${item.action}: ${item.count}`}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Verification Tokens Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Verification Tokens
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Tokens
                      </Typography>
                      <Typography variant="h6">
                        {stats.verificationTokens.total}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </PageContent>
      </Page>

      {/* Create Organization Drawer */}
      <CreateOrganizationDrawer
        open={drawerOpen}
        name={orgName}
        slug={orgSlug}
        saving={saving}
        onClose={handleCloseDrawer}
        onNameChange={setOrgName}
        onSlugChange={setOrgSlug}
        onSave={handleSaveOrganization}
      />

      {/* Delete Organization Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{orgToDelete?.name}&quot;? This action
            cannot be undone and will permanently delete all associated data,
            including projects, assets, members, and integrations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteOrganization}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
