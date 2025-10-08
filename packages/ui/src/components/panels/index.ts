import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type React from "react";

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
      backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.85))",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
      padding: theme.spacing(2.5),
      border: "1px solid rgba(37, 99, 235, 0.15)",
      borderRadius: "var(--glass-border-radius, 20px)",
      boxShadow:
        "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
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
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "inherit",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)",
        pointerEvents: "none",
        zIndex: -1,
      },
      "&:hover": {
        borderColor: "rgba(37, 99, 235, 0.25)",
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
      backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
      backdropFilter: "blur(20px) saturate(130%)",
      WebkitBackdropFilter: "blur(20px) saturate(130%)",
      color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
      padding: theme.spacing(2),
      border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
      borderRadius: "var(--glass-border-radius, 16px)",
      boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
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
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "inherit",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        pointerEvents: "none",
        zIndex: -1,
      },
    })
  );

export const TabPanel: React.FC<BoxProps> = styled(Box)(
  ({ theme }: { theme: any }) => ({
    flex: 1,
    overflow: "auto",
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(0.5),
    maxHeight: "calc(100vh - 200px)",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(37, 99, 235, 0.05)",
      borderRadius: "4px",
      margin: "4px 0",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(37, 99, 235, 0.2)",
      borderRadius: "4px",
      border: "2px solid transparent",
      backgroundClip: "padding-box",
      transition: "background 0.2s ease",
      "&:hover": {
        background: "rgba(37, 99, 235, 0.35)",
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
    backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
    backdropFilter: "blur(20px) saturate(130%)",
    WebkitBackdropFilter: "blur(20px) saturate(130%)",
    padding: _theme.spacing(2),
    display: "flex",
    alignItems: "stretch", // Allow sections to stretch to full height
    gap: _theme.spacing(2),
    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
    borderRadius: "16px",
    boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
    userSelect: "none",
    pointerEvents: "auto",
    position: "relative",
    zIndex: 1400,
    transform: "translateZ(0)",
    willChange: "backdrop-filter",
    transition: "border-color 0.15s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      background:
        "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
      pointerEvents: "none",
      zIndex: -1,
    },
  })
);
