"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  alpha,
  useTheme,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LeftPanelContainer } from "@envisio/ui";
import LogoHeader from "@/app/components/AppBar/LogoHeader";
import UserAccountMenu from "@/app/components/AppBar/UserAccountMenu";

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    label: "Projects",
    icon: <FolderIcon />,
    path: "/projects",
  },
  {
    label: "Library",
    icon: <LibraryBooksIcon />,
    path: "/library",
    subItems: [
      { label: "Models", path: "/library/models" },
      { label: "Geospatial Assets", path: "/library/geospatial" },
      { label: "Sensors", path: "/library/sensors" },
      { label: "Data Sources", path: "/library/data-sources" },
    ],
  },
  {
    label: "Settings",
    icon: <SettingsIcon />,
    path: "/settings",
    subItems: [
      { label: "General", path: "/settings/general" },
      { label: "Members", path: "/settings/members" },
      { label: "Billing", path: "/settings/billing" },
      { label: "Usage", path: "/settings/usage" },
      { label: "API Keys", path: "/settings/api-keys" },
    ],
  },
];

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const theme = useTheme();

  // Track manual expansion state (user clicks) - null means no manual interaction yet
  const [manuallyExpanded, setManuallyExpanded] = useState<
    Record<string, boolean | null>
  >({
    library: null,
    settings: null,
  });

  // Calculate which accordions should be expanded based on pathname
  const pathnameExpanded = useMemo(() => {
    return {
      library: pathname?.startsWith("/library/") || false,
      settings: pathname?.startsWith("/settings/") || false,
    };
  }, [pathname]);

  // Combine pathname-based expansion with manual expansion
  // Manual expansion/collapse takes precedence, pathname expansion only applies if no manual interaction
  const expandedGroups = useMemo(() => {
    return {
      library:
        manuallyExpanded.library !== null
          ? manuallyExpanded.library
          : pathnameExpanded.library,
      settings:
        manuallyExpanded.settings !== null
          ? manuallyExpanded.settings
          : pathnameExpanded.settings,
    };
  }, [manuallyExpanded, pathnameExpanded]);

  const isItemActive = (item: MenuItem) => {
    if (item.subItems) {
      // For groups, check if any subpage is active
      return item.subItems.some((subItem) => pathname === subItem.path);
    }
    return pathname === item.path || pathname === `${item.path}/`;
  };

  const isSubItemActive = (subPath: string) => {
    return pathname === subPath;
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
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A"
              : "rgba(248, 250, 252, 0.6)",
        }}
      >
        <List
          sx={{
            width: "100%",
            p: 0,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "rgba(95, 136, 199, 0.05)",
              borderRadius: "4px",
              margin: "4px 0",
            },
            "&::-webkit-scrollbar-thumb": {
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.24)
                  : "rgba(95, 136, 199, 0.2)",
              borderRadius: "4px",
              border: "2px solid transparent",
              backgroundClip: "padding-box",
              transition: "background 0.2s ease",
              "&:hover": {
                background:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.38)
                    : "rgba(95, 136, 199, 0.35)",
                backgroundClip: "padding-box",
              },
            },
          }}
        >
          {menuItems.map((item) => {
            const isActive = isItemActive(item);
            const groupKey = item.label.toLowerCase();
            const isExpanded = expandedGroups[groupKey] || false;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            // Use Accordion for items with sub-items, regular ListItemButton for single items
            if (hasSubItems) {
              return (
                <Box key={item.path} sx={{ marginBottom: 0 }}>
                  <Accordion
                    expanded={isExpanded}
                    onChange={(_event, newExpanded) => {
                      // Update manual expansion state
                      setManuallyExpanded((prev) => ({
                        ...prev,
                        [groupKey]: newExpanded,
                      }));
                    }}
                    sx={{
                      marginBottom: 0,
                      boxShadow: "none",
                      "&:before": {
                        display: "none",
                      },
                      "&.Mui-expanded": {
                        margin: 0,
                      },
                      backgroundColor: "transparent",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.background.paper
                            : "rgba(248, 250, 252, 0.6)",
                        borderRadius: 0,
                        minHeight: "48px",
                        padding: theme.spacing(1.5, 2),
                        borderBottom: "1px solid",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        "&.Mui-expanded": {
                          minHeight: "48px",
                          borderBottom: "none",
                        },
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.primary.main, 0.1)
                              : "rgba(248, 250, 252, 0.9)",
                          color: theme.palette.primary.main,
                        },
                        "& .MuiAccordionSummary-content": {
                          margin: 0,
                          "&.Mui-expanded": {
                            margin: 0,
                          },
                        },
                        transition:
                          "background-color 0.15s ease, color 0.15s ease",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: "inherit",
                            mr: 1,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 400,
                            letterSpacing: "0.01em",
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        padding: 0,
                        backgroundColor: "transparent",
                        borderBottom: "1px solid",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <List component="div" disablePadding>
                        {item.subItems?.map((subItem) => {
                          const isSubActive = isSubItemActive(subItem.path);
                          return (
                            <ListItem key={subItem.path} disablePadding>
                              <ListItemButton
                                component={Link}
                                href={subItem.path}
                                selected={isSubActive}
                                disableRipple
                                onClick={(e) => {
                                  // Stop propagation to prevent Accordion from toggling
                                  e.stopPropagation();
                                }}
                                sx={(theme) => ({
                                  pl: 6,
                                  borderRadius: 0,
                                  marginBottom: 0,
                                  padding: theme.spacing(1.5, 2),
                                  backgroundColor: isSubActive
                                    ? alpha(theme.palette.primary.main, 0.18)
                                    : theme.palette.mode === "dark"
                                      ? theme.palette.background.paper
                                      : "rgba(248, 250, 252, 0.6)",
                                  color: isSubActive
                                    ? theme.palette.primary.main
                                    : theme.palette.mode === "dark"
                                      ? theme.palette.text.primary
                                      : "rgba(51, 65, 85, 0.95)",
                                  transition:
                                    "background-color 0.15s ease, color 0.15s ease",
                                  "&.Mui-selected": {
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.18
                                    ),
                                    color: theme.palette.primary.main,
                                    "&:hover": {
                                      backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.24
                                      ),
                                    },
                                  },
                                  "&:hover": {
                                    backgroundColor: isSubActive
                                      ? alpha(theme.palette.primary.main, 0.24)
                                      : theme.palette.mode === "dark"
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : "rgba(248, 250, 252, 0.9)",
                                    color: theme.palette.primary.main,
                                  },
                                })}
                              >
                                <ListItemText
                                  primary={subItem.label}
                                  primaryTypographyProps={{
                                    fontSize: "0.875rem",
                                    fontWeight: isSubActive ? 600 : 400,
                                    letterSpacing: "0.01em",
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              );
            }

            // Regular menu item without sub-items
            return (
              <ListItem key={item.path} disablePadding sx={{ marginBottom: 0 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  disableRipple
                  sx={(theme) => ({
                    borderRadius: 0,
                    marginBottom: 0,
                    padding: theme.spacing(1.5, 2),
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.18)
                      : theme.palette.mode === "dark"
                        ? theme.palette.background.paper
                        : "rgba(248, 250, 252, 0.6)",
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? theme.palette.text.primary
                        : "rgba(51, 65, 85, 0.95)",
                    borderBottom: "1px solid",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                    "&.Mui-selected": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.18),
                      color: theme.palette.primary.main,
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.24
                        ),
                      },
                    },
                    "&:hover": {
                      backgroundColor: isActive
                        ? alpha(theme.palette.primary.main, 0.24)
                        : theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.1)
                          : "rgba(248, 250, 252, 0.9)",
                      color: theme.palette.primary.main,
                    },
                  })}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: "0.01em",
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
          py: 0,
          px: 0,
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
