import { styled } from "@mui/material/styles";
import { Box, IconButton } from "@mui/material";

export const ControlSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  height: "100%",
}));

export const StyledIconButton = styled(IconButton)(() => ({
  minWidth: 40,
  height: 40,
  borderRadius: 0,
  backgroundColor: "transparent",
  color: "inherit",
  border: "none",
  boxShadow: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
}));
