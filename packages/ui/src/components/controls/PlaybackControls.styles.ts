import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";
import type { BoxProps } from "@mui/material/Box";
import type { IconButtonProps } from "@mui/material/IconButton";

export const ControlSection: React.FC<BoxProps> = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  height: "100%",
}));

export const StyledIconButton: React.FC<IconButtonProps> = styled(IconButton)(
  () => ({
    minWidth: 40,
    height: 40,
    borderRadius: "8px", // Design system: 8px for clickable items
    backgroundColor: "transparent",
    color: "rgba(51, 65, 85, 0.7)", // Design system color
    border: "none",
    boxShadow: "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
    "&:hover": {
      backgroundColor: "rgba(37, 99, 235, 0.08)", // Blue tint on hover
      color: "#2563eb",
    },
    "&.active": {
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      color: "#2563eb",
      "&:hover": {
        backgroundColor: "rgba(37, 99, 235, 0.16)",
      },
    },
    "&:disabled": {
      backgroundColor: "transparent",
      color: "rgba(51, 65, 85, 0.4)",
      opacity: 0.5,
      cursor: "not-allowed",
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
  })
);
