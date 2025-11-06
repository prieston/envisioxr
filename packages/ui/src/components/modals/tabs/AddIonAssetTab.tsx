"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";

export interface AddIonAssetTabProps {
  onAdd?: (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => Promise<unknown>;
  onSuccess?: () => void;
}

const AddIonAssetTab: React.FC<AddIonAssetTabProps> = ({
  onAdd,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [assetId, setAssetId] = useState("");
  const [assetToken, setAssetToken] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!assetId.trim()) {
      setError("Asset ID is required");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!onAdd) {
      setError("Add handler not available");
      return;
    }

    setAdding(true);
    try {
      await onAdd({
        assetId: assetId.trim(),
        name: name.trim(),
        apiKey: assetToken.trim() || undefined,
      });
      // Reset form on success
      setName("");
      setAssetId("");
      setAssetToken("");
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add Ion asset"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        overflow: "auto",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add Cesium Ion Asset
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter the details of an existing Cesium Ion asset to add it to your
          library.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            id="ion-asset-name"
            name="ion-asset-name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
            disabled={adding}
            placeholder="e.g., My 3D Tileset"
          />

          <TextField
            id="ion-asset-id"
            name="ion-asset-id"
            label="Asset ID"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            required
            fullWidth
            size="small"
            disabled={adding}
            placeholder="e.g., 123456"
            helperText="The numeric ID of the asset in Cesium Ion"
          />

          <TextField
            id="ion-asset-token"
            name="ion-asset-token"
            label="Asset Token (optional)"
            value={assetToken}
            onChange={(e) => setAssetToken(e.target.value)}
            fullWidth
            size="small"
            disabled={adding}
            type="password"
            placeholder="Your Cesium Ion access token"
            helperText="Required if the asset is private or requires authentication"
          />

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={adding || !assetId.trim() || !name.trim() || !onAdd}
            startIcon={!adding && <Add />}
            sx={{ mt: 2 }}
          >
            {adding ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Adding...
              </>
            ) : (
              "Add to Library"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddIonAssetTab;

