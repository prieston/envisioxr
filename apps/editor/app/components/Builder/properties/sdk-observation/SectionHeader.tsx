import React from "react";
import { Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface SectionHeaderProps {
  title: string;
  description: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <>
      <Typography
        sx={(theme) => ({
          fontSize: "0.688rem",
          fontWeight: 600,
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.text.secondary, 0.9)
              : "rgba(51, 65, 85, 0.85)",
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        })}
      >
        {title}
      </Typography>
      <Typography
        sx={(theme) => ({
          fontSize: "0.75rem",
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.text.secondary, 0.9)
              : "rgba(100, 116, 139, 0.7)",
          mb: 1.5,
        })}
      >
        {description}
      </Typography>
    </>
  );
};

