import { styled } from "@mui/material/styles";
import { Box, ListItemButton, IconButton } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import type { IconButtonProps } from "@mui/material/IconButton";

// Container matching SceneObjectsList style
export const ObservationSection: React.FC<BoxProps & { previewMode: boolean }> =
  styled(Box, {
    shouldForwardProp: (prop) => prop !== "previewMode",
  })<{ previewMode: boolean }>(({ theme, previewMode }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(0.5),
    width: "100%",
    height: "100%",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.15s ease, filter 0.15s ease",
    // Custom scrollbar to match design system
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(37, 99, 235, 0.05)",
      borderRadius: "4px",
      margin: "4px 0",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(37, 99, 235, 0.2)",
      borderRadius: "4px",
      border: "2px solid transparent",
      backgroundClip: "padding-box",
      transition: "background 0.2s ease",
      "&:hover": {
        background: "rgba(37, 99, 235, 0.35)",
        backgroundClip: "padding-box",
      },
    },
  }));

// List item matching SceneObjectsList style
export const ObservationListItem: React.FC<ListItemButtonProps> = styled(
  ListItemButton
)(({ theme }) => ({
  borderRadius: "8px", // Design system: 8px for clickable items
  padding: theme.spacing(1, 1.5),
  marginBottom: theme.spacing(0.5),
  backgroundColor: "rgba(248, 250, 252, 0.6)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
  "&:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    borderColor: "rgba(37, 99, 235, 0.3)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.4)",
    color: "#2563eb",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      borderColor: "rgba(37, 99, 235, 0.5)",
    },
  },
  "& .MuiListItemText-primary": {
    fontSize: "0.75rem", // 12px
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
}));

// Add button matching design system
export const AddButton: React.FC<IconButtonProps> = styled(IconButton)(
  ({ theme }) => ({
    borderRadius: "8px",
    padding: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    backgroundColor: "rgba(248, 250, 252, 0.6)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    color: "rgba(51, 65, 85, 0.7)",
    transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      borderColor: "rgba(37, 99, 235, 0.3)",
      color: "#2563eb",
    },
  })
);
