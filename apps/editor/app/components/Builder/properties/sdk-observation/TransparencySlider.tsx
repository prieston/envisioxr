import React from "react";
import { Box, Typography, Slider } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface TransparencySliderProps {
  value: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}

export const TransparencySlider: React.FC<TransparencySliderProps> = ({
  value,
  onDragStart,
  onDragEnd,
  onChange,
  onCommit,
}) => {
  // Convert 0-1 opacity to 0-100 percentage for display
  const percentage = Math.round(value * 100);

  return (
    <Box>
      <Typography
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "rgba(100, 116, 139, 0.8)",
          mb: 0.5,
        }}
      >
        Viewshed Transparency: {percentage}%
      </Typography>
      <Slider
        value={value}
        min={0}
        max={1}
        step={0.01}
        onPointerDown={onDragStart}
        onChange={(_, val) => {
          const next = Number(val);
          onChange(next);
        }}
        onPointerUp={onDragEnd}
        onPointerCancel={onDragEnd}
        onChangeCommitted={(_, val) => {
          onDragEnd();
          const next = Number(val);
          onCommit(next);
        }}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${Math.round(val * 100)}%`}
        sx={(theme) => ({
          color: theme.palette.primary.main,
          height: 4,
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
            "&:hover, &.Mui-focusVisible": {
              boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
            },
          },
          "& .MuiSlider-track": {
            border: "none",
          },
          "& .MuiSlider-rail": {
            opacity: theme.palette.mode === "dark" ? 0.4 : 0.3,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.25)
                : "rgba(100, 116, 139, 0.3)",
          },
        })}
      />
    </Box>
  );
};

