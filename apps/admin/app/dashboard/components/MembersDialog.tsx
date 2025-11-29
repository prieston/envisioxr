"use client";

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  InputLabel,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { DeleteIcon, AddIcon, PersonAddIcon } from "@klorad/ui";
import { showToast } from "@klorad/ui";
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

  const { data, error, mutate } = useSWR<MembersData>(
    open && orgId ? `/api/organizations/${orgId}/members` : null,
    fetcher
  );

  // Fetch all users for the "Add Member" dropdown
  const { data: statsData } = useSWR<{
    users: {
      all: Array<{ id: string; name: string | null; email: string | null }>;
    };
  }>(open && addMemberOpen ? "/api/stats" : null, fetcher);


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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "error";
      case "admin":
        return "warning";
      case "member":
        return "primary";
      case "publicViewer":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Members - {orgName}
        {!isPersonal && (
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setAddMemberOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Add Member
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Invite User
            </Button>
          </Box>
        )}
        {isPersonal && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Personal organizations cannot have multiple members. Only the owner can access this organization.
            </Typography>
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
          <Tab label={`Members (${data?.members.length || 0})`} />
          <Tab label={`Pending Invites (${data?.invites.length || 0})`} />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell align="center">Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {member.user.name || member.user.email || "Unknown"}
                      </Typography>
                      {member.user.email && (
                        <Typography variant="caption" color="text.secondary">
                          {member.user.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={member.role}
                        size="small"
                        color={getRoleColor(member.role) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography variant="body2" color="text.secondary">
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Role</TableCell>
                  <TableCell>Invited By</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={invite.role}
                        size="small"
                        color={getRoleColor(invite.role) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {invite.invitedBy.name || invite.invitedBy.email || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(invite.expires).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRevokeInvite(invite.id)}
                        disabled={loading}
                        title="Revoke invitation"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.invites.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
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
            <Typography color="error">
              {error instanceof Error ? error.message : "Failed to load members"}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                label="User"
              >
                {statsData?.users?.all
                  .filter(
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
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="publicViewer">Public Viewer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)} disabled={loading} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={loading || !selectedUserId}
            sx={{ textTransform: "none" }}
          >
            {loading ? <CircularProgress size={20} /> : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="member">Member</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="publicViewer">Public Viewer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)} disabled={loading} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={loading || !inviteEmail.trim()}
            sx={{ textTransform: "none" }}
          >
            {loading ? <CircularProgress size={20} /> : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

