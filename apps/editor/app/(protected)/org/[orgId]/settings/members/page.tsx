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
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  alpha,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import {
  Page,
  PageHeader,
  PageDescription,
  PageContent,
  PageCard,
  showToast,
} from "@envisio/ui";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import useOrganization from "@/app/hooks/useOrganization";
import { useOrgId } from "@/app/hooks/useOrgId";
import { getPlans, Plan } from "@/app/utils/api";
import useSWR from "swr";
import { CreateOrganizationModal } from "@/app/components/Organizations/CreateOrganizationModal";
import { useSession } from "next-auth/react";

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
  const [createOrgModalOpen, setCreateOrgModalOpen] = useState(false);

  // Fetch plans for the modal
  const { data: plansData } = useSWR<{ plans: Plan[] }>("/api/plans", getPlans);

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
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);

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

  const getRoleColor = (role: string, theme: any) => {
    switch (role) {
      case "owner":
        return theme.palette.warning?.main || "#f59e0b";
      case "admin":
        return theme.palette.primary.main;
      case "member":
        return theme.palette.success?.main || "#10b981";
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
                  collaborate with team members, create an Organisation Workspace.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setCreateOrgModalOpen(true)}
                  sx={{ textTransform: "none" }}
                >
                  Create Organisation Workspace
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
                    sx={{ textTransform: "none" }}
                  >
                    Invite Member
                  </Button>
                )}
              </Box>

              <PageCard>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
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
                    component={Paper}
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.background.paper, 0.6)
                          : theme.palette.background.paper,
                      border: (theme) =>
                        `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Member</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                          {isOwner && (
                            <TableCell
                              sx={{ fontWeight: 600, textAlign: "right" }}
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
                          <TableRow key={member.id} hover>
                            <TableCell>
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
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {member.user.name || member.user.email}
                                  </Typography>
                                  {member.user.name && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {member.user.email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
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
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {new Date(member.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            {isOwner && (
                              <TableCell align="right">
                                {member.userId !== session?.user?.id && (
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
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                          ))
                        ) : null}

                        {/* Pending Invites */}
                        {data?.invites && data.invites.length > 0 ? (
                          data.invites.map((invite) => (
                            <TableRow key={invite.id} hover>
                            <TableCell>
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
                                    color: theme.palette.primary.main,
                                  }}
                                >
                                  {invite.email.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {invite.email}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    Pending invitation
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
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
                            <TableCell>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Invited {new Date(invite.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            {isOwner && (
                              <TableCell align="right">
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
      >
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            variant="outlined"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            {isOwner && <MenuItem value="owner">Owner</MenuItem>}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInviteDialogOpen(false);
              setInviteEmail("");
              setInviteRole("member");
            }}
            disabled={inviting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={!inviteEmail || inviting}
            sx={{ textTransform: "none" }}
          >
            {inviting ? <CircularProgress size={20} /> : "Send Invitation"}
          </Button>
        </DialogActions>
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
      >
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove{" "}
            <strong>
              {memberToRemove?.user.name || memberToRemove?.user.email}
            </strong>{" "}
            from this organization? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRemoveDialogOpen(false);
              setMemberToRemove(null);
            }}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            variant="contained"
            color="error"
            disabled={removing}
          >
            {removing ? <CircularProgress size={20} /> : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Organization Modal */}
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

export default SettingsMembersPage;
