import { styled } from "@mui/material/styles";
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
    transition: "opacity 0.3s ease, filter 0.3s ease",
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
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "inherit",
    border: "none",
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
    "& .MuiSvgIcon-root": {
      fontSize: "1.2rem",
    },
  })
);
