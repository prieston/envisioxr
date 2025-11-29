"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isGodUser } from "@/lib/config/godusers";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { LogoutIcon, PersonIcon } from "@klorad/ui";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(17, 19, 23, 0.9)"
      : "#14171A",
  backdropFilter: "blur(20px) saturate(50%)",
  WebkitBackdropFilter: "blur(20px) saturate(50%)",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.08)"
      : "none",
  borderRadius: "4px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 3px 12px rgba(0, 0, 0, 0.35)"
      : "0 8px 32px rgba(0, 0, 0, 0.15)",
  position: "sticky",
  top: 0,
  zIndex: 1100,
  marginBottom: theme.spacing(2),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "64px !important",
  padding: `0 ${theme.spacing(2)} !important`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "transparent !important",
  color:
    theme.palette.mode === "dark"
      ? "#ffffff !important"
      : "rgba(15, 23, 42, 0.95) !important",
}));

export function AdminHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Redirect if user is not a god user
  useEffect(() => {
    if (session?.user?.email && !isGodUser(session.user.email)) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <StyledAppBar>
      <StyledToolbar>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Klorad Admin Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {session?.user && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
                <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                  {session.user.name || session.user.email}
                </Typography>
              </Box>
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{
                  padding: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: "0.875rem",
                  }}
                  src={session.user.image || undefined}
                >
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "A"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
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
                    mt: 1,
                    minWidth: 200,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(17, 19, 23, 0.95)"
                        : "#ffffff",
                    backdropFilter: "blur(20px)",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1px solid rgba(255, 255, 255, 0.08)"
                        : "1px solid rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {session.user.name || "User"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.user.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </StyledToolbar>
    </StyledAppBar>
  );
}

