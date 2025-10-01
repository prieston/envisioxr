import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const ViewModeSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
  backgroundColor: "transparent",
  borderRadius: 0,
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
}));

export const ViewModeRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const ViewModeButton = styled(Button)(({ theme }) => ({
  minWidth: 40,
  height: 40,
  padding: theme.spacing(0.5),
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    color: "inherit",
  },
  "&.active": {
    backgroundColor: "rgba(37, 99, 235, 0.12)",
    color: "#2563eb",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.16)",
    },
  },
}));
