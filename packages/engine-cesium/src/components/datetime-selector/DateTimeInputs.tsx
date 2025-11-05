import React from "react";
import { Box, FormControl, TextField, Select, MenuItem } from "@mui/material";
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
  return (
    <Box sx={{ mb: 1.5 }}>
      <InputSectionTitle>Set Date & Time</InputSectionTitle>
      <DateTimeContainer>
        <FormControl fullWidth size="small">
          <TextField
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={disabled || locked}
            size="small"
            sx={textFieldStyles}
          />
        </FormControl>

        <FormControl fullWidth size="small">
          <TextField
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={disabled || locked}
            size="small"
            sx={textFieldStyles}
          />
        </FormControl>
      </DateTimeContainer>

      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <Select
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

