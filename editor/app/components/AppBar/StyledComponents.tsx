import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Box, Button } from "@mui/material";

export const AppBarContainer = styled(AppBar)(({ theme: _theme }) => ({
  backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8)) !important",
  backdropFilter: "blur(20px) saturate(130%) !important",
  WebkitBackdropFilter: "blur(20px) saturate(130%) !important",
  border: "none !important",
  borderRadius: "var(--glass-border-radius, 16px) !important",
  boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15)) !important",
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
  pointerEvents: "auto", // Allow interactions with the app bar
  "& .MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
  "&.MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
  "&.MuiAppBar-root": {
    backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8)) !important",
    backdropFilter: "blur(20px) saturate(130%) !important",
    WebkitBackdropFilter: "blur(20px) saturate(130%) !important",
    border: "none !important",
    borderRadius: "var(--glass-border-radius, 16px) !important",
    boxShadow: "var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.15)) !important",
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
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
    pointerEvents: "none",
    zIndex: -1,
  },
  /* Dark mode gradient overlay */
  "html.dark &::before": {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
  },
}));

export const ToolbarContainer = styled(Toolbar)(() => ({
  minHeight: "64px !important",
  padding: "0 16px !important",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "transparent !important",
  color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95)) !important",
  "&.MuiToolbar-root": {
    backgroundColor: "transparent !important",
    color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95)) !important",
  },
  "& .MuiPaper-root": {
    backgroundColor: "transparent !important",
  },
}));

export const LeftSection = styled(Box)(({ theme: _theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: _theme.spacing(1),
  color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
}));

export const RightSection = styled(Box)(({ theme: _theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: _theme.spacing(1),
  color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
}));

export const MinimalButton = styled(Button)(({ theme: _theme }) => ({
  backgroundColor: "transparent",
  color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
  border: "none",
  padding: "4px 8px",
  minWidth: "64px",
  width: "64px",
  flexDirection: "column",
  gap: "2px",
  "& .MuiButton-startIcon": {
    margin: 0,
  },
  "& .MuiButton-endIcon": {
    margin: 0,
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
  },
  "&.Mui-disabled": {
    color: "var(--glass-text-secondary, rgba(15, 23, 42, 0.5))",
  },
}));

export const MinimalButtonActive = styled(MinimalButton)<{ active?: boolean }>(
  ({ theme: _theme, active }) => ({
    color: active
      ? "var(--glass-text-primary, rgba(15, 23, 42, 0.95))"
      : "var(--glass-text-secondary, rgba(15, 23, 42, 0.7))",
    "&:hover": {
      color: "var(--glass-text-primary, rgba(15, 23, 42, 0.95))",
    },
  })
);

export const NavigationButton = styled(MinimalButton)(() => ({
  minWidth: "64px",
  width: "64px",
}));
