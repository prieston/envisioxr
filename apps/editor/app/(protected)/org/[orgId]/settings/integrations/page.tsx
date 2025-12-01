"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  alpha,
  IconButton,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  showToast,
  CloseIcon,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import {
  getCesiumIntegrations,
  createCesiumIntegration,
  deleteCesiumIntegration,
  syncCesiumIntegration,
  CesiumIonIntegration,
  SyncResult,
} from "@/app/utils/api";
import useOrganization from "@/app/hooks/useOrganization";
import { useOrgId } from "@/app/hooks/useOrgId";
import useSWR from "swr";
import {
  AddIcon,
  SyncIcon,
  CheckCircleIcon,
  ErrorIcon,
  MoreVertIcon,
} from "@klorad/ui";
import { AddIntegrationDrawer } from "./components/AddIntegrationDrawer";

const IntegrationsPage = () => {
  const orgId = useOrgId();
  const {
    organization,
    loadingOrganization,
  } = useOrganization(orgId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<CesiumIonIntegration | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIntegrationId, setMenuIntegrationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    readToken: "",
    uploadToken: "",
  });
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [readTokenError, setReadTokenError] = useState<string | null>(null);
  const [uploadTokenError, setUploadTokenError] = useState<string | null>(null);

  // Fetch integrations
  const { data, error, mutate } = useSWR<{
    integrations: CesiumIonIntegration[];
  }>(
    orgId ? `/api/organizations/${orgId}/cesium-integrations` : null,
    () => getCesiumIntegrations(orgId!)
  );

  const integrations = data?.integrations || [];
  const loading = loadingOrganization || !data;
  const canEdit =
    organization?.userRole === "owner" || organization?.userRole === "admin";

  const handleOpenDrawer = () => {
    setFormData({
      label: "",
      readToken: "",
      uploadToken: "",
    });
    setReadTokenError(null);
    setUploadTokenError(null);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setFormData({
      label: "",
      readToken: "",
      uploadToken: "",
    });
    setReadTokenError(null);
    setUploadTokenError(null);
  };

  const handleOpenDeleteDialog = (integration: CesiumIonIntegration) => {
    setSelectedIntegration(integration);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedIntegration(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, integrationId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuIntegrationId(integrationId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuIntegrationId(null);
  };

  const handleRemoveClick = () => {
    if (menuIntegrationId) {
      const integration = integrations.find((i) => i.id === menuIntegrationId);
      if (integration) {
        handleOpenDeleteDialog(integration);
      }
    }
    handleMenuClose();
  };

  const handleCreateIntegration = async () => {
    if (!orgId) return;

    // Reset errors
    setReadTokenError(null);
    setUploadTokenError(null);

    if (!formData.label.trim()) {
      showToast("Integration label is required", "error");
      return;
    }

    if (!formData.readToken.trim()) {
      showToast("Read-only token is required", "error");
      return;
    }

    if (!formData.uploadToken.trim()) {
      showToast("Upload token is required", "error");
      return;
    }

    setSaving(true);
    try {
      await createCesiumIntegration(orgId, {
        label: formData.label.trim(),
        readToken: formData.readToken.trim(),
        uploadToken: formData.uploadToken.trim(),
      });

      await mutate();
      showToast("Integration created successfully", "success");
      // Close drawer after a brief delay to ensure React has finished processing
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          handleCloseDrawer();
        }, 0);
      });
    } catch (error: unknown) {
      // Handle ApiError from apiRequest
      let errorMessage = "Failed to create integration";
      let field: string | undefined;

      if (error && typeof error === "object" && "status" in error && "data" in error) {
        const apiError = error as { data?: { error?: string; field?: string }; status: number };
        errorMessage = apiError?.data?.error || errorMessage;
        field = apiError?.data?.field;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle field-specific errors
      if (field === "readToken") {
        setReadTokenError(errorMessage);
      } else if (field === "uploadToken") {
        setUploadTokenError(errorMessage);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async () => {
    if (!orgId || !selectedIntegration) return;

    setSaving(true);
    try {
      await deleteCesiumIntegration(orgId, selectedIntegration.id);
      mutate();
      showToast("Integration deleted successfully", "success");
      handleCloseDeleteDialog();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete integration";
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (integration: CesiumIonIntegration) => {
    if (!orgId) return;

    setSyncing(integration.id);
    try {
      const result: SyncResult = await syncCesiumIntegration(
        orgId,
        integration.id
      );

      // Force revalidation to get updated lastSyncedAt
      await mutate(undefined, { revalidate: true });
      showToast(
        `Sync completed: ${result.addedCount} added, ${result.updatedCount} updated, ${result.deletedCount} deleted`,
        "success"
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync integration";
      showToast(errorMessage, "error");
    } finally {
      setSyncing(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (loading) {
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
          <PageHeader title="Integrations" />
          <PageDescription>
            Manage Cesium Ion integrations for your organization
          </PageDescription>
          <PageContent maxWidth="5xl">
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
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

  if (!organization) {
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
          <PageHeader title="Integrations" />
          <PageDescription>
            Manage Cesium Ion integrations for your organization
          </PageDescription>
          <PageContent maxWidth="5xl">
            <Alert severity="error">Organization not found</Alert>
          </PageContent>
        </Page>
      </>
    );
  }

  return (
    <>
      {/* Animated background */}
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
        <PageHeader title="Integrations" />
        <PageDescription>
          Manage Cesium Ion integrations for your organization
        </PageDescription>

        <PageContent maxWidth="5xl">
          {/* Actions Toolbar */}
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 2,
              mb: 3,
              pb: 3,
              alignItems: "center",
              justifyContent: "flex-end",
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDrawer}
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
                Add Integration
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load integrations
            </Alert>
          )}

          {!canEdit && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You need admin or owner role to manage integrations.
            </Alert>
          )}

          <PageCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: "1rem" }}>
              Cesium Ion Integration
            </Typography>
            {integrations.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="body2">
                    No integrations configured yet.
                  </Typography>
                  {canEdit && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Click &quot;Add Integration&quot; to create your first Cesium Ion
                      integration.
                    </Typography>
                  )}
                </Box>
              ) : (
                <TableContainer
                  component={Box}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Label
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Tokens
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "text.primary",
                          }}
                        >
                          Last Synced
                        </TableCell>
                        {canEdit && (
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "text.primary",
                              width: 150,
                            }}
                          >
                            Actions
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {integrations.map((integration) => (
                        <TableRow
                          key={integration.id}
                          sx={{
                            backgroundColor: "transparent",
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                            "& .MuiTableCell-root": {
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                            }}
                          >
                            {integration.label}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.primary",
                              fontFamily: "monospace",
                            }}
                          >
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Read: ****{integration.readTokenLast4}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                }}
                              >
                                Upload: ****{integration.uploadTokenLast4}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              <Chip
                                icon={
                                  integration.readTokenValid ? (
                                    <CheckCircleIcon
                                      fontSize="small"
                                      sx={{
                                        color: (theme) => theme.palette.primary.main,
                                      }}
                                    />
                                  ) : (
                                    <ErrorIcon
                                      fontSize="small"
                                      sx={{
                                        color: (theme) =>
                                          theme.palette.mode === "dark"
                                            ? "#ff5656"
                                            : "#ef4444",
                                      }}
                                    />
                                  )
                                }
                                label={integration.readTokenValid ? "Read Valid" : "Read Invalid"}
                                size="small"
                                sx={(theme) => ({
                                  fontSize: "0.688rem",
                                  height: 20,
                                  backgroundColor: integration.readTokenValid
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(
                                        theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                                        0.15
                                      ),
                                  color: integration.readTokenValid
                                    ? theme.palette.primary.main
                                    : theme.palette.mode === "dark"
                                    ? "#ff5656"
                                    : "#ef4444",
                                  border: `1px solid ${
                                    integration.readTokenValid
                                      ? alpha(theme.palette.primary.main, 0.3)
                                      : alpha(
                                          theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                                          0.3
                                        )
                                  }`,
                                  fontWeight: 500,
                                  "& .MuiChip-icon": {
                                    fontSize: "0.875rem",
                                  },
                                })}
                              />
                              <Chip
                                icon={
                                  integration.uploadTokenValid ? (
                                    <CheckCircleIcon
                                      fontSize="small"
                                      sx={{
                                        color: (theme) => theme.palette.primary.main,
                                      }}
                                    />
                                  ) : (
                                    <ErrorIcon
                                      fontSize="small"
                                      sx={{
                                        color: (theme) =>
                                          theme.palette.mode === "dark"
                                            ? "#ff5656"
                                            : "#ef4444",
                                      }}
                                    />
                                  )
                                }
                                label={integration.uploadTokenValid ? "Upload Valid" : "Upload Invalid"}
                                size="small"
                                sx={(theme) => ({
                                  fontSize: "0.688rem",
                                  height: 20,
                                  backgroundColor: integration.uploadTokenValid
                                    ? alpha(theme.palette.primary.main, 0.15)
                                    : alpha(
                                        theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                                        0.15
                                      ),
                                  color: integration.uploadTokenValid
                                    ? theme.palette.primary.main
                                    : theme.palette.mode === "dark"
                                    ? "#ff5656"
                                    : "#ef4444",
                                  border: `1px solid ${
                                    integration.uploadTokenValid
                                      ? alpha(theme.palette.primary.main, 0.3)
                                      : alpha(
                                          theme.palette.mode === "dark" ? "#ff5656" : "#ef4444",
                                          0.3
                                        )
                                  }`,
                                  fontWeight: 500,
                                  "& .MuiChip-icon": {
                                    fontSize: "0.875rem",
                                  },
                                })}
                              />
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            {formatDate(integration.lastSyncedAt)}
                          </TableCell>
                          {canEdit && (
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <Button
                                  size="small"
                                  onClick={() => handleSync(integration)}
                                  disabled={syncing === integration.id || !integration.readTokenValid}
                                  startIcon={
                                    syncing === integration.id ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <SyncIcon fontSize="small" />
                                    )
                                  }
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
                                    "&:disabled": {
                                      opacity: 0.5,
                                    },
                                  })}
                                >
                                  Sync
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, integration.id)}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      backgroundColor: (theme) =>
                                        alpha(theme.palette.primary.main, 0.1),
                                      color: "primary.main",
                                    },
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
          </PageCard>
        </PageContent>
      </Page>

      {/* Add Integration Drawer */}
      <AddIntegrationDrawer
        open={drawerOpen}
        label={formData.label}
        readToken={formData.readToken}
        uploadToken={formData.uploadToken}
        saving={saving}
        readTokenError={readTokenError}
        uploadTokenError={uploadTokenError}
        onClose={handleCloseDrawer}
        onLabelChange={(value) => setFormData((prev) => ({ ...prev, label: value }))}
        onReadTokenChange={(value) => {
          setFormData((prev) => ({ ...prev, readToken: value }));
          setReadTokenError(null);
        }}
        onUploadTokenChange={(value) => {
          setFormData((prev) => ({ ...prev, uploadToken: value }));
          setUploadTokenError(null);
        }}
        onSave={handleCreateIntegration}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#161B20" : theme.palette.background.paper,
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.1)"
              }`,
            minWidth: 120,
            mt: 0.5,
          },
        }}
      >
        <MenuItem
          onClick={handleRemoveClick}
          sx={{
            fontSize: "0.75rem",
            color: "error.main",
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          Remove
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: (theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
            boxShadow: "none",
            "&.MuiPaper-root": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A !important"
                  : theme.palette.background.paper,
            },
          }),
        }}
      >
        <Box
          sx={(theme) => ({
            p: 3,
            backgroundColor:
              theme.palette.mode === "dark" ? "#14171A" : theme.palette.background.paper,
          })}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete Integration
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseDeleteDialog}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Content */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: "0.75rem", color: "text.primary" }}>
              Are you sure you want to delete the integration &quot;
              {selectedIntegration?.label}&quot;? This action cannot be undone.
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={handleCloseDeleteDialog}
              disabled={saving}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteIntegration}
              variant="contained"
              disabled={saving}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.error.main,
                border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.error.main, 0.05),
                  borderColor: alpha(theme.palette.error.main, 0.5),
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              })}
            >
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default IntegrationsPage;
