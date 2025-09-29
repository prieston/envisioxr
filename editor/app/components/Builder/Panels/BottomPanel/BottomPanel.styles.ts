import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export interface BottomPanelContainerProps {
  previewMode: boolean;
}

export const BottomPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<BottomPanelContainerProps>(
  ({ theme: _theme, previewMode: _previewMode }) => ({
    width: "100%",
    height: "120px",
    marginTop: "8px",
    backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
    backdropFilter: "blur(20px) saturate(130%)",
    WebkitBackdropFilter: "blur(20px) saturate(130%)",
    padding: _theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: _theme.spacing(2),
    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.3))",
    borderRadius: "var(--glass-border-radius, 16px)",
    boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15))",
    userSelect: "none",
    pointerEvents: "auto",
    position: "relative",
    zIndex: 1400,
    transform: "translateZ(0)",
    willChange: "backdrop-filter",
    transition:
      "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
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

