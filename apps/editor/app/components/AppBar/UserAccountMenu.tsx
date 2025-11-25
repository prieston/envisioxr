"use client";

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import { LogoutIcon, PersonIcon, ExpandMoreIcon } from "@klorad/ui";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useOrgId } from "@/app/hooks/useOrgId";

interface UserAccountMenuProps {
  onLogout?: () => void;
  menuId?: string;
  className?: string;
}

export function UserAccountMenu({
  onLogout,
  menuId: _menuId = "account-menu",
  className,
}: UserAccountMenuProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const orgId = useOrgId();
  const isProfileActive = pathname?.includes("/profile");

  const userInitial = useMemo(() => {
    return (
      session?.user?.name?.charAt(0)?.toUpperCase() ||
      session?.user?.email?.charAt(0)?.toUpperCase() ||
      "U"
    );
  }, [session?.user?.email, session?.user?.name]);

  const handleProfile = () => {
    if (orgId) {
      router.push(`/org/${orgId}/profile`);
    } else {
      router.push("/profile");
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    }
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const userName = session?.user?.name || session?.user?.email || "User";

  return (
    <Box className={className} sx={{ width: "100%" }}>
      <Accordion
        expanded={expanded}
        onChange={(_event, newExpanded) => {
          setExpanded(newExpanded);
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
            "&.Mui-expanded": {
              minHeight: "48px",
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
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Avatar
              src={session?.user?.image ?? undefined}
              alt={userName}
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
              }}
            >
              {userInitial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  color: "inherit",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName}
              </Box>
              {session?.user?.email && session?.user?.name && (
                <Box
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {session.user.email}
                </Box>
              )}
            </Box>
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
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={orgId ? `/org/${orgId}/profile` : "/profile"}
                disableRipple
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfile();
                }}
                selected={isProfileActive}
                sx={(theme) => ({
                  pl: 6,
                  borderRadius: 0,
                  marginBottom: 0,
                  padding: theme.spacing(1.5, 2),
                  backgroundColor: isProfileActive
                    ? alpha(theme.palette.primary.main, 0.18)
                    : theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : "rgba(248, 250, 252, 0.6)",
                  color: isProfileActive
                    ? theme.palette.primary.main
                    : theme.palette.mode === "dark"
                      ? theme.palette.text.primary
                      : "rgba(51, 65, 85, 0.95)",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.18),
                    color: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  },
                  "&:hover": {
                    backgroundColor: isProfileActive
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
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Profile"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: isProfileActive ? 600 : 400,
                    letterSpacing: "0.01em",
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                disableRipple
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                sx={(theme) => ({
                  pl: 6,
                  borderRadius: 0,
                  marginBottom: 0,
                  padding: theme.spacing(1.5, 2),
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? theme.palette.background.paper
                      : "rgba(248, 250, 252, 0.6)",
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.primary
                      : "rgba(51, 65, 85, 0.95)",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark"
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
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    letterSpacing: "0.01em",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default UserAccountMenu;
