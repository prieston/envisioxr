"use client";
import React from "react";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../../theme/ThemeModeProvider";

export default function ThemeToggleButton() {
  const { mode, toggle } = useThemeMode();
  return (
    <IconButton size="small" onClick={toggle} aria-label="toggle theme">
      {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}
