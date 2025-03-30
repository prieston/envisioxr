import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Box, Button } from "@mui/material";

export const AppBarContainer = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#121212",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "none",
  zIndex: 1200,
  "& .MuiPaper-root": {
    backgroundColor: "#121212",
    "--Paper-overlay": "none !important",
  },
  "&.MuiPaper-root": {
    backgroundColor: "#121212",
    "--Paper-overlay": "none !important",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "1px",
    background:
      "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)",
  },
}));

export const ToolbarContainer = styled(Toolbar)(({ theme }) => ({
  minHeight: "64px !important",
  padding: "0 16px !important",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const LeftSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const RightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const MinimalButton = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
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
    color: theme.palette.text.primary,
  },
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.3)",
  },
}));

export const MinimalButtonActive = styled(MinimalButton)<{ active?: boolean }>(
  ({ theme, active }) => ({
    color: active ? theme.palette.text.primary : theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.text.primary,
    },
  })
);

export const NavigationButton = styled(MinimalButton)(({ theme }) => ({
  minWidth: "64px",
  width: "64px",
}));
