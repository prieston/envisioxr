import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { showToast } from "@/app/utils/toastUtils";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const PublishDialog: React.FC<PublishDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      showToast("World published successfully!");
    } catch (error) {
      console.error("Error publishing world:", error);
      showToast("Error publishing world.");
    } finally {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Publish World</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to publish this world? It will be publicly
          available.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} color="primary">
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
