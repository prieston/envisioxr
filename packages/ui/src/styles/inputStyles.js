/**
 * Standardized Input Styles for Design System
 *
 * Use these styles across all TextField, Select, and Input components
 * to ensure consistency with the design system.
 */
/**
 * Standard TextField/OutlinedInput styles
 *
 * Usage:
 * <TextField sx={textFieldStyles} />
 */
export const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
        minHeight: "38px",
        borderRadius: "8px",
        backgroundColor: "#ffffff", // ✅ Pure white background
        fontSize: "0.75rem", // 12px - input text
        fontWeight: 400,
        "& input": {
            padding: "8.5px 14px", // Standard input padding
        },
        "& textarea": {
            padding: "8.5px 14px",
        },
        "& fieldset": {
            borderColor: "rgba(226, 232, 240, 0.8)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(37, 99, 235, 0.4)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#2563eb",
            borderWidth: "2px",
        },
    },
    "& .MuiInputLabel-root": {
        fontSize: "0.75rem", // 12px
        fontWeight: 500,
        "&.Mui-focused": {
            color: "#2563eb",
        },
    },
};
/**
 * Standard Select/Dropdown styles
 *
 * Usage:
 * <Select sx={selectStyles} />
 */
export const selectStyles = {
    minHeight: "38px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // ✅ Pure white background
    fontSize: "0.75rem", // 12px - dropdown text
    fontWeight: 400,
    "& .MuiSelect-select": {
        padding: "8.5px 14px", // Standard input padding
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(226, 232, 240, 0.8)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(37, 99, 235, 0.4)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#2563eb",
        borderWidth: "2px",
    },
};
/**
 * Menu item styles for Select dropdowns
 *
 * Usage:
 * <MenuItem sx={menuItemStyles}>Option</MenuItem>
 */
export const menuItemStyles = {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    padding: "8px 14px",
    "&.Mui-selected": {
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.12)",
        },
    },
    "&:hover": {
        backgroundColor: "rgba(37, 99, 235, 0.08)",
    },
};
/**
 * Standard Input (non-outlined) styles for search/basic inputs
 *
 * Usage:
 * <Input sx={inputStyles} />
 */
export const inputStyles = {
    minHeight: "38px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // ✅ Pure white background
    border: "1px solid rgba(226, 232, 240, 0.8)",
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    padding: "8.5px 14px",
    transition: "border-color 0.15s ease",
    "&:hover": {
        borderColor: "rgba(37, 99, 235, 0.4)",
    },
    "&.Mui-focused": {
        borderColor: "#2563eb",
        borderWidth: "2px",
        padding: "7.5px 13px", // Adjust for thicker border
    },
    "&::before, &::after": {
        display: "none", // Remove default MUI Input underline
    },
};
/**
 * Standard Switch/Checkbox label styles
 *
 * Usage:
 * <FormControlLabel label={<Typography sx={switchLabelStyles}>Label</Typography>} />
 */
export const switchLabelStyles = {
    fontSize: "0.75rem", // 12px
    fontWeight: 400,
    color: "rgba(51, 65, 85, 0.9)",
};
//# sourceMappingURL=inputStyles.js.map