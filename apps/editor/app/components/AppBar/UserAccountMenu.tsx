"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserAccountMenuProps {
  onLogout?: () => void;
  menuId?: string;
  className?: string;
}

// Helper component for profile section
const ProfileSection: React.FC<{
  userInitial: string;
  userName: string | null | undefined;
  userEmail: string | null | undefined;
  userImage: string | null | undefined;
  onProfileClick: () => void;
}> = ({ userInitial, userName, userEmail, userImage, onProfileClick }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProfileClick();
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Avatar
          src={userImage ?? undefined}
          alt={userName ?? userEmail ?? "account"}
          sx={{ width: 64, height: 64 }}
        >
          {userInitial}
        </Avatar>
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.1)",
            width: 24,
            height: 24,
            "&:hover": {
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.2)",
            },
          }}
          onClick={handleEditClick}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {userName || "User"}
      </Typography>
      {userEmail && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          {userEmail}
        </Typography>
      )}
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          onProfileClick();
        }}
        sx={{
          py: 0.5,
          px: 1,
          minHeight: "auto",
          borderRadius: 1,
          mt: 0.5,
          pointerEvents: "auto",
          "&:hover": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Edit profile
        </Typography>
      </MenuItem>
    </Box>
  );
};

// Helper component for menu items
const MenuItemsSection: React.FC<{
  onProfile: () => void;
  onSettings: () => void;
}> = ({ onProfile, onSettings }) => {
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProfile();
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSettings();
  };

  return (
    <Box sx={{ py: 1, pointerEvents: "auto" }}>
      <MenuItem onClick={handleProfileClick} sx={{ pointerEvents: "auto" }}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </MenuItem>
      <MenuItem onClick={handleSettingsClick} sx={{ pointerEvents: "auto" }}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </MenuItem>
    </Box>
  );
};

// Helper component for logout section
const LogoutSection: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogout();
  };

  return (
    <Box sx={{ py: 1, pointerEvents: "auto" }}>
      <MenuItem onClick={handleLogoutClick} sx={{ pointerEvents: "auto" }}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </MenuItem>
    </Box>
  );
};

export function UserAccountMenu({
  onLogout,
  menuId = "account-menu",
  className,
}: UserAccountMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const tooltipTitle = session?.user?.email || session?.user?.name || "Account";

  const userInitial = useMemo(() => {
    return (
      session?.user?.name?.charAt(0)?.toUpperCase() ||
      session?.user?.email?.charAt(0)?.toUpperCase() ||
      "U"
    );
  }, [session?.user?.email, session?.user?.name]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: "backdropClick" | "escapeKeyDown" | "tabKeyDown"
  ) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      setAnchorEl(null);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleSettings = () => {
    handleMenuClose();
    router.push("/settings");
  };

  const handleLogout = async () => {
    handleMenuClose();
    if (onLogout) {
      onLogout();
    }
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <Box display="flex" alignItems="center" className={className}>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{ ml: 1 }}
        aria-controls={anchorEl ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        title={tooltipTitle}
      >
        <Avatar
          src={session?.user?.image ?? undefined}
          alt={session?.user?.name ?? session?.user?.email ?? "account"}
          sx={{ width: 32, height: 32 }}
        >
          {userInitial}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id={menuId}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": menuId,
          sx: { py: 0, pointerEvents: "auto" },
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 280,
            maxWidth: 320,
            borderRadius: 2,
            overflow: "hidden",
            pointerEvents: "auto",
            "& .MuiMenuItem-root": {
              pointerEvents: "auto",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        disablePortal={true}
        slotProps={{
          root: {
            sx: {
              zIndex: 1501,
            },
          },
        }}
        sx={{
          zIndex: 1501,
          "& .MuiPopover-root": {
            zIndex: "1501 !important",
          },
          "& .MuiPaper-root": {
            pointerEvents: "auto",
            zIndex: "1501 !important",
            position: "relative",
          },
        }}
      >
        <ProfileSection
          userInitial={userInitial}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          userImage={session?.user?.image}
          onProfileClick={handleProfile}
        />

        <Divider />

        <MenuItemsSection
          onProfile={handleProfile}
          onSettings={handleSettings}
        />

        <Divider />

        <LogoutSection onLogout={handleLogout} />
      </Menu>
    </Box>
  );
}

export default UserAccountMenu;
