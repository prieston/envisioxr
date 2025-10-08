"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Switch,
  IconButton,
  Chip,
} from "@mui/material";
import { Add, FlightTakeoff, Delete } from "@mui/icons-material";

export interface CesiumAsset {
  id: string;
  assetId: string;
  name: string;
  apiKey?: string;
  enabled: boolean;
}

export interface CesiumIonAssetTabProps {
  assets: CesiumAsset[];
  onAddAsset: (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => void;
  onToggleAsset?: (assetId: string) => void;
  onRemoveAsset?: (assetId: string) => void;
  onFlyTo?: (assetId: string) => void;
}

const CesiumIonAssetTab: React.FC<CesiumIonAssetTabProps> = ({
  assets,
  onAddAsset,
  onToggleAsset,
  onRemoveAsset,
  onFlyTo,
}) => {
  const [assetId, setAssetId] = useState("");
  const [assetName, setAssetName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!assetId.trim()) return;

    onAddAsset({
      assetId: assetId.trim(),
      name: assetName.trim() || `Asset ${assetId}`,
      apiKey: apiKey.trim() || undefined,
    });

    setAssetId("");
    setAssetName("");
    setApiKey("");
    setShowForm(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header with Add Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Cesium Ion Assets
        </Typography>
        {!showForm && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowForm(true)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              borderColor: "rgba(37, 99, 235, 0.3)",
              color: "#2563eb",
              "&:hover": {
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
              },
            }}
          >
            Add Ion Asset
          </Button>
        )}
      </Box>

      {/* Add Asset Form */}
      {showForm && (
        <Paper
          sx={{
            p: 3,
            borderRadius: "12px",
            border: "1px solid rgba(37, 99, 235, 0.3)",
            backgroundColor: "rgba(37, 99, 235, 0.05)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.95)",
              mb: 2,
            }}
          >
            Add Cesium Ion Asset
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <TextField
                size="small"
                label="Asset ID"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="e.g., 2275207"
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              />
              <TextField
                size="small"
                label="Name (optional)"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="e.g., My Terrain"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              />
            </Box>
            <TextField
              size="small"
              label="Ion API Key (optional)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Cesium Ion API key"
              type="password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setAssetId("");
                  setAssetName("");
                  setApiKey("");
                }}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: "rgba(100, 116, 139, 0.85)",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!assetId.trim()}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  backgroundColor: "#2563eb",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                }}
              >
                Add Asset
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Assets List */}
      {assets.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "rgba(100, 116, 139, 0.6)",
          }}
        >
          <Typography sx={{ fontSize: "0.875rem" }}>
            No Cesium Ion assets added yet
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {assets.map((asset) => (
            <Paper
              key={asset.id}
              sx={{
                p: 2,
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                backgroundColor: asset.enabled
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(248, 250, 252, 0.6)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "rgba(37, 99, 235, 0.3)",
                  boxShadow:
                    "0 2px 8px rgba(37, 99, 235, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {/* Toggle Switch */}
                <Switch
                  checked={asset.enabled}
                  onChange={() => onToggleAsset?.(asset.id)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#2563eb",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                />

                {/* Asset Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "rgba(51, 65, 85, 0.95)",
                    }}
                  >
                    {asset.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Chip
                      label={`ID: ${asset.assetId}`}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "0.65rem",
                        backgroundColor: "rgba(37, 99, 235, 0.1)",
                        color: "#2563eb",
                      }}
                    />
                    {asset.apiKey && (
                      <Chip
                        label={`Key: ${asset.apiKey.slice(0, 6)}...`}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "0.65rem",
                          backgroundColor: "rgba(100, 116, 139, 0.1)",
                          color: "rgba(100, 116, 139, 0.8)",
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  {onFlyTo && (
                    <IconButton
                      onClick={() => onFlyTo(asset.id)}
                      size="small"
                      sx={{
                        color: "rgba(100, 116, 139, 0.8)",
                        borderRadius: "8px",
                        "&:hover": {
                          color: "#2563eb",
                          backgroundColor: "rgba(37, 99, 235, 0.08)",
                        },
                      }}
                    >
                      <FlightTakeoff />
                    </IconButton>
                  )}
                  {onRemoveAsset && (
                    <IconButton
                      onClick={() => onRemoveAsset(asset.id)}
                      size="small"
                      sx={{
                        color: "rgba(100, 116, 139, 0.8)",
                        borderRadius: "8px",
                        "&:hover": {
                          color: "#ef4444",
                          backgroundColor: "rgba(239, 68, 68, 0.08)",
                        },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CesiumIonAssetTab;
