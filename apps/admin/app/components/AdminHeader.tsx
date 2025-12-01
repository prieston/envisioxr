"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isGodUser } from "@/lib/config/godusers";
import Image from "next/image";
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
import { LogoutIcon } from "@klorad/ui";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(17, 19, 23, 0.9) !important"
      : "#14171A !important",
  backdropFilter: "blur(20px) saturate(50%) !important",
  WebkitBackdropFilter: "blur(20px) saturate(50%) !important",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.08) !important"
      : "none !important",
  borderRadius: "4px !important",
  boxShadow: "none !important",
  backgroundImage: "none !important",
  position: "sticky",
  top: 0,
  zIndex: 1100,
  marginBottom: theme.spacing(2),
  "& .MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
  "&.MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 130,
              height: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Image
              src="/images/logo/klorad-logo.svg"
              alt="Klorad"
              width={130}
              height={40}
              priority
              style={{
                filter: "brightness(0) invert(1)",
                display: "block",
                width: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {session?.user && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
                <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.75rem", color: "text.primary" }}>
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
                    fontSize: "0.75rem",
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
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.75rem", color: "text.primary" }}>
                    {session.user.name || "User"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    {session.user.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ fontSize: "0.75rem" }}>
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

