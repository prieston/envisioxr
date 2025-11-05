import React from "react";
import { Box, FormControl, TextField, Select, MenuItem, useTheme } from "@mui/material";
import {
  DateTimeContainer,
  InputSectionTitle,
  textFieldStyles,
  selectStyles,
  menuItemStyles,
} from "../CesiumDateTimeSelector.styles";

interface DateTimeInputsProps {
  dateValue: string;
  timeValue: string;
  useLocalTime: boolean;
  disabled: boolean;
  locked: boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onTimezoneChange: (useLocal: boolean) => void;
}

export const DateTimeInputs: React.FC<DateTimeInputsProps> = ({
  dateValue,
  timeValue,
  useLocalTime,
  disabled,
  locked,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 1.5 }}>
      <InputSectionTitle>Set Date & Time</InputSectionTitle>
      <DateTimeContainer>
        <FormControl fullWidth size="small">
          <TextField
            id="datetime-date"
            name="datetime-date"
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={disabled || locked}
            size="small"
            sx={textFieldStyles(theme)}
            InputLabelProps={{
              sx: {
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(51, 65, 85, 0.7)",
              },
            }}
          />
        </FormControl>

        <FormControl fullWidth size="small">
          <TextField
            id="datetime-time"
            name="datetime-time"
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={disabled || locked}
            size="small"
            sx={textFieldStyles(theme)}
            InputLabelProps={{
              sx: {
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(51, 65, 85, 0.7)",
              },
            }}
          />
        </FormControl>
      </DateTimeContainer>

      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <Select
          id="datetime-timezone"
          name="datetime-timezone"
          value={useLocalTime ? "local" : "utc"}
          onChange={(e) => onTimezoneChange(e.target.value === "local")}
          disabled={disabled}
          sx={selectStyles}
        >
          <MenuItem value="local" sx={menuItemStyles}>
            Local Time ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </MenuItem>
          <MenuItem value="utc" sx={menuItemStyles}>
            UTC (Coordinated Universal Time)
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

