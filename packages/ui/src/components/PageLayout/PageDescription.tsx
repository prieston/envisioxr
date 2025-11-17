import React from "react";
import { Typography } from "@mui/material";

export interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Optional page description component.
 * Displays concise secondary text below the page title.
 * Should be kept to 1 line for most cases.
 */
export const PageDescription: React.FC<PageDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <Typography
      variant="body2"
      className={className}
      sx={{
        fontSize: "0.875rem",
        color: "rgba(255, 255, 255, 0.6)",
        mt: 1,
        lineHeight: 1.5,
      }}
    >
      {children}
    </Typography>
  );
};

