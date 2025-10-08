"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState, } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
const ThemeModeContext = createContext(null);
export default function ThemeModeProvider({ children, }) {
    const [mode, setMode] = useState("light");
    useEffect(() => {
        if (typeof document !== "undefined") {
            const root = document.documentElement;
            if (mode === "dark")
                root.classList.add("dark");
            else
                root.classList.remove("dark");
        }
    }, [mode]);
    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const value = useMemo(() => ({
        mode,
        toggle: () => setMode(mode === "light" ? "dark" : "light"),
        setMode,
    }), [mode]);
    return (_jsx(ThemeModeContext.Provider, { value: value, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), children] }) }));
}
export function useThemeMode() {
    const ctx = useContext(ThemeModeContext);
    if (!ctx)
        throw new Error("useThemeMode must be used within ThemeModeProvider");
    return ctx;
}
//# sourceMappingURL=ThemeModeProvider.js.map