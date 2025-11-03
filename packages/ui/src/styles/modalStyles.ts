import { SxProps, Theme } from "@mui/material";

/**
 * Standardized Modal/Dialog Styles for Design System
 *
 * Use these styles across all Dialog components to ensure consistency.
 */

/**
 * Standard Dialog PaperProps sx styles
 *
 * Usage:
 * <Dialog
 *   open={open}
 *   onClose={onClose}
 *   PaperProps={{ sx: modalPaperStyles }}
 * >
 */
export const modalPaperStyles: SxProps<Theme> = (theme) => ({
  borderRadius: "4px",
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
      : "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

/**
 * Standard Dialog Title sx styles
 *
 * Usage:
 * <DialogTitle sx={modalTitleStyles}>
 */
export const modalTitleStyles: SxProps<Theme> = (theme) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  padding: "24px",
  backgroundColor: theme.palette.background.paper,
});

/**
 * Standard Dialog Title Typography sx styles
 *
 * Usage:
 * <Typography sx={modalTitleTextStyles}>
 */
export const modalTitleTextStyles: SxProps<Theme> = (theme) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
});

/**
 * Standard Close Button sx styles for modals
 *
 * Usage:
 * <IconButton sx={modalCloseButtonStyles}>
 */
export const modalCloseButtonStyles: SxProps<Theme> = (theme) => ({
  color: "rgba(100, 116, 139, 0.8)",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(107, 156, 216, 0.12)"
        : "rgba(107, 156, 216, 0.08)",
  },
});
