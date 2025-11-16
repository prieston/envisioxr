"use client";

import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import FolderIcon from "@mui/icons-material/Folder";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import { LeftPanelContainer } from "@envisio/ui";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import UserAccountMenu from "@/app/components/AppBar/UserAccountMenu";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Projects",
    icon: <FolderIcon />,
    path: "/dashboard",
  },
  {
    label: "Library",
    icon: <LibraryBooksIcon />,
    path: "/library",
  },
  {
    label: "Settings",
    icon: <SettingsIcon />,
    path: "/settings",
  },
];

const DashboardSidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  return (
    <LeftPanelContainer
      previewMode={false}
      className="glass-panel"
      sx={{
        height: "calc(100vh - 32px)",
        maxHeight: "calc(100vh - 32px)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: "16px",
        top: "16px",
      }}
    >
      {/* Logo Header - Fixed at top */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          height: "64px",
          borderBottom: "1px solid rgba(100, 116, 139, 0.2)",
          mb: 2,
          px: 2,
          flexShrink: 0,
        }}
      >
        <LogoHeader />
      </Box>

      {/* Menu Items - Takes remaining space */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <List sx={{ width: "100%", p: 0 }}>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.path || pathname?.startsWith(item.path + "/");
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item.path)}
                  selected={isActive}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    "&.Mui-selected": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(95, 136, 199, 0.15)",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.12)"
                            : "rgba(95, 136, 199, 0.2)",
                      },
                    },
                    "&:hover": {
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.05)"
                          : "rgba(95, 136, 199, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive
                        ? (theme) => theme.palette.primary.main
                        : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Account Menu - Fixed at bottom */}
      <Box
        sx={{
          borderTop: "1px solid rgba(100, 116, 139, 0.2)",
          py: 2,
          px: 2,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <UserAccountMenu />
        </Box>
      </Box>
    </LeftPanelContainer>
  );
};

export default DashboardSidebar;
