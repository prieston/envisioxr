"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  TextField,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  alpha,
  Tooltip,
  Divider,
} from "@mui/material";
import { DeleteIcon, PersonAddIcon, UpgradeIcon, OpenInNewIcon, CancelIcon, CloseIcon } from "@klorad/ui";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  showToast,
  textFieldStyles,
  SettingContainer,
  SettingLabel,
} from "@klorad/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useOrganization from "@/app/hooks/useOrganization";
import { useOrgId } from "@/app/hooks/useOrgId";
import { useSession } from "next-auth/react";
import useSWR from "swr";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expires: string;
  createdAt: string;
  invitedBy: string;
}

interface MembersData {
  members: Member[];
  invites: Invite[];
  userRole: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch members");
  }
  const data = await res.json();
  return data;
};

const SettingsMembersPage = () => {
  const orgId = useOrgId();
  const { data: session } = useSession();
  const {
    organization,
    loadingOrganization,
    error: orgError,
  } = useOrganization(orgId);

  const isPersonalOrg = organization?.isPersonal ?? false;

  // Only fetch members data for non-personal organizations
  const { data, error, isLoading, mutate } = useSWR<MembersData>(
    orgId && organization && !isPersonalOrg ? `/api/organizations/${orgId}/members` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [cancelInviteDialogOpen, setCancelInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<Invite | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const isOwner = data?.userRole === "owner";
  const canInvite = isOwner || data?.userRole === "admin";


  const handleInvite = async () => {
    if (!inviteEmail || !orgId) return;

    setInviting(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send invitation");
      }

      showToast("Invitation sent successfully", "success");
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      mutate();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to send invitation",
        "error"
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveClick = (member: Member) => {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove || !orgId) return;

    setRemoving(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: memberToRemove.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove member");
      }

      showToast("Member removed successfully", "success");
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      mutate();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to remove member",
        "error"
      );
    } finally {
      setRemoving(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!orgId) return;

    setUpdatingRole(memberId);
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role: newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update role");
      }

      showToast("Member role updated successfully", "success");
      mutate();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to update role",
        "error"
      );
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleCancelInviteClick = (invite: Invite) => {
    setInviteToCancel(invite);
    setCancelInviteDialogOpen(true);
  };

  const handleCancelInviteConfirm = async () => {
    if (!inviteToCancel || !orgId) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId: inviteToCancel.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel invitation");
      }

      showToast("Invitation cancelled successfully", "success");
      setCancelInviteDialogOpen(false);
      setInviteToCancel(null);
      mutate();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to cancel invitation",
        "error"
      );
    } finally {
      setCancelling(false);
    }
  };

  const getRoleColor = (role: string, theme: any) => {
    switch (role) {
      case "owner":
        return theme.palette.primary.main;
      case "admin":
        return theme.palette.primary.main;
      case "member":
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loadingOrganization || (!isPersonalOrg && isLoading)) {
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
          <PageHeader title="Members" />
          <PageContent>
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

  // Only show error for non-personal orgs if there's an API error
  // Personal orgs will show the upgrade message instead
  if (orgError || (!isPersonalOrg && error)) {
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
          <PageHeader title="Members" />
          <PageContent>
            <Alert severity="error">
              {orgError?.message || error?.message || "Failed to load members"}
            </Alert>
          </PageContent>
        </Page>
      </>
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
        <PageHeader title="Members" />
        <PageDescription>
          Invite users, assign roles, remove users, and manage permissions
        </PageDescription>

        <PageContent maxWidth="6xl">
          {isPersonalOrg ? (
            <PageCard>
              <Alert
                severity="info"
                icon={<UpgradeIcon />}
                sx={{
                  mb: 3,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.3 : 0.2)}`,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Personal organizations don&apos;t have members
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Personal organizations are for individual use only. To
                  collaborate with team members, get a quote.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.open("https://klorad.com/contact", "_blank")}
                  size="small"
                  endIcon={<OpenInNewIcon />}
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
                  Get a Quote
                </Button>
              </Alert>
            </PageCard>
          ) : (
            <>
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
                {canInvite && (
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setInviteDialogOpen(true)}
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
                    Invite Member
                  </Button>
                )}
              </Box>

              <PageCard>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontSize: "1rem" }}>
                  Organization Members
                </Typography>

                {!data ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                      color: "text.secondary",
                    }}
                  >
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Loading members...
                    </Typography>
                  </Box>
                ) : data.members.length === 0 && data.invites.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 6,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      No members yet
                    </Typography>
                    <Typography variant="body2">
                      {canInvite
                        ? "Invite your first team member to get started"
                        : "No members in this organization"}
                    </Typography>
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
                            Member
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "text.primary",
                            }}
                          >
                            Role
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "text.primary",
                            }}
                          >
                            Joined
                          </TableCell>
                          {isOwner && (
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "text.primary",
                                textAlign: "right",
                              }}
                            >
                              Actions
                            </TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Active Members */}
                        {data?.members && data.members.length > 0 ? (
                          data.members.map((member) => (
                          <TableRow
                            key={member.id}
                            hover
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
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Avatar
                                  src={member.user.image || undefined}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {(member.user.name || member.user.email)
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      color: "text.primary",
                                    }}
                                  >
                                    {member.user.name || member.user.email}
                                  </Typography>
                                  {member.user.name && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: "text.secondary",
                                      }}
                                    >
                                      {member.user.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.primary",
                              }}
                            >
                              {isOwner && member.userId !== session?.user?.id ? (
                                <Select
                                  value={member.role}
                                  onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                  size="small"
                                  disabled={updatingRole === member.id}
                                  sx={(theme) => {
                                    const color = getRoleColor(member.role, theme);
                                    return {
                                      minWidth: 100,
                                      backgroundColor: alpha(color, 0.15),
                                      color: color,
                                      border: `1px solid ${alpha(color, 0.3)}`,
                                      fontWeight: 500,
                                      fontSize: "0.75rem",
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: alpha(color, 0.3),
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: alpha(color, 0.5),
                                      },
                                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: color,
                                      },
                                    };
                                  }}
                                >
                                  <MenuItem value="member">Member</MenuItem>
                                  <MenuItem value="admin">Admin</MenuItem>
                                  <MenuItem value="owner">Owner</MenuItem>
                                </Select>
                              ) : (
                                <Chip
                                  label={formatRole(member.role)}
                                  size="small"
                                  sx={(theme) => {
                                    const color = getRoleColor(member.role, theme);
                                    return {
                                      backgroundColor: alpha(color, 0.15),
                                      color: color,
                                      border: `1px solid ${alpha(color, 0.3)}`,
                                      fontWeight: 500,
                                      fontSize: "0.75rem",
                                    };
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                {new Date(member.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            {isOwner && (
                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                {member.userId !== session?.user?.id && (
                                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                    <Tooltip title="Remove member">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleRemoveClick(member)}
                                        sx={{
                                          color: "error.main",
                                          "&:hover": {
                                            backgroundColor: (theme) =>
                                              alpha(theme.palette.error.main, 0.1),
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                          ))
                        ) : null}

                        {/* Pending Invites */}
                        {data?.invites && data.invites.length > 0 ? (
                          data.invites.map((invite) => (
                            <TableRow
                              key={invite.id}
                              hover
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
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: "0.875rem",
                                    backgroundColor: (theme) =>
                                      theme.palette.mode === "dark"
                                        ? alpha(theme.palette.primary.main, 0.2)
                                        : alpha(theme.palette.primary.main, 0.1),
                                    color: (theme) => theme.palette.primary.main,
                                  }}
                                >
                                  {invite.email.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      fontWeight: 500,
                                      color: "text.primary",
                                    }}
                                  >
                                    {invite.email}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.75rem",
                                      color: "text.secondary",
                                    }}
                                  >
                                    Pending invitation
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.primary",
                              }}
                            >
                              <Chip
                                label={formatRole(invite.role)}
                                size="small"
                                sx={(theme) => {
                                  const color = getRoleColor(invite.role, theme);
                                  return {
                                    backgroundColor: alpha(color, 0.15),
                                    color: color,
                                    border: `1px solid ${alpha(color, 0.3)}`,
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  };
                                }}
                              />
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                Invited {new Date(invite.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            {isOwner && (
                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "text.primary",
                                }}
                              >
                                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "flex-end" }}>
                                  <Chip
                                    label="Pending"
                                    size="small"
                                    sx={{
                                      backgroundColor: (theme) =>
                                        alpha(
                                          theme.palette.warning?.main || "#f59e0b",
                                          0.15
                                        ),
                                      color: (theme) =>
                                        theme.palette.warning?.main || "#f59e0b",
                                      border: (theme) =>
                                        `1px solid ${alpha(
                                          theme.palette.warning?.main || "#f59e0b",
                                          0.3
                                        )}`,
                                      fontSize: "0.75rem",
                                    }}
                                  />
                                  <Tooltip title="Cancel invitation">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCancelInviteClick(invite)}
                                      disabled={cancelling}
                                      sx={{
                                        color: "error.main",
                                        "&:hover": {
                                          backgroundColor: (theme) =>
                                            alpha(theme.palette.error.main, 0.1),
                                        },
                                      }}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                          ))
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </PageCard>
            </>
          )}
        </PageContent>
      </Page>

      {/* Invite Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => {
          setInviteDialogOpen(false);
          setInviteEmail("");
          setInviteRole("member");
        }}
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
              Invite Member
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmail("");
                setInviteRole("member");
              }}
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

          {/* Form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
              <SettingLabel>Email Address *</SettingLabel>
              <TextField
                autoFocus
                type="email"
                fullWidth
                size="small"
                variant="outlined"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                sx={textFieldStyles}
              />
            </SettingContainer>

            <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
              <SettingLabel>Role *</SettingLabel>
              <Select
                fullWidth
                size="small"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                sx={textFieldStyles}
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                {isOwner && <MenuItem value="owner">Owner</MenuItem>}
              </Select>
            </SettingContainer>

            {/* Actions */}
            <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setInviteDialogOpen(false);
                  setInviteEmail("");
                  setInviteRole("member");
                }}
                disabled={inviting}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                })}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleInvite}
                disabled={!inviteEmail || inviting}
                sx={(theme) => ({
                  borderRadius: `${theme.shape.borderRadius}px`,
                  textTransform: "none",
                  fontWeight: 500,
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#161B20"
                      : theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
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
                {inviting ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog
        open={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
          setMemberToRemove(null);
        }}
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
              Remove Member
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setRemoveDialogOpen(false);
                setMemberToRemove(null);
              }}
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
              Are you sure you want to remove{" "}
              <strong>
                {memberToRemove?.user.name || memberToRemove?.user.email}
              </strong>{" "}
              from this organization? This action cannot be undone.
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setRemoveDialogOpen(false);
                setMemberToRemove(null);
              }}
              disabled={removing}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRemoveConfirm}
              variant="contained"
              disabled={removing}
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
              {removing ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Cancel Invitation Dialog */}
      <Dialog
        open={cancelInviteDialogOpen}
        onClose={() => {
          setCancelInviteDialogOpen(false);
          setInviteToCancel(null);
        }}
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
              Cancel Invitation
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setCancelInviteDialogOpen(false);
                setInviteToCancel(null);
              }}
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
              Are you sure you want to cancel the invitation sent to{" "}
              <strong>{inviteToCancel?.email}</strong>? This action cannot be undone.
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => {
                setCancelInviteDialogOpen(false);
                setInviteToCancel(null);
              }}
              disabled={cancelling}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
              })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelInviteConfirm}
              variant="contained"
              disabled={cancelling}
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
              {cancelling ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Cancelling...
                </>
              ) : (
                "Cancel Invitation"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>

    </>
  );
};

export default SettingsMembersPage;
