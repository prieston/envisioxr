import { alpha, styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type { ButtonProps } from "@mui/material/Button";

export const ViewModeSection: React.FC<BoxProps & { previewMode: boolean }> =
  styled(Box, {
    shouldForwardProp: (prop) => prop !== "previewMode",
  })<{ previewMode: boolean }>(({ theme, previewMode }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    height: "100%",
    pointerEvents: previewMode ? "none" : "auto",
    opacity: previewMode ? 0.5 : 1,
    filter: previewMode ? "grayscale(100%)" : "none",
    transition: "opacity 0.15s ease, filter 0.15s ease",
  }));

export const ViewModeRow: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

export const ViewModeButton: React.FC<ButtonProps> = styled(Button)(
  ({ theme }) => ({
    minWidth: 40,
    height: 40,
    padding: theme.spacing(0.5),
    borderRadius: "8px", // Design system: 8px for clickable items
    backgroundColor: "transparent",
    color: "rgba(51, 65, 85, 0.7)", // Design system color
    border: "none",
    boxShadow: "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
      color: theme.palette.primary.main,
    },
    "&.active": {
      backgroundColor: alpha(theme.palette.primary.main, 0.16),
      color: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
      },
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.2rem",
    },
  })
);
