import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  assetName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  assetName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: (theme) => ({
          borderRadius: "4px",
          padding: "8px",
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
              : "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }),
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          fontSize: "1rem",
          fontWeight: 600,
          color: theme.palette.text.primary,
          pb: 1,
        })}
      >
        Confirm Deletion
      </DialogTitle>
      <DialogContent>
        <Typography
          sx={(theme) => ({
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            lineHeight: 1.5,
          })}
        >
          Are you sure you want to delete &quot;<strong>{assetName}</strong>&quot;? This
          action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          onClick={onCancel}
          sx={(theme) => ({
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 500,
            borderRadius: "4px",
            color: theme.palette.text.secondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(100, 116, 139, 0.12)"
                  : "rgba(100, 116, 139, 0.08)",
              boxShadow: "none",
            },
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 500,
            borderRadius: "4px",
            backgroundColor: "#ef4444",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#dc2626",
              boxShadow: "none",
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

