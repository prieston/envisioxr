import React from "react";
import { Box, Typography, Slider } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface VisibilityRadiusSliderProps {
  value: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}

export const VisibilityRadiusSlider: React.FC<VisibilityRadiusSliderProps> = ({
  value,
  onDragStart,
  onDragEnd,
  onChange,
  onCommit,
}) => {
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
        Visibility Radius: {value}m
      </Typography>
      <Slider
        value={value}
        min={10}
        max={2500}
        step={10}
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

