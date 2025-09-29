import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const BannerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ open }) => ({
  width: "100%",
  maxHeight: open ? "200px" : "0px",
  overflow: "hidden",
  backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.8))",
  backdropFilter: "blur(20px) saturate(130%)",
  WebkitBackdropFilter: "blur(20px) saturate(130%)",
  border: "1px solid var(--glass-border, rgba(37, 99, 235, 0.3))",
  borderRadius: "16px",
  boxShadow: "var(--glass-shadow, 0 8px 32px rgba(37, 99, 235, 0.15))",
  marginBottom: "24px",
  transition: "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
  opacity: open ? 1 : 0,
  position: "relative",
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

export const BannerContent = styled(Box)(() => ({
  padding: "20px 24px",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
}));

export const BannerText = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}));

export const BannerActions = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "8px",
}));


