import { styled } from "@mui/material/styles";
import { Box, Card } from "@mui/material";

export const ObservationSection = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<{ previewMode: boolean }>(({ theme, previewMode }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  overflowX: "auto",
  overflowY: "hidden",
  padding: theme.spacing(0.5),
  width: "100%",
  minWidth: 0,
  flexShrink: 1,
  maxWidth: "calc(100vw - 400px)",
  height: "100%",
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.3s ease, filter 0.3s ease",
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": {
    height: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(37, 99, 235, 0.3)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(37, 99, 235, 0.5)",
    },
  },
}));

export const ObservationCard = styled(Card)(() => ({
  minWidth: 120,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  borderRadius: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  padding: 0,
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  boxShadow: "none",
  transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:not(:last-child)::after": {
    content: '""',
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "1px",
    height: "60%",
    background:
      "linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.2), transparent)",
  },
  "&:hover": {
    color: "#2563eb",
  },
  "&.selected": {
    color: "#2563eb",
    "&:hover": {
      color: "#2563eb",
    },
  },
}));


