import React from "react";
import { Box, Typography, Select, MenuItem } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { selectStyles, menuItemStyles } from "@envisio/ui";

interface SensorTypeSelectorProps {
  value: "cone" | "rectangle";
  onChange: (value: "cone" | "rectangle") => void;
  onFovDefaults?: (fovH: number, fovV: number) => void;
}

export const SensorTypeSelector: React.FC<SensorTypeSelectorProps> = ({
  value,
  onChange,
  onFovDefaults,
}) => {
  return (
    <Box>
      <Typography
        sx={(theme) => ({
          fontSize: "0.75rem",
          fontWeight: 500,
          color:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.text.secondary, 0.9)
              : "rgba(100, 116, 139, 0.8)",
          mb: 0.75,
        })}
      >
        Sensor Type
      </Typography>
      <Select
        value={value}
        onChange={(e) => {
          const sensorType = e.target.value as "cone" | "rectangle";
          onChange(sensorType);
          if (onFovDefaults) {
            const fov = sensorType === "cone" ? 60 : 60;
            const fovV = sensorType === "cone" ? undefined : Math.round(fov * 0.6);
            onFovDefaults(fov, fovV ?? fov);
          }
        }}
        fullWidth
        size="small"
        sx={selectStyles}
      >
        <MenuItem value="cone" sx={menuItemStyles}>
          Cone
        </MenuItem>
        <MenuItem value="rectangle" sx={menuItemStyles}>
          Rectangle
        </MenuItem>
      </Select>
    </Box>
  );
};

