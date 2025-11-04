import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import type { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import type { ComponentType } from "react";

export interface ViewModeSectionProps extends BoxProps {
  previewMode: boolean;
}
const ViewModeSectionRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "previewMode",
})<ViewModeSectionProps>(({ theme, previewMode }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  pointerEvents: previewMode ? "none" : "auto",
  opacity: previewMode ? 0.5 : 1,
  filter: previewMode ? "grayscale(100%)" : "none",
  transition: "opacity 0.15s ease, filter 0.15s ease",
}));
export const ViewModeSection: ComponentType<ViewModeSectionProps> =
  ViewModeSectionRoot;

export type ViewModeRowProps = BoxProps;
const ViewModeRowRoot = styled(Box)<ViewModeRowProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));
export const ViewModeRow: ComponentType<ViewModeRowProps> = ViewModeRowRoot;

export type ViewModeButtonProps = ButtonProps;
const ViewModeButtonRoot = styled(Button)<ViewModeButtonProps>(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.active": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.2rem",
  },
}));
export const ViewModeButton: ComponentType<ViewModeButtonProps> =
  ViewModeButtonRoot;
