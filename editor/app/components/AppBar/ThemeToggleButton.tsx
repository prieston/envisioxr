"use client";

import { IconButton, Tooltip } from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "@/lib/ThemeModeProvider";

export default function ThemeToggleButton() {
  const { mode, toggle } = useThemeMode();
  return (
    <Tooltip title={mode === "dark" ? "Switch to day" : "Switch to night"}>
      <IconButton
        onClick={toggle}
        color="inherit"
        size="small"
        sx={(_theme) => ({
          backgroundColor:
            mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "transparent",
          "&:hover": {
            backgroundColor:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.04)",
          },
        })}
      >
        {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
