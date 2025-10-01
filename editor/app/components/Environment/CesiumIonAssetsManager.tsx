import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemText,
  IconButton,
  Switch,
  Chip,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flight as FlightIcon,
} from "@mui/icons-material";
import {
  Container,
  SectionTitle,
  AssetListItem,
} from "./CesiumIonAssetsManager.styles";
import { useSceneStore } from "@envisio/core";

interface CesiumIonAssetsManagerProps {}

const CesiumIonAssetsManager: React.FC<CesiumIonAssetsManagerProps> = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    assetId: "",
  });
  const [error, setError] = useState<string | null>(null);

  const {
    cesiumIonAssets,
    addCesiumIonAsset,
    removeCesiumIonAsset,
    updateCesiumIonAsset,
    toggleCesiumIonAsset,
    flyToCesiumIonAsset,
  } = useSceneStore();

  const handleOpenDialog = (assetId?: string) => {
    if (assetId) {
      const asset = cesiumIonAssets.find((a) => a.id === assetId);
      if (asset) {
        setEditingAsset(assetId);
        setFormData({
          name: asset.name,
          apiKey: asset.apiKey,
          assetId: asset.assetId,
        });
      }
    } else {
      setEditingAsset(null);
      setFormData({
        name: "",
        apiKey: "",
        assetId: "",
      });
    }
    setError(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAsset(null);
    setFormData({
      name: "",
      apiKey: "",
      assetId: "",
    });
    setError(null);
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.name.trim()) {
      setError("Asset name is required");
      return;
    }
    if (!formData.apiKey.trim()) {
      setError("API key is required");
      return;
    }
    if (!formData.assetId.trim()) {
      setError("Asset ID is required");
      return;
    }

    const assetData = {
      name: formData.name.trim(),
      apiKey: formData.apiKey.trim(),
      assetId: formData.assetId.trim(),
      enabled: true,
    };

    if (editingAsset) {
      updateCesiumIonAsset(editingAsset, assetData);
    } else {
      addCesiumIonAsset(assetData);
    }

    handleCloseDialog();
  };

  const handleRemoveAsset = (assetId: string) => {
    removeCesiumIonAsset(assetId);
  };

  const handleToggleAsset = (assetId: string) => {
    toggleCesiumIonAsset(assetId);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <SectionTitle>Cesium Ion Assets</SectionTitle>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenDialog()}
        >
          Add Asset
        </Button>
      </Box>

      {cesiumIonAssets.length === 0 ? (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No Cesium Ion assets added yet. Click "Add Asset" to get started.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            To get started:
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 1 }}
          >
            1. Go to{" "}
            <a
              href="https://cesium.com/ion/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit" }}
            >
              Cesium Ion
            </a>{" "}
            and create an account
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 1 }}
          >
            2. Upload your 3D model or use existing assets
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 1 }}
          >
            3. Get your API key from the Access Tokens section
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 1 }}
          >
            4. Find your Asset ID in the asset details
          </Typography>
        </Box>
      ) : (
        <List>
          {cesiumIonAssets.map((asset) => (
            <AssetListItem key={asset.id} sx={{ flexWrap: "wrap" }}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {asset.name}
                    </Typography>
                    <Chip
                      label={asset.enabled ? "Enabled" : "Disabled"}
                      size="small"
                      color={asset.enabled ? "success" : "default"}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      Asset ID: {asset.assetId}
                    </Typography>
                  </Box>
                }
              />
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ flexWrap: "wrap" }}
              >
                <Switch
                  checked={asset.enabled}
                  onChange={() => handleToggleAsset(asset.id)}
                  size="small"
                />
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(asset.id)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveAsset(asset.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
                <Tooltip title="Fly to Asset">
                  <IconButton
                    size="small"
                    onClick={() => flyToCesiumIonAsset(asset.id)}
                  >
                    <FlightIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </AssetListItem>
          ))}
        </List>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAsset ? "Edit Cesium Ion Asset" : "Add Cesium Ion Asset"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              label="Asset Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., My Building Model"
            />

            <TextField
              label="Cesium Ion API Key"
              type="password"
              fullWidth
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              placeholder="Enter your Cesium Ion API key"
            />

            <TextField
              label="Asset ID"
              fullWidth
              value={formData.assetId}
              onChange={(e) =>
                setFormData({ ...formData, assetId: e.target.value })
              }
              placeholder="e.g., 3492569"
              helperText="This is the numeric ID of your Cesium Ion asset"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAsset ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CesiumIonAssetsManager;
