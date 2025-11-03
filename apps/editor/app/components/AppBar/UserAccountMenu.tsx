"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut, useSession } from "next-auth/react";

interface UserAccountMenuProps {
  onLogout?: () => void;
  menuId?: string;
  className?: string;
}

export function UserAccountMenu({
  onLogout,
  menuId = "account-menu",
  className,
}: UserAccountMenuProps) {
  const { data: session } = useSession();
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
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    if (onLogout) {
      onLogout();
    }
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <Box display="flex" alignItems="center" className={className}>
      <Tooltip title={tooltipTitle}>
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{ ml: 1 }}
          aria-controls={anchorEl ? menuId : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? "true" : undefined}
        >
          <Avatar
            src={session?.user?.image ?? undefined}
            alt={session?.user?.name ?? session?.user?.email ?? "account"}
            sx={{ width: 32, height: 32 }}
          >
            {userInitial}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id={menuId}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 160,
            "& .MuiMenuItem-root": {
              gap: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" /> Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserAccountMenu;

