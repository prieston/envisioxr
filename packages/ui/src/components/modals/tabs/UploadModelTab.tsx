"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  alpha,
} from "@mui/material";
import { CloudUpload, Close, CameraAlt } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { textFieldStyles } from "../../../styles/inputStyles";
import { MetadataTable, type MetadataRow } from "../../table";
import ModelPreviewDialog from "../ModelPreviewDialog";

export interface UploadModelTabProps {
  onUpload: (data: {
    file: File;
    friendlyName: string;
    description?: string;
    metadata: Array<{ label: string; value: string }>;
    screenshot: string | null;
  }) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
}

const UploadModelTab: React.FC<UploadModelTabProps> = ({
  onUpload,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<MetadataRow[]>([]);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setFriendlyName(file.name.replace(/\.[^/.]+$/, ""));

      // Create preview URL for GLB/GLTF files
      if (
        file.type.includes("gltf") ||
        file.name.endsWith(".glb") ||
        file.name.endsWith(".gltf")
      ) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
    },
    multiple: false,
  });

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFriendlyName("");
    setDescription("");
    setScreenshot(null);
    setMetadata([]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !friendlyName) return;

    await onUpload({
      file: selectedFile,
      friendlyName,
      description,
      metadata,
      screenshot,
    });

    handleCancel();
  };

  const handleCaptureScreenshot = (screenshot: string) => {
    setScreenshot(screenshot);
    setPreviewDialogOpen(false);
  };

  if (!selectedFile) {
    return (
      <Box
        {...getRootProps()}
        sx={(theme) => ({
          border: "2px dashed",
          borderColor: isDragActive
            ? theme.palette.primary.main
            : "rgba(255, 255, 255, 0.08)",
          borderRadius: "4px",
          padding: "60px 24px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive
            ? "rgba(95, 136, 199, 0.08)"
            : theme.palette.background.default,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            backgroundColor: "rgba(95, 136, 199, 0.05)",
          },
        })}
      >
        <input {...getInputProps()} />
        <CloudUpload
          sx={{
            fontSize: "4rem",
            color: isDragActive
              ? "var(--color-primary, #6B9CD8)"
              : "rgba(100, 116, 139, 0.4)",
            mb: 2,
          }}
        />
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
            mb: 1,
          }}
        >
          {isDragActive
            ? "Drop your model here"
            : "Drag & drop your model here"}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "rgba(100, 116, 139, 0.8)",
            mb: 2,
          }}
        >
          or click to browse
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "rgba(100, 116, 139, 0.6)",
          }}
        >
          Supported formats: GLB, GLTF
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={(theme) => ({
      display: "flex",
      flexDirection: "column",
      gap: 2,
      height: "100%",
      overflowY: "auto",
      paddingRight: 1,
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.08)
            : "rgba(95, 136, 199, 0.05)",
        borderRadius: "4px",
        margin: "4px 0",
      },
      "&::-webkit-scrollbar-thumb": {
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.primary.main, 0.24)
            : "rgba(95, 136, 199, 0.2)",
        borderRadius: "4px",
        border: "2px solid transparent",
        backgroundClip: "padding-box",
        transition: "background 0.2s ease",
        "&:hover": {
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.38)
              : "rgba(95, 136, 199, 0.35)",
          backgroundClip: "padding-box",
        },
      },
    })}>
      {/* File Info */}
      <Paper
        sx={(theme) => ({
          p: 2,
          borderRadius: "4px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        })}
      >
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.875rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
            })}
          >
            {selectedFile.name}
          </Typography>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
            })}
          >
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Box>
        <IconButton
          onClick={handleCancel}
          size="small"
          disabled={uploading}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            "&:hover": {
              color: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          })}
        >
          <Close />
        </IconButton>
      </Paper>

      {/* Thumbnail and Model Details */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* Thumbnail */}
        <Box
          sx={(theme) => ({
            width: "120px",
            height: "120px",
            flexShrink: 0,
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(226, 232, 240, 0.05)"
                : "rgba(226, 232, 240, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: previewUrl && !uploading ? "pointer" : "default",
            "&:hover .retake-overlay": {
              opacity: previewUrl && !uploading ? 1 : 0,
            },
          })}
        >
          {screenshot ? (
            <img
              src={screenshot}
              alt="Model thumbnail"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Typography
              sx={(theme) => ({
                fontSize: "0.625rem",
                color: theme.palette.text.secondary,
                fontStyle: "italic",
                textAlign: "center",
                px: 1,
              })}
            >
              No preview
            </Typography>
          )}

          {/* Hover Overlay */}
          {previewUrl && !uploading && (
            <Box
              className="retake-overlay"
              onClick={() => setPreviewDialogOpen(true)}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 0.5,
                opacity: 0,
                transition: "opacity 0.2s ease",
              }}
            >
              <CameraAlt sx={{ color: "white", fontSize: "2rem" }} />
              <Typography
                sx={{
                  color: "white",
                  fontSize: "0.625rem",
                  fontWeight: 500,
                }}
              >
                {screenshot ? "Retake Photo" : "Capture Photo"}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Name and Description */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Name
          </Typography>
          <TextField
            id="upload-model-name"
            name="upload-model-name"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            size="small"
            fullWidth
            placeholder="Enter model name"
            disabled={uploading}
            sx={textFieldStyles}
          />
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
              mt: 1.5,
            })}
          >
            Description (Optional)
          </Typography>
          <TextField
            id="upload-model-description"
            name="upload-model-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Add a description..."
            disabled={uploading}
            sx={textFieldStyles}
          />
        </Box>
      </Box>

      {/* Metadata Table */}
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.813rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
          })}
        >
          Metadata (Optional)
        </Typography>
        <MetadataTable
          data={metadata}
          editable={!uploading}
          onChange={setMetadata}
        />
      </Box>

      {/* Upload Progress */}
      {uploading && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{
              height: "8px",
              borderRadius: "4px",
              backgroundColor: "rgba(95, 136, 199, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: "4px",
                backgroundColor: "var(--color-primary-600, #4B6FAF)",
              },
            }}
          />
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(100, 116, 139, 0.8)",
              mt: 0.5,
              textAlign: "center",
            }}
          >
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
        <Button
          onClick={handleCancel}
          disabled={uploading}
          sx={(theme) => ({
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: "rgba(100, 116, 139, 0.08)",
            },
          })}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!friendlyName || uploading}
          sx={(theme) => ({
            borderRadius: "4px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          })}
        >
          Upload Model
        </Button>
      </Box>

      {/* Model Preview Dialog */}
      {previewUrl && (
        <ModelPreviewDialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          modelUrl={previewUrl}
          modelName={friendlyName || selectedFile.name}
          onCapture={handleCaptureScreenshot}
        />
      )}
    </Box>
  );
};

export default UploadModelTab;
