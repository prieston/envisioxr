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
      // 3D Models
      "model/gltf-binary": [".glb"],
      "model/gltf+json": [".gltf"],
      "application/x-step": [".ifc"],
      "application/ifc": [".ifc"],
      "application/x-fbx": [".fbx"],
      "model/vnd.collada+xml": [".dae"],
      "model/obj": [".obj"],
      // Point Clouds (LAS/LAZ don't have standard MIME types)
      // Terrain and other raster formats (use generic octet-stream with extensions)
      "application/octet-stream": [".las", ".laz", ".img", ".flt", ".src", ".dt0", ".dt1", ".dt2"],
      // Archives
      "application/zip": [".zip"],
      // Imagery
      "image/tiff": [".tiff", ".tif"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "text/plain": [".asc", ".dem"],
      // Vector formats
      "application/geo+json": [".geojson"],
      "application/json": [".json", ".topojson", ".czml"],
      "application/vnd.google-earth.kml+xml": [".kml"],
      "application/vnd.google-earth.kmz": [".kmz"],
      "application/gml+xml": [".citygml", ".gml"],
      "application/xml": [".xml"],
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
          Supported formats: 3D Models (GLB, GLTF, FBX, DAE, OBJ, IFC), Point Clouds (LAS, LAZ), Imagery (GeoTIFF, JPEG, PNG), Terrain, Vector (GeoJSON, KML, CZML, CityGML), Archives (ZIP)
        </Typography>
      </Box>
    </Box>
  );
};

