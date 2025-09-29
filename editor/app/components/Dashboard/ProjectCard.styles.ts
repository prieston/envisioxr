import { styled } from "@mui/material/styles";
import { Card, Typography, Button, IconButton, Chip } from "@mui/material";

export const GlassCard = styled(Card)(({ theme: _theme }) => ({
  width: 300,
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  border: "1px solid rgba(37, 99, 235, 0.3)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
    background: "rgba(37, 99, 235, 0.1)",
    "& .action-button::after": {
      width: "100%",
    },
  },
  "&.selected": {
    background: "rgba(37, 99, 235, 0.12)",
    borderColor: "#2563eb",
    boxShadow:
      "0 20px 25px -5px rgba(37, 99, 235, 0.15), 0 10px 10px -5px rgba(37, 99, 235, 0.06), 0 0 0 2px rgba(37, 99, 235, 0.2)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)",
    opacity: 0,
    transform: "scale(0.95)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
    zIndex: 1,
  },
  "&:hover::before": {
    opacity: 1,
    transform: "scale(1)",
  },
}));

export const CardTitle = styled(Typography)(({ theme: _theme }) => ({
  fontWeight: 600,
  marginBottom: _theme.spacing(1),
  color: _theme.palette.text.primary,
}));

export const CardDescription = styled(Typography)(({ theme: _theme }) => ({
  color: _theme.palette.text.secondary,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
}));

export const ActionButton = styled(Button)(({ theme: _theme }) => ({
  color: "#2563eb",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  textTransform: "none",
  fontWeight: 500,
  position: "relative",
  overflow: "hidden",
  padding: "16px 0px 5px",
  borderRadius: "0px",
  "&:hover": {
    background: "transparent",
    boxShadow: "none",
    color: "#2563eb",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: "1px",
    background: "#2563eb",
    transition: "width 0.3s ease",
  },
}));

export const MenuButton = styled(IconButton)(({ theme: _theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  color: _theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    color: _theme.palette.text.primary,
  },
}));

export const EngineChip = styled(Chip)({
  position: "absolute",
  top: 8,
  left: 8,
  fontSize: "0.7rem",
  height: "20px",
  "& .MuiChip-label": {
    padding: "0 6px",
  },
});

export const ThreeJsChip = styled(EngineChip)(({ theme: _theme }) => ({
  backgroundColor: "rgba(245, 158, 11, 0.15)",
  color: "#f59e0b",
  border: "1px solid rgba(245, 158, 11, 0.4)",
}));

export const CesiumChip = styled(EngineChip)(({ theme: _theme }) => ({
  backgroundColor: "rgba(99, 102, 241, 0.15)",
  color: "#6366f1",
  border: "1px solid rgba(99, 102, 241, 0.4)",
}));


