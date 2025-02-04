import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const PublishDialog = ({ open, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Publish World</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to publish this world? It will be publicly
          available.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="primary">
          Publish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
