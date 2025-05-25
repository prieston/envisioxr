import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";

interface AddTilesDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTiles: (apiKey: string) => void;
}

const AddTilesDialog: React.FC<AddTilesDialogProps> = ({
  open,
  onClose,
  onAddTiles,
}) => {
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = () => {
    onAddTiles(apiKey);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Google Photorealistic Tiles</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Google Maps API Key"
            type="password"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Tiles
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTilesDialog;
