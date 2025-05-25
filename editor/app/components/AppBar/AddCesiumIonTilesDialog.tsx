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

interface AddCesiumIonTilesDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTiles: (apiKey: string, assetId: string) => void;
}

const AddCesiumIonTilesDialog: React.FC<AddCesiumIonTilesDialogProps> = ({
  open,
  onClose,
  onAddTiles,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [assetId, setAssetId] = useState("");

  const handleSubmit = () => {
    onAddTiles(apiKey, assetId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Cesium Ion Tiles</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Cesium Ion API Key"
            type="password"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Asset ID"
            fullWidth
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="e.g., 2275207 for Tokyo Tower"
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

export default AddCesiumIonTilesDialog;
