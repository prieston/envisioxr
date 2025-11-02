import { styled, alpha } from "@mui/material/styles";
import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type React from "react";

export { GenericPanel } from "./GenericPanel";

export interface PanelContainerProps {
  previewMode: boolean;
}

export const LeftPanelContainer: React.FC<PanelContainerProps & BoxProps> =
  styled(Box, {
    shouldForwardProp: (prop: PropertyKey) => prop !== "previewMode",
  })<PanelContainerProps>(
    ({ theme, previewMode }: { theme: any; previewMode: boolean }) => ({
      width: "360px",
      height: "100%",
      maxHeight: "calc(100vh - 120px)",
      marginRight: "8px",
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha("#14171A", 0.92)
          : "var(--glass-bg, rgba(255, 255, 255, 0.92))",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.primary
          : "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
      padding: theme.spacing(3),
      border:
        theme.palette.mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(95, 136, 199, 0.15)",
      borderRadius: 4,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 2px 6px rgba(0, 0, 0, 0.4)"
          : "0 2px 6px rgba(15, 23, 42, 0.08)",
      userSelect: "none",
      pointerEvents: previewMode ? "none" : "auto",
      opacity: previewMode ? 0.5 : 1,
      cursor: previewMode ? "not-allowed" : "default",
      filter: previewMode ? "grayscale(100%)" : "none",
      transition: "border-color 0.15s ease",
      position: "relative",
      zIndex: 1400,
      transform: "translateZ(0)",
      willChange: "backdrop-filter",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      "&:hover": {
        borderColor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(95, 136, 199, 0.25)",
      },
    })
  );

export const RightPanelContainer: React.FC<PanelContainerProps & BoxProps> =
  styled(Box, {
    shouldForwardProp: (prop: PropertyKey) => prop !== "previewMode",
  })<PanelContainerProps>(
    ({ theme, previewMode }: { theme: any; previewMode: boolean }) => ({
      width: "400px",
      height: "100%",
      maxHeight: "calc(100vh - 120px)",
      marginLeft: "8px",
      backgroundColor:
        theme.palette.mode === "dark"
          ? alpha("#14171A", 0.92)
          : "var(--glass-bg, rgba(255, 255, 255, 0.92))",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      color:
        theme.palette.mode === "dark"
          ? theme.palette.text.primary
          : "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
      padding: theme.spacing(3),
      border:
        theme.palette.mode === "dark"
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
      borderRadius: 4,
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 2px 6px rgba(0, 0, 0, 0.4)"
          : "0 2px 6px rgba(15, 23, 42, 0.08)",
      userSelect: "none",
      pointerEvents: previewMode ? "none" : "auto",
      opacity: previewMode ? 0.5 : 1,
      cursor: previewMode ? "not-allowed" : "default",
      filter: previewMode ? "grayscale(100%)" : "none",
      transition:
        "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      zIndex: 1400,
      transform: "translateZ(0)",
      willChange: "backdrop-filter",
    })
  );

export const TabPanel: React.FC<BoxProps> = styled(Box)(
  ({ theme }: { theme: any }) => ({
    flex: 1,
    overflow: "auto",
    paddingRight: theme.spacing(0.5),
    backgroundColor:
      theme.palette.mode === "dark" ? "#14171A" : "rgba(248, 250, 252, 0.6)",
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
  })
);

export interface BottomPanelContainerProps {
  previewMode: boolean;
}

export const BottomPanelContainer: React.FC<
  BottomPanelContainerProps & BoxProps
> = styled(Box, {
  shouldForwardProp: (prop: PropertyKey) => prop !== "previewMode",
})<BottomPanelContainerProps>(
  ({ theme: _theme, previewMode: _previewMode }) => ({
    width: "100%",
    minHeight: "80px", // Minimum comfortable height
    height: "auto", // Allow natural height based on content
    maxHeight: "200px", // Maximum to prevent too tall
    marginTop: _theme.spacing(1),
    backgroundColor:
      _theme.palette.mode === "dark"
        ? alpha("#14171A", 0.92)
        : "var(--glass-bg, rgba(255, 255, 255, 0.92))",
    backdropFilter: "blur(24px) saturate(140%)",
    WebkitBackdropFilter: "blur(24px) saturate(140%)",
    padding: _theme.spacing(3),
    display: "flex",
    alignItems: "stretch", // Allow sections to stretch to full height
    gap: _theme.spacing(2),
    border:
      _theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
    borderRadius: 4,
    boxShadow:
      _theme.palette.mode === "dark"
        ? "0 2px 6px rgba(0, 0, 0, 0.4)"
        : "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
    userSelect: "none",
    pointerEvents: "auto",
    position: "relative",
    zIndex: 1400,
    transform: "translateZ(0)",
    willChange: "backdrop-filter",
    transition: "border-color 0.15s ease",
  })
);
