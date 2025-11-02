"use client";

import React from "react";
import { Typography, Button, ButtonProps } from "@mui/material";

interface ActionButtonProps extends Omit<ButtonProps, "children"> {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Generic action button component for toolbar actions
 * Styled consistently for builder/editor interfaces
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  ...buttonProps
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        minWidth: 56,
        padding: "8px 12px",
        color: "var(--glass-text-secondary, #646464)",
        "&:hover": {
          backgroundColor: "rgba(95, 136, 199, 0.1)",
          color: "var(--glass-text-primary, #6B9CD8)",
        },
        "&.Mui-disabled": {
          color: "var(--glass-text-disabled, #9ca3af)",
        },
        ...buttonProps.sx,
      }}
      {...buttonProps}
    >
      {icon}
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 400,
          letterSpacing: "0.01em",
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Button>
  );
};

