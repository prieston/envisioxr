import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Switch,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useSceneStore } from "@envisio/core";

export default function CesiumIonAssetsManager() {
  const cesiumIonAssets = useSceneStore((s) => s.cesiumIonAssets);
  const addCesiumIonAsset = useSceneStore((s) => s.addCesiumIonAsset);
  const removeCesiumIonAsset = useSceneStore((s) => s.removeCesiumIonAsset);
  const toggleCesiumIonAsset = useSceneStore((s) => s.toggleCesiumIonAsset);
  const flyToCesiumIonAsset = useSceneStore((s) => s.flyToCesiumIonAsset);

  const [assetIdInput, setAssetIdInput] = useState("");
  const [assetNameInput, setAssetNameInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [open, setOpen] = useState(false);

  const assets = useMemo(() => cesiumIonAssets || [], [cesiumIonAssets]);

  const handleAdd = () => {
    const cleanId = assetIdInput.trim();
    if (!cleanId) return;
    addCesiumIonAsset({
      name: assetNameInput.trim() || `Asset ${cleanId}`,
      apiKey: apiKeyInput.trim() || "",
      assetId: cleanId,
      enabled: true,
    });
    setAssetIdInput("");
    setAssetNameInput("");
    // Keep apiKey for subsequent adds if user wants
    setOpen(false);
  };

  return (
    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="subtitle2" color="text.primary">
        Cesium Ion Assets
      </Typography>

      <Button variant="outlined" size="small" onClick={() => setOpen(true)}>
        Add Asset
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Cesium Ion Asset</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              size="small"
              label="Asset ID"
              value={assetIdInput}
              onChange={(e) => setAssetIdInput(e.target.value)}
              autoFocus
            />
            <TextField
              size="small"
              label="Name (optional)"
              value={assetNameInput}
              onChange={(e) => setAssetNameInput(e.target.value)}
            />
          </Box>
          <TextField
            size="small"
            label="Ion API Key (optional)"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAdd}
            disabled={!assetIdInput.trim()}
            variant="contained"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {assets.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          {assets.map((a: any) => (
            <Box
              key={a.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: 1,
                p: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <Switch
                checked={!!a.enabled}
                onChange={() => toggleCesiumIonAsset(a.id)}
                size="small"
              />
              <Box>
                <Typography variant="body2" color="text.primary">
                  {a.name || "Ion Asset"} ({a.assetId})
                </Typography>
                {a.apiKey ? (
                  <Typography variant="caption" color="text.secondary">
                    Key: {a.apiKey.slice(0, 6)}…
                  </Typography>
                ) : null}
              </Box>
              <Button size="small" onClick={() => flyToCesiumIonAsset(a.id)}>
                Fly To
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => removeCesiumIonAsset(a.id)}
              >
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
