import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Box, Button } from "@mui/material";

export const AppBarContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(17, 19, 23, 0.9) !important"
      : "#14171A !important",
  backdropFilter: "blur(20px) saturate(50%) !important",
  WebkitBackdropFilter: "blur(20px) saturate(50%) !important",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.08) !important"
      : "none !important",
  borderRadius: "4px !important",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 3px 12px rgba(0, 0, 0, 0.35) !important"
      : "0 8px 32px rgba(0, 0, 0, 0.15) !important",
  zIndex: 1300,
  position: "fixed",
  top: "16px",
  left: "16px",
  right: "16px",
  width: "calc(100% - 32px)",
  marginBottom: "8px",
  transform: "translateZ(0)",
  willChange: "backdrop-filter",
  transition: "opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  pointerEvents: "auto",
  "& .MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
  "&.MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "inherit",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)"
        : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    pointerEvents: "none",
    zIndex: -1,
  },
}));

export const ToolbarContainer = styled(Toolbar)(({ theme }) => ({
  minHeight: "64px !important",
  padding: "0 16px !important",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "transparent !important",
  color:
    theme.palette.mode === "dark"
      ? "#ffffff !important"
      : "rgba(15, 23, 42, 0.95) !important",
  "&.MuiToolbar-root": {
    backgroundColor: "transparent !important",
    color:
      theme.palette.mode === "dark"
        ? "#ffffff !important"
        : "rgba(15, 23, 42, 0.95) !important",
  },
  "& .MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
}));

export const LeftSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color:
    theme.palette.mode === "dark" ? "#ffffff" : "rgba(15, 23, 42, 0.95)",
}));

export const RightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color:
    theme.palette.mode === "dark" ? "#ffffff" : "rgba(15, 23, 42, 0.95)",
}));

export const MinimalButton = styled(Button)<{ active?: boolean }>(
  ({ theme: _theme, active }) => ({
    backgroundColor: active
      ? "rgba(59, 130, 246, 0.12)" // Blue background when active
      : "transparent",
    color: active
      ? "var(--glass-text-primary, #6B9CD8)"
      : "rgba(51, 65, 85, 0.7)",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px", // Balanced padding
    minWidth: "52px",
    height: "42px", // Fixed height
    minHeight: "42px",
    maxHeight: "42px",
    width: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px", // Space between icon and text
    transition: "background-color 0.15s ease, color 0.15s ease",
    fontSize: "1.25rem",
    fontWeight: 400,
    "& .MuiButton-startIcon": {
      margin: 0,
    },
    "& .MuiButton-endIcon": {
      margin: 0,
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.1rem", // Icon size
    },
    "&:hover": {
      backgroundColor: active
        ? "rgba(59, 130, 246, 0.16)" // Darker blue on hover when active
        : "rgba(59, 130, 246, 0.08)", // Light blue on hover when inactive
      color: "var(--glass-text-primary, #6B9CD8)",
    },
    "&.Mui-disabled": {
      color: "rgba(51, 65, 85, 0.4)",
      opacity: 0.5,
    },
  })
);

export const NavigationButton = styled(MinimalButton)(() => ({
  minWidth: "52px",
  width: "auto",
}));
