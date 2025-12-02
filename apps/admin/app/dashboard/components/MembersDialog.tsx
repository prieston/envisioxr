"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  alpha,
  Menu,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { AddIcon, PersonAddIcon, CloseIcon } from "@klorad/ui";
import { showToast, textFieldStyles, SettingContainer, SettingLabel } from "@klorad/ui";
import useSWR from "swr";

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expires: Date;
  createdAt: Date;
  invitedBy: {
    name: string | null;
    email: string | null;
  };
}

interface MembersData {
  members: Member[];
  invites: Invite[];
}

interface MembersDialogProps {
  open: boolean;
  orgId: string;
  orgName: string;
  isPersonal?: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(error.error || `Failed to fetch: ${res.statusText}`);
    }
    return res.json();
  });

export default function MembersDialog({
  open,
  orgId,
  orgName,
  isPersonal = false,
  onClose,
  onUpdate,
}: MembersDialogProps) {
  const [tab, setTab] = useState(0);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<{ element: HTMLElement; memberId: string } | null>(null);
  const [inviteMenuAnchor, setInviteMenuAnchor] = useState<{ element: HTMLElement; inviteId: string } | null>(null);

  const { data, error, mutate } = useSWR<MembersData>(
    open && orgId ? `/api/organizations/${orgId}/members` : null,
    fetcher
  );

  // Fetch all users for the "Add Member" dropdown
  // Using lightweight /api/users endpoint instead of /api/stats to avoid expensive queries
  const { data: usersData } = useSWR<{
    users: Array<{ id: string; name: string | null; email: string | null }>;
  }>(open && addMemberOpen ? "/api/users" : null, fetcher);


  const handleAddMember = useCallback(async () => {
    if (!selectedUserId || !orgId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add member");
      }

      showToast("Member added successfully!", "success");
      await mutate();
      await onUpdate();
      setAddMemberOpen(false);
      setSelectedUserId("");
      setSelectedRole("member");
    } catch (error) {
      console.error("Error adding member:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to add member",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, selectedRole, orgId, mutate, onUpdate]);

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!orgId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/organizations/${orgId}/members`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove member");
        }

        showToast("Member removed successfully!", "success");
        await mutate();
        await onUpdate();
        setMemberMenuAnchor(null);
      } catch (error) {
        console.error("Error removing member:", error);
        showToast(
          error instanceof Error ? error.message : "Failed to remove member",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [orgId, mutate, onUpdate]
  );

  const handleInvite = useCallback(async () => {
    if (!inviteEmail || !orgId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }

      await response.json();
      showToast("Invitation created successfully!", "success");
      await mutate();
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    } catch (error) {
      console.error("Error sending invitation:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to send invitation",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [inviteEmail, inviteRole, orgId, mutate]);

  const handleRevokeInvite = useCallback(
    async (inviteId: string) => {
      if (!orgId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/organizations/${orgId}/invites`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to revoke invitation");
        }

        showToast("Invitation revoked successfully!", "success");
        await mutate();
        setInviteMenuAnchor(null);
      } catch (error) {
        console.error("Error revoking invitation:", error);
        showToast(
          error instanceof Error ? error.message : "Failed to revoke invitation",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [orgId, mutate]
  );

  const handleMemberMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setMemberMenuAnchor({ element: event.currentTarget, memberId });
  }, []);

  const handleMemberMenuClose = useCallback(() => {
    setMemberMenuAnchor(null);
  }, []);

  const handleInviteMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, inviteId: string) => {
    setInviteMenuAnchor({ element: event.currentTarget, inviteId });
  }, []);

  const handleInviteMenuClose = useCallback(() => {
    setInviteMenuAnchor(null);
  }, []);

  const getRoleChipStyle = (role: string) => {
    const baseStyle = {
      height: 20,
      fontSize: "0.7rem",
    };

    switch (role) {
      case "owner":
        return {
          ...baseStyle,
          backgroundColor: alpha("#ef4444", 0.1),
          color: "#ef4444",
          border: `1px solid ${alpha("#ef4444", 0.3)}`,
        };
      case "admin":
        return {
          ...baseStyle,
          backgroundColor: alpha("#f59e0b", 0.1),
          color: "#f59e0b",
          border: `1px solid ${alpha("#f59e0b", 0.3)}`,
        };
      case "member":
        return {
          ...baseStyle,
          backgroundColor: alpha("#6B9CD8", 0.1),
          color: "#6B9CD8",
          border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
        };
      case "publicViewer":
        return {
          ...baseStyle,
          backgroundColor: alpha("#6B9CD8", 0.1),
          color: "#6B9CD8",
          border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: alpha("#6B9CD8", 0.1),
          color: "#6B9CD8",
          border: `1px solid ${alpha("#6B9CD8", 0.3)}`,
        };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            Manage Members - {orgName}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {!isPersonal && (
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddMemberOpen(true)}
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
                        : alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                })}
              >
                Add Member
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteOpen(true)}
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
                        : alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                })}
              >
                Invite User
              </Button>
            </Box>
          )}
          {isPersonal && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Personal organizations cannot have multiple members. Only the owner can access this organization.
              </Typography>
            </Box>
          )}

          <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
            <Tab label={`Members (${data?.members.length || 0})`} sx={{ fontSize: "0.75rem", textTransform: "none" }} />
            <Tab label={`Pending Invites (${data?.invites.length || 0})`} sx={{ fontSize: "0.75rem", textTransform: "none" }} />
          </Tabs>

          {tab === 0 && (
            <TableContainer component={Box} sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "transparent" }}>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>User</TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Role</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.members.map((member) => (
                    <TableRow key={member.id} sx={{ backgroundColor: "transparent", "&:hover": { backgroundColor: "transparent" } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 500 }}>
                          {member.user.name || member.user.email || "Unknown"}
                        </Typography>
                        {member.user.email && (
                          <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                            {member.user.email}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={member.role}
                          size="small"
                          sx={getRoleChipStyle(member.role)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMemberMenuOpen(e, member.id)}
                          disabled={loading}
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            padding: "4px",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: theme.palette.text.primary,
                            },
                          })}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          No members yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <TableContainer component={Box} sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "transparent" }}>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Email</TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Role</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Invited By</TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Expires</TableCell>
                    <TableCell align="right" sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600, backgroundColor: "transparent" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.invites.map((invite) => (
                    <TableRow key={invite.id} sx={{ backgroundColor: "transparent", "&:hover": { backgroundColor: "transparent" } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                          {invite.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={invite.role}
                          size="small"
                          sx={getRoleChipStyle(invite.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.primary" }}>
                          {invite.invitedBy.name || invite.invitedBy.email || "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          {new Date(invite.expires).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleInviteMenuOpen(e, invite.id)}
                          disabled={loading}
                          sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            padding: "4px",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.08)",
                              color: theme.palette.text.primary,
                            },
                          })}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.invites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                          No pending invites
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {error && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "error.main" }}>
                {error instanceof Error ? error.message : "Failed to load members"}
              </Typography>
            </Box>
          )}
        </Box>
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
          }}
        >
          <Button
            onClick={onClose}
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
            Close
          </Button>
        </Box>
      </Box>

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
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
              Add Member
            </Typography>
            <IconButton
              onClick={() => setAddMemberOpen(false)}
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
                <SettingLabel>User</SettingLabel>
                <FormControl fullWidth>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    sx={textFieldStyles}
                  >
                    {usersData?.users
                      ?.filter(
                        (user) =>
                          !data?.members.some((m) => m.userId === user.id)
                      )
                      .map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name || user.email || "Unknown"}
                          {user.email && ` (${user.email})`}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </SettingContainer>
              <SettingContainer>
                <SettingLabel>Role</SettingLabel>
                <FormControl fullWidth>
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="publicViewer">Public Viewer</MenuItem>
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
              onClick={() => setAddMemberOpen(false)}
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
              onClick={handleAddMember}
              variant="contained"
              disabled={loading || !selectedUserId}
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
              {loading ? <CircularProgress size={20} /> : "Add Member"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
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
              Invite User
            </Typography>
            <IconButton
              onClick={() => setInviteOpen(false)}
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
                <SettingLabel>Email</SettingLabel>
                <TextField
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  fullWidth
                  required
                  sx={textFieldStyles}
                />
              </SettingContainer>
              <SettingContainer>
                <SettingLabel>Role</SettingLabel>
                <FormControl fullWidth>
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    sx={textFieldStyles}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="publicViewer">Public Viewer</MenuItem>
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
              onClick={() => setInviteOpen(false)}
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
              onClick={handleInvite}
              variant="contained"
              disabled={loading || !inviteEmail.trim()}
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
              {loading ? <CircularProgress size={20} /> : "Send Invitation"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Three-Dot Menu for Members */}
      <Menu
        anchorEl={memberMenuAnchor?.element || null}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
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
            if (memberMenuAnchor) {
              handleRemoveMember(memberMenuAnchor.memberId);
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
          Remove
        </MenuItem>
      </Menu>

      {/* Three-Dot Menu for Invites */}
      <Menu
        anchorEl={inviteMenuAnchor?.element || null}
        open={Boolean(inviteMenuAnchor)}
        onClose={handleInviteMenuClose}
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
            if (inviteMenuAnchor) {
              handleRevokeInvite(inviteMenuAnchor.inviteId);
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
          Cancel Invitation
        </MenuItem>
      </Menu>
    </Dialog>
  );
}

