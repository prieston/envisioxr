"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useThemeMode } from "../../theme/ThemeModeProvider";
export default function ThemeToggleButton() {
    const { mode, toggle } = useThemeMode();
    return (_jsx(IconButton, { size: "small", onClick: toggle, "aria-label": "toggle theme", children: mode === "light" ? _jsx(DarkModeIcon, {}) : _jsx(LightModeIcon, {}) }));
}
//# sourceMappingURL=ThemeToggleButton.js.map