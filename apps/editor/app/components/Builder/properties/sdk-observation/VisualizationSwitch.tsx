import React from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";

interface VisualizationSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const VisualizationSwitch: React.FC<VisualizationSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : theme.palette.common.white,
        borderRadius: "4px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      })}
    >
      <FormControlLabel
        control={
          <Switch
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            sx={(theme) => ({
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: theme.palette.primary.main,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: theme.palette.primary.main,
              },
            })}
          />
        }
        label={label}
        sx={(theme) => ({
          margin: 0,
          padding: "8.5px 14px",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          "& .MuiFormControlLabel-label": {
            fontSize: "0.75rem",
            fontWeight: 400,
            color: theme.palette.text.secondary,
            flex: 1,
          },
        })}
        labelPlacement="start"
      />
    </Box>
  );
};

