import { styled } from "@mui/material/styles";
import { Card, CardContent, Box } from "@mui/material";

export const GlassCard = styled(Card)(({ theme: _theme }) => ({
  width: 300,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  position: "relative",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  border: "2px dashed rgba(37, 99, 235, 0.3)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(37, 99, 235, 0.15)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
    background: "rgba(37, 99, 235, 0.08)",
  },
  "&.selected": {
    background: "rgba(37, 99, 235, 0.15)",
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

export const StyledCardContent = styled(CardContent)(({ theme: _theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: _theme.spacing(1),
  position: "relative",
  zIndex: 1,
}));

export const AddIconWrapper = styled(Box)(({ theme: _theme }) => ({
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: "#2563eb",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",
  zIndex: 2,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#2563eb",
    boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)",
    "&::before": {
      transform: "scale(1)",
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(37, 99, 235, 0.2), transparent)",
    transform: "scale(0)",
    transition: "transform 0.3s ease",
  },
}));

