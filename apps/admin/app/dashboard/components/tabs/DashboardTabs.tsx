"use client";

import { Box, Tabs, Tab } from "@mui/material";

interface DashboardTabsProps {
  currentTab: string;
  onTabChange: (newValue: string) => void;
}

export function DashboardTabs({ currentTab, onTabChange }: DashboardTabsProps) {
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={currentTab}
        onChange={handleChange}
        aria-label="dashboard tabs"
        sx={(theme) => ({
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            minHeight: 48,
            "&.Mui-selected": {
              color: theme.palette.primary.main,
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: theme.palette.primary.main,
          },
        })}
      >
        <Tab label="Overview" value="overview" />
        <Tab label="Organizations" value="organizations" />
        <Tab label="Users" value="users" />
        <Tab label="Showcase" value="showcase" />
      </Tabs>
    </Box>
  );
}

