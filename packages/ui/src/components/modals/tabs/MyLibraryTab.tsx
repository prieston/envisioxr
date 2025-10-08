"use client";

import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Chip,
} from "@mui/material";
import { MoreVert, Delete, AddLocation } from "@mui/icons-material";

export interface LibraryAsset {
  id: string;
  originalFilename: string;
  fileUrl: string;
  fileType: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface MyLibraryTabProps {
  assets: LibraryAsset[];
  onAssetSelect: (asset: LibraryAsset) => void;
  onAssetDelete?: (assetId: string) => void;
}

const MyLibraryTab: React.FC<MyLibraryTabProps> = ({
  assets,
  onAssetSelect,
  onAssetDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<LibraryAsset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    asset: LibraryAsset
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAsset && onAssetDelete) {
      onAssetDelete(selectedAsset.id);
    }
    setDeleteDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleAddToScene = (asset: LibraryAsset) => {
    onAssetSelect(asset);
  };

  if (assets.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 500,
            color: "rgba(100, 116, 139, 0.8)",
          }}
        >
          No models in your library yet
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "rgba(100, 116, 139, 0.6)",
          }}
        >
          Upload a model to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {assets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <Card
              sx={{
                borderRadius: "12px",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow:
                  "0 2px 8px rgba(37, 99, 235, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow:
                    "0 4px 16px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                  borderColor: "rgba(37, 99, 235, 0.3)",
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    asset.thumbnail ||
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%2394a3b8'%3ENo Preview%3C/text%3E%3C/svg%3E"
                  }
                  alt={asset.originalFilename}
                  sx={{
                    objectFit: "cover",
                    backgroundColor: "rgba(248, 250, 252, 0.8)",
                  }}
                />
                <IconButton
                  onClick={(e) => handleMenuOpen(e, asset)}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Box>
              <CardContent sx={{ pb: 1 }}>
                <Typography
                  gutterBottom
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "rgba(51, 65, 85, 0.95)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {asset.originalFilename}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                    mt: 1,
                  }}
                >
                  {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                    <>
                      {Object.entries(asset.metadata)
                        .slice(0, 2)
                        .map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              height: "20px",
                              backgroundColor: "rgba(37, 99, 235, 0.08)",
                              color: "#2563eb",
                            }}
                          />
                        ))}
                    </>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<AddLocation />}
                  onClick={() => handleAddToScene(asset)}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    borderColor: "rgba(37, 99, 235, 0.3)",
                    color: "#2563eb",
                    "&:hover": {
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  Add to Scene
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow:
              "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            fontSize: "0.875rem",
            color: "#ef4444",
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          <Delete sx={{ mr: 1, fontSize: "1.2rem" }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            padding: "8px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Delete {selectedAsset?.originalFilename}?
        </DialogTitle>
        <DialogActions sx={{ padding: "16px" }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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
            onClick={handleDeleteConfirm}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#dc2626",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyLibraryTab;
