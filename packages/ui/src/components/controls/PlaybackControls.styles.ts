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
    borderRadius: 0,
    backgroundColor: "transparent",
    color: "inherit",
    border: "none",
    boxShadow: "none",
    transition: "background-color 0.15s ease, color 0.15s ease",
    position: "relative",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      color: "inherit",
    },
    "&.active": {
      backgroundColor: "rgba(37, 99, 235, 0.12)",
      color: "#2563eb",
    },
    "&:disabled": {
      backgroundColor: "transparent",
      color: "rgba(0, 0, 0, 0.26)",
      cursor: "not-allowed",
      "&:hover": {
        backgroundColor: "transparent",
        color: "rgba(0, 0, 0, 0.26)",
      },
    },
    "&:not(:last-child)::after": {
      content: '""',
      position: "absolute",
      right: -4,
      top: "50%",
      transform: "translateY(-50%)",
      width: "1px",
      height: "60%",
      background:
        "linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent)",
    },
  })
);
