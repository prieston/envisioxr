import React from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  LinearProgress,
  Tooltip,
  TextField,
} from "@mui/material";
import ModelPreview from "@envisio/engine-three/components/ModelPreview";
import ModelMetadataFields from "./ModelMetadataFields";

type Vector3Tuple = [number, number, number];

interface MetadataField {
  label: string;
  value: string;
}

interface AssetModel {
  id: string;
  name: string;
  url: string;
  fileUrl?: string;
  fileType?: string;
  type?: string;
  assetId?: string;
  thumbnail?: string;
  originalFilename?: string;
  metadata?: Record<string, unknown>;
}

interface DropzoneProps {
  isDragActive: boolean;
  isDragReject: boolean;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
}

interface AssetLibraryPanelProps {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  userAssets: AssetModel[];
  deletingAssetId: string | null;
  handleDeleteModel: (assetId: string) => Promise<void>;
  handleModelSelect: (model: AssetModel) => void;
  selectingPosition: boolean;
  setSelectingPosition: (selecting: boolean) => void;
  selectedPosition: Vector3Tuple | null;
  pendingModel: AssetModel | null;
  handleConfirmModelPlacement: () => void;
  handleCancelModelPlacement: () => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  previewFile: File | null;
  setPreviewFile: (file: File | null) => void;
  screenshot: string | null;
  setScreenshot: (screenshot: string | null) => void;
  friendlyName: string;
  setFriendlyName: (name: string) => void;
  uploading: boolean;
  uploadProgress: number;
  isConfirmDisabled: boolean;
  handleConfirmUpload: () => void;
  getRootProps: DropzoneProps["getRootProps"];
  getInputProps: DropzoneProps["getInputProps"];
  metadata: MetadataField[];
  setMetadata: (metadata: MetadataField[]) => void;
  isObservationModel: boolean;
  onObservationModelChange: (isObservationModel: boolean) => void;
  observationProperties: {
    fov: number;
    showVisibleArea: boolean;
    visibilityRadius: number;
  };
  onObservationPropertiesChange: (properties: {
    fov: number;
    showVisibleArea: boolean;
    visibilityRadius: number;
  }) => void;
}

const AssetLibraryPanel: React.FC<AssetLibraryPanelProps> = ({
  tabIndex,
  setTabIndex,
  userAssets,
  deletingAssetId,
  handleDeleteModel,
  handleModelSelect,
  selectingPosition,
  setSelectingPosition,
  selectedPosition,
  pendingModel,
  handleConfirmModelPlacement,
  handleCancelModelPlacement,
  previewUrl,
  setScreenshot,
  friendlyName,
  setFriendlyName,
  uploading,
  uploadProgress,
  isConfirmDisabled,
  handleConfirmUpload,
  getRootProps,
  getInputProps,
  metadata,
  setMetadata,
  isObservationModel,
  onObservationModelChange,
  observationProperties,
  onObservationPropertiesChange,
}) => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        variant="fullWidth"
        sx={{
          flexShrink: 0,
          mb: 2,
          minHeight: "48px",
          "& .MuiTab-root": {
            color: "rgba(100, 116, 139, 0.8)",
            minHeight: "40px",
            padding: "8px 12px",
            fontSize: "0.813rem", // 13px
            fontWeight: 500,
            borderRadius: "4px",
            margin: "0 2px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(95, 136, 199, 0.08)",
              color: "var(--color-primary, #6B9CD8)",
            },
            "&.Mui-selected": {
              color: "var(--color-primary, #6B9CD8)",
              backgroundColor: "rgba(95, 136, 199, 0.12)",
              fontWeight: 600,
            },
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        <Tab label="Your Models" />
        <Tab label="Upload Model" />
      </Tabs>

      {selectingPosition && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "warning.light",
            borderRadius: 1,
            position: "relative",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Click anywhere in the scene to select where to place the model
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The point will be shown in the panel for confirmation
          </Typography>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setSelectingPosition(false);
            }}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            ✕
          </Button>
        </Box>
      )}

      {selectedPosition && pendingModel && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "success.light",
            borderRadius: 1,
            position: "relative",
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Selected Position for {pendingModel.name}:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            X: {selectedPosition[0].toFixed(2)}
            <br />
            Y: {selectedPosition[1].toFixed(2)}
            <br />
            Z: {selectedPosition[2].toFixed(2)}
          </Typography>
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleConfirmModelPlacement}
            >
              Confirm Placement
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={handleCancelModelPlacement}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: "auto", pb: 4 }}>
        {tabIndex === 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {userAssets.length === 0 ? (
              <Typography>No uploaded models found.</Typography>
            ) : (
              userAssets.map((model, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "100%",
                    borderRadius: 4, // Design system
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backgroundColor: "rgba(248, 250, 252, 0.6)",
                    transition:
                      "border-color 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      borderColor: "rgba(95, 136, 199, 0.3)",
                      boxShadow: "0 2px 8px rgba(95, 136, 199, 0.1)",
                    },
                  }}
                >
                  {model.thumbnail && (
                    <CardMedia
                      style={{ background: "white" }}
                      component="img"
                      height="140"
                      image={model.thumbnail}
                      alt={model.originalFilename}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">
                      {model.originalFilename}
                    </Typography>
                    {model.metadata &&
                      Object.entries(model.metadata).length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(model.metadata).map(
                            ([label, value]) => (
                              <Typography
                                key={label}
                                variant="body2"
                                color="text.secondary"
                              >
                                {`${label}: ${value}`}
                              </Typography>
                            )
                          )}
                        </Box>
                      )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        handleModelSelect({
                          id: model.id,
                          name: model.originalFilename,
                          url: model.fileUrl,
                          type: model.fileType,
                          assetId: model.id,
                        });
                      }}
                    >
                      Add Models
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteModel(model.id)}
                      disabled={deletingAssetId === model.id}
                    >
                      {deletingAssetId === model.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
        )}

        {tabIndex === 1 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minHeight: "100%",
            }}
          >
            {previewUrl ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <ModelPreview
                  fileUrl={previewUrl}
                  type="glb"
                  onScreenshotCaptured={setScreenshot}
                />
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Friendly Name"
                    fullWidth
                    value={friendlyName}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <ModelMetadataFields
                    metadata={metadata}
                    onChange={setMetadata}
                    isObservationModel={isObservationModel}
                    onObservationModelChange={onObservationModelChange}
                    observationProperties={observationProperties}
                    onObservationPropertiesChange={
                      onObservationPropertiesChange
                    }
                  />
                  {uploading && (
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        align="center"
                      >
                        {uploadProgress}% uploaded
                      </Typography>
                    </Box>
                  )}
                  <Tooltip
                    title={
                      isConfirmDisabled
                        ? "Capture thumbnail and enter a friendly name first"
                        : ""
                    }
                  >
                    <span>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={isConfirmDisabled}
                        onClick={handleConfirmUpload}
                      >
                        {uploading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Confirm Upload"
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  padding: 4,
                  border: "2px dashed rgba(100, 116, 139, 0.3)",
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 4, // Design system
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                  backgroundColor: "rgba(248, 250, 252, 0.3)",
                  transition:
                    "background-color 0.15s ease, border-color 0.15s ease",
                  "&:hover": {
                    backgroundColor: "rgba(95, 136, 199, 0.05)",
                    borderColor: "rgba(95, 136, 199, 0.4)",
                  },
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Typography variant="h6" gutterBottom>
                  Upload Model
                </Typography>
                <Typography color="text.secondary">
                  Drag & drop a .glb file here, or click to select a file
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AssetLibraryPanel;
