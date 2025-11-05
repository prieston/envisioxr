import React from "react";
import { Box, Typography, Alert } from "@mui/material";
import { CloudUpload, Public } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useDropzone } from "react-dropzone";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelected }) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;
  const accentSubtle = alpha(accent, 0.05);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "application/zip": [".zip"],
      "application/x-step": [".ifc"],
      "application/ifc": [".ifc"],
    },
    multiple: false,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Alert severity="info" icon={<Public />}>
        Upload your georeferenced 3D model to your Cesium Ion account for
        tiling and optimization. You&apos;ll need a Cesium Ion access token with{" "}
        <strong>assets:write</strong> permission.
      </Alert>
      <Box
        {...getRootProps()}
        sx={(theme) => ({
          border: "2px dashed",
          borderColor: isDragActive ? accent : "rgba(255, 255, 255, 0.08)",
          borderRadius: "4px",
          padding: "60px 24px",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: isDragActive
            ? accentSubtle
            : theme.palette.background.default,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: accent,
            backgroundColor: accentSubtle,
          },
        })}
      >
        <input {...getInputProps()} />
        <CloudUpload
          sx={{
            fontSize: "4rem",
            color: isDragActive ? accent : "rgba(100, 116, 139, 0.4)",
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
          {isDragActive ? "Drop your model here" : "Drag & drop your model here"}
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
          Supported formats: GLB, GLTF, IFC, ZIP (with textures)
        </Typography>
      </Box>
    </Box>
  );
};

