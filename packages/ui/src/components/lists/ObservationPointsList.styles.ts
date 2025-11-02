import { styled, alpha } from "@mui/material/styles";
import { Box, ListItem, IconButton } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type { ListItemProps } from "@mui/material/ListItem";
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
      background:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.08)
          : "rgba(95, 136, 199, 0.05)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.24)
          : "rgba(95, 136, 199, 0.2)",
      borderRadius: "4px",
      border: "2px solid transparent",
      backgroundClip: "padding-box",
      transition: "background 0.2s ease",
      "&:hover": {
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.38)
            : "rgba(95, 136, 199, 0.35)",
        backgroundClip: "padding-box",
      },
    },
  }));

// List item for horizontal layout (card-like)
export const ObservationListItem: React.FC<
  ListItemProps & { selected: boolean }
> = styled(ListItem)<{ selected: boolean }>(({ theme, selected }) => ({
  cursor: "pointer",
  borderRadius: "8px", // Design system: 8px for clickable items
  padding: theme.spacing(1, 1.5),
  width: "140px", // Fixed width for horizontal cards
  minWidth: "140px",
  maxWidth: "140px",
  height: "100%",
  flexShrink: 0, // Don't shrink in horizontal layout
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.18)
    : theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : "rgba(248, 250, 252, 0.6)",
  border: "1px solid",
  borderColor: selected
    ? alpha(theme.palette.primary.main, 0.3)
    : theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(255, 255, 255, 0.08)",
  color: selected
    ? theme.palette.primary.main
    : theme.palette.mode === "dark"
      ? theme.palette.text.primary
      : "rgba(51, 65, 85, 0.95)",
  transition:
    "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.24)
      : theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.12)
        : "rgba(248, 250, 252, 0.9)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
    color: theme.palette.primary.main,
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
    minHeight: "52px",
    maxWidth: "140px",
    height: "100%",
    flexShrink: 0,
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.background.paper
        : "rgba(248, 250, 252, 0.6)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255, 255, 255, 0.08)"
        : "1px solid rgba(255, 255, 255, 0.08)",
    color:
      theme.palette.mode === "dark"
        ? theme.palette.text.secondary
        : "rgba(51, 65, 85, 0.7)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    transition:
      "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      borderColor: alpha(theme.palette.primary.main, 0.3),
      color: theme.palette.primary.main,
    },
  })
);
