import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export interface RightPanelContainerProps {
  previewMode: boolean;
}

export const RightPanelContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<RightPanelContainerProps>(({ theme, previewMode }) => ({
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
  transition: "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
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
}));

export const TabPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  paddingBottom: theme.spacing(2),
  maxHeight: "calc(100vh - 200px)",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(11, 28, 129, 0.3)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(11, 28, 129, 0.5)",
    },
  },
}));

