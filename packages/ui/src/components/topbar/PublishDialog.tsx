import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { modalPaperStyles, modalTitleStyles, modalTitleTextStyles } from "../../styles/modalStyles";

export interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function PublishDialog({
  open,
  onClose,
  onConfirm,
  title = "Publish",
  description = "Are you sure you want to publish?",
  confirmLabel = "Publish",
  cancelLabel = "Cancel",
}: PublishDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
    } finally {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: modalPaperStyles,
      }}
    >
      <DialogTitle sx={modalTitleStyles}>
        <Typography sx={modalTitleTextStyles}>{title}</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        <Button onClick={handleConfirm} color="primary" variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
