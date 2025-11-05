"use client";

import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  textFieldStyles,
  selectStyles,
  menuItemStyles,
} from "@envisio/ui";

interface IoTProperties {
  enabled: boolean;
  serviceType: string;
  apiEndpoint: string;
  updateInterval: number;
  showInScene: boolean;
  displayFormat: "compact" | "detailed" | "minimal";
  autoRefresh: boolean;
}

interface IoTDeviceSettingsProps {
  selectedObjectId: string;
  iotProps: IoTProperties;
  onPropertyChange: (property: string, value: unknown) => void;
}

/**
 * IoTDeviceSettings - Handles IoT device configuration UI
 * Extracted from IoTDevicePropertiesPanel for better maintainability
 */
export const IoTDeviceSettings: React.FC<IoTDeviceSettingsProps> = ({
  selectedObjectId,
  iotProps,
  onPropertyChange,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Service Type */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.secondary
                : "rgba(100, 116, 139, 0.8)",
            mb: theme.spacing(1),
          })}
        >
          Service Type
        </Typography>
        <Select
          id="iot-service-type"
          name="iot-service-type"
          value={iotProps.serviceType}
          onChange={(e) => onPropertyChange("serviceType", e.target.value)}
          fullWidth
          size="small"
          sx={selectStyles}
        >
          <MenuItem value="weather" sx={menuItemStyles}>
            Weather Service
          </MenuItem>
          <MenuItem value="custom" sx={menuItemStyles}>
            Custom API
          </MenuItem>
        </Select>
      </Box>

      {/* API Endpoint */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.secondary
                : "rgba(100, 116, 139, 0.8)",
            mb: theme.spacing(1),
          })}
        >
          API Endpoint
        </Typography>
        <TextField
          id="iot-api-endpoint"
          name="iot-api-endpoint"
          fullWidth
          value={iotProps.apiEndpoint}
          onChange={(e) => onPropertyChange("apiEndpoint", e.target.value)}
          size="small"
          disabled={iotProps.serviceType === "weather"}
          sx={textFieldStyles}
        />
      </Box>

      {/* Update Interval */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.secondary
                : "rgba(100, 116, 139, 0.8)",
            mb: theme.spacing(1),
          })}
        >
          Update Interval (ms)
        </Typography>
        <TextField
          id={`iot-update-interval-${selectedObjectId}`}
          name="iot-update-interval"
          fullWidth
          type="number"
          value={iotProps.updateInterval}
          onChange={(e) =>
            onPropertyChange("updateInterval", Number(e.target.value))
          }
          size="small"
          sx={textFieldStyles}
        />
      </Box>

      {/* Auto Refresh Switch */}
      <Box
        sx={(theme) => ({
          backgroundColor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.common.white,
          borderRadius: "4px",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(255, 255, 255, 0.08)",
        })}
      >
        <FormControlLabel
          control={
            <Switch
              id={`iot-auto-refresh-${selectedObjectId}`}
              name="iot-auto-refresh"
              checked={iotProps.autoRefresh}
              onChange={(e) => onPropertyChange("autoRefresh", e.target.checked)}
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
          label="Auto Refresh"
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

      {/* Display Settings Subsection */}
      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{
            fontSize: "0.688rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.85)",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Display Settings
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Show in Scene Switch */}
          <Box
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#14171A"
                  : "rgba(255, 255, 255, 0.92)",
              borderRadius: "4px",
              border:
                theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.05)"
                  : "1px solid rgba(226, 232, 240, 0.8)",
            })}
          >
            <FormControlLabel
              control={
                <Switch
                  id={`iot-show-in-scene-${selectedObjectId}`}
                  name="iot-show-in-scene"
                  checked={iotProps.showInScene}
                  onChange={(e) =>
                    onPropertyChange("showInScene", e.target.checked)
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "var(--color-primary, #6B9CD8)",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "var(--color-primary-600, #4B6FAF)",
                    },
                  }}
                />
              }
              label="Show in 3D Scene"
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

          {/* Display Format */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "rgba(100, 116, 139, 0.8)",
                mb: 0.75,
              }}
            >
              Display Format
            </Typography>
            <Select
              id="iot-display-format"
              name="iot-display-format"
              value={iotProps.displayFormat}
              onChange={(e) =>
                onPropertyChange("displayFormat", e.target.value)
              }
              fullWidth
              size="small"
              sx={selectStyles}
            >
              <MenuItem value="compact" sx={menuItemStyles}>
                Compact
              </MenuItem>
              <MenuItem value="detailed" sx={menuItemStyles}>
                Detailed
              </MenuItem>
              <MenuItem value="minimal" sx={menuItemStyles}>
                Minimal
              </MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

