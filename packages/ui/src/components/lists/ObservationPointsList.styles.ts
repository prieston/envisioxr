import { styled } from "@mui/material/styles";
import { Box, ListItemButton, IconButton } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import type { IconButtonProps } from "@mui/material/IconButton";

// Container for horizontal layout (columns)
export const ObservationSection: React.FC<BoxProps & { previewMode: boolean }> =
  styled(Box, {
    shouldForwardProp: (prop) => prop !== "previewMode",
  })<{ previewMode: boolean }>(({ theme, previewMode }) => ({
    display: "flex",
    flexDirection: "row", // Horizontal layout
    alignItems: "center",
    gap: theme.spacing(1),
    overflowX: "auto", // Horizontal scroll
    overflowY: "hidden",
    padding: theme.spacing(0.5),
    width: "100%",
    height: "100%",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.15s ease, filter 0.15s ease",
    // Custom scrollbar for horizontal scroll
    "&::-webkit-scrollbar": {
      height: "6px", // Horizontal scrollbar
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(37, 99, 235, 0.05)",
      borderRadius: "4px",
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

// List item for horizontal layout (card-like)
export const ObservationListItem: React.FC<ListItemButtonProps> = styled(
  ListItemButton
)(({ theme }) => ({
  borderRadius: "8px", // Design system: 8px for clickable items
  padding: theme.spacing(1, 1.5),
  width: "140px", // Fixed width for horizontal cards
  minWidth: "140px",
  maxWidth: "140px",
  height: "100%",
  flexShrink: 0, // Don't shrink in horizontal layout
  backgroundColor: "rgba(248, 250, 252, 0.6)",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  color: "rgba(51, 65, 85, 0.95)", // Match SceneObjectsList default text color
  transition:
    "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    borderColor: "rgba(37, 99, 235, 0.3)",
    color: "#2563eb", // Match SceneObjectsList hover color
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
    fontSize: "0.875rem", // 14px - match SceneObjectsList
    fontWeight: 600,
    letterSpacing: "0.01em",
    textAlign: "center",
  },
}));

// Add button for horizontal layout
export const AddButton: React.FC<IconButtonProps> = styled(IconButton)(
  ({ theme }) => ({
    borderRadius: "8px",
    padding: theme.spacing(1, 1.5),
    width: "140px",
    minWidth: "140px",
    maxWidth: "140px",
    height: "100%",
    flexShrink: 0,
    backgroundColor: "rgba(248, 250, 252, 0.6)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    color: "rgba(51, 65, 85, 0.7)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      borderColor: "rgba(37, 99, 235, 0.3)",
      color: "#2563eb",
    },
  })
);
