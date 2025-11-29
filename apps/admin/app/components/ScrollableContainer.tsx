"use client";

import { Box, BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledScrollableContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  width: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  position: "relative",
  WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
  scrollbarWidth: "thin",
  scrollbarColor: theme.palette.mode === "dark"
    ? "rgba(107, 156, 216, 0.24) rgba(107, 156, 216, 0.08)"
    : "rgba(95, 136, 199, 0.2) rgba(95, 136, 199, 0.05)",
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
    WebkitAppearance: "none",
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.mode === "dark"
      ? "rgba(107, 156, 216, 0.08)"
      : "rgba(95, 136, 199, 0.05)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.mode === "dark"
      ? "rgba(107, 156, 216, 0.24)"
      : "rgba(95, 136, 199, 0.2)",
    borderRadius: "4px",
    border: "2px solid transparent",
    backgroundClip: "padding-box",
    transition: "background 0.2s ease",
    "&:hover": {
      background: theme.palette.mode === "dark"
        ? "rgba(107, 156, 216, 0.38)"
        : "rgba(95, 136, 199, 0.35)",
    },
  },
}));

interface ScrollableContainerProps extends BoxProps {
  children: React.ReactNode;
}

export function ScrollableContainer({ children, ...props }: ScrollableContainerProps) {
  return <StyledScrollableContainer {...props}>{children}</StyledScrollableContainer>;
}

