"use client";

import React, { useState, useCallback, Suspense, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material";
import { CloudUpload, Close, CameraAlt } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

export interface UploadModelTabProps {
  onUpload: (data: {
    file: File;
    friendlyName: string;
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
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<
    Array<{ label: string; value: string }>
  >([
    { label: "Category", value: "" },
    { label: "Description", value: "" },
  ]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setScreenshot(null);
    setMetadata([
      { label: "Category", value: "" },
      { label: "Description", value: "" },
    ]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !friendlyName) return;

    await onUpload({
      file: selectedFile,
      friendlyName,
      metadata,
      screenshot,
    });

    handleCancel();
  };

  const handleMetadataChange = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  const handleAddMetadata = () => {
    setMetadata([...metadata, { label: "", value: "" }]);
  };

  const handleRemoveMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const captureScreenshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setScreenshot(dataUrl);
    }
  };

  if (!selectedFile) {
    return (
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderColor: isDragActive ? "#2563eb" : "rgba(226, 232, 240, 0.8)",
          borderRadius: "12px",
          padding: "60px 24px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive
            ? "rgba(37, 99, 235, 0.05)"
            : "rgba(248, 250, 252, 0.6)",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.05)",
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload
          sx={{
            fontSize: "4rem",
            color: isDragActive ? "#2563eb" : "rgba(100, 116, 139, 0.4)",
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* File Info */}
      <Paper
        sx={{
          p: 2,
          borderRadius: "12px",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          backgroundColor: "rgba(248, 250, 252, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.95)",
            }}
          >
            {selectedFile.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(100, 116, 139, 0.8)",
            }}
          >
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </Typography>
        </Box>
        <IconButton
          onClick={handleCancel}
          size="small"
          disabled={uploading}
          sx={{
            color: "rgba(100, 116, 139, 0.8)",
            "&:hover": {
              color: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
            },
          }}
        >
          <Close />
        </IconButton>
      </Paper>

      {/* Model Preview */}
      {previewUrl && (
        <Paper
          sx={{
            p: 2,
            borderRadius: "12px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            backgroundColor: "rgba(248, 250, 252, 0.6)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "rgba(51, 65, 85, 0.95)",
              }}
            >
              Model Preview
            </Typography>
            <Button
              size="small"
              startIcon={<CameraAlt />}
              onClick={captureScreenshot}
              disabled={uploading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.75rem",
                color: "#2563eb",
                borderColor: "rgba(37, 99, 235, 0.3)",
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                },
              }}
              variant="outlined"
            >
              Capture Screenshot
            </Button>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "300px",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#f8fafc",
              border: "1px solid rgba(226, 232, 240, 0.8)",
            }}
          >
            <Canvas
              ref={canvasRef}
              camera={{ position: [5, 5, 5], fov: 50 }}
              gl={{ preserveDrawingBuffer: true }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Suspense fallback={null}>
                <Model url={previewUrl} />
              </Suspense>
              <OrbitControls />
            </Canvas>
          </Box>

          {screenshot && (
            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "rgba(51, 65, 85, 0.95)",
                  mb: 1,
                }}
              >
                Captured Screenshot
              </Typography>
              <Box
                component="img"
                src={screenshot}
                alt="Screenshot"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                }}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Friendly Name */}
      <TextField
        fullWidth
        label="Model Name"
        value={friendlyName}
        onChange={(e) => setFriendlyName(e.target.value)}
        disabled={uploading}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      {/* Metadata Fields */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
            mb: 1,
          }}
        >
          Metadata (Optional)
        </Typography>
        {metadata.map((field, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 1,
              mb: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Label"
              value={field.label}
              onChange={(e) =>
                handleMetadataChange(index, "label", e.target.value)
              }
              disabled={uploading}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            <TextField
              size="small"
              placeholder="Value"
              value={field.value}
              onChange={(e) =>
                handleMetadataChange(index, "value", e.target.value)
              }
              disabled={uploading}
              sx={{
                flex: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />
            {metadata.length > 1 && (
              <IconButton
                onClick={() => handleRemoveMetadata(index)}
                size="small"
                disabled={uploading}
                sx={{
                  color: "rgba(100, 116, 139, 0.8)",
                  "&:hover": {
                    color: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                  },
                }}
              >
                <Close />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          size="small"
          onClick={handleAddMetadata}
          disabled={uploading}
          sx={{
            textTransform: "none",
            fontSize: "0.75rem",
            color: "#2563eb",
          }}
        >
          + Add Metadata Field
        </Button>
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
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: "4px",
                backgroundColor: "#2563eb",
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
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: "rgba(100, 116, 139, 0.85)",
            "&:hover": {
              backgroundColor: "rgba(100, 116, 139, 0.08)",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!friendlyName || uploading}
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
          Upload Model
        </Button>
      </Box>
    </Box>
  );
};

export default UploadModelTab;
