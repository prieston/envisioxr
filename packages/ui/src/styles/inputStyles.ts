/**
 * Standardized Input Styles for Design System
 *
 * Use these styles across all TextField, Select, and Input components
 * to ensure consistency with the design system.
 */

import { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * Standard TextField/OutlinedInput styles
 *
 * Usage:
 * <TextField sx={textFieldStyles} />
 */
export const textFieldStyles: SxProps<Theme> = (theme) => ({
  "& .MuiOutlinedInput-root": {
    minHeight: "38px",
    borderRadius: "4px",
    backgroundColor:
      theme.palette.mode === "dark"
        ? "#14171A"
        : theme.palette.common.white,
    fontSize: "0.75rem",
    fontWeight: 400,
    boxShadow: "none",
    "& input": {
      padding: "8.5px 14px",
    },
    "& textarea": {
      padding: "8.5px 14px",
    },
    "& fieldset": {
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(255, 255, 255, 0.08)",
      borderRadius: "4px",
    },
    "&:hover fieldset": {
      borderColor:
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.5)
          : "rgba(95, 136, 199, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
});

/**
 * Standard Select/Dropdown styles
 *
 * Usage:
 * <Select sx={selectStyles} />
 */
export const selectStyles: SxProps<Theme> = (theme) => ({
  minHeight: "38px",
  borderRadius: "4px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "#14171A"
      : theme.palette.common.white,
  fontSize: "0.75rem",
  fontWeight: 400,
  boxShadow: "none",
  "& .MuiSelect-select": {
    padding: "8.5px 14px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.08)",
    borderRadius: "4px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.5)
        : "rgba(95, 136, 199, 0.4)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
});

/**
 * Menu item styles for Select dropdowns
 *
 * Usage:
 * <MenuItem sx={menuItemStyles}>Option</MenuItem>
 */
export const menuItemStyles: SxProps<Theme> = (theme) => ({
  fontSize: "0.75rem",
  fontWeight: 400,
  padding: "8px 14px",
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.18),
    },
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
});

/**
 * Standard Input (non-outlined) styles for search/basic inputs
 *
 * Usage:
 * <Input sx={inputStyles} />
 */
export const inputStyles: SxProps<Theme> = (theme) => ({
  minHeight: "38px",
  borderRadius: "4px",
  backgroundColor:
    theme.palette.mode === "dark"
      ? "#14171A"
      : theme.palette.common.white,
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.08)"
      : "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "0.75rem",
  fontWeight: 400,
  padding: "8.5px 14px",
  transition: "border-color 0.15s ease",
  color: theme.palette.text.primary,
  boxShadow: "none",
  "&:hover": {
    borderColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.5)
        : "rgba(95, 136, 199, 0.4)",
  },
  "&.Mui-focused": {
    borderColor: theme.palette.primary.main,
  },
  "&::before, &::after": {
    display: "none",
  },
});

/**
 * Standard Switch/Checkbox label styles
 *
 * Usage:
 * <FormControlLabel label={<Typography sx={switchLabelStyles}>Label</Typography>} />
 */
export const switchLabelStyles: SxProps<Theme> = (theme) => ({
  fontSize: "0.75rem",
  fontWeight: 400,
  color: theme.palette.text.secondary,
});
