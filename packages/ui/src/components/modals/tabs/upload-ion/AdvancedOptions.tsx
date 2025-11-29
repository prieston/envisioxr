import React from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import { ExpandMore, Settings } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { textFieldStyles, selectStyles } from "../../../../styles/inputStyles";
import { TextField } from "@mui/material";

interface AdvancedOptionsProps {
  sourceType: string;
  dracoCompression: boolean;
  ktx2Compression: boolean;
  webpImages: boolean;
  geometricCompression: string;
  epsgCode: string;
  gaussianSplats?: boolean;
  uploading: boolean;
  onDracoCompressionChange: (value: boolean) => void;
  onKtx2CompressionChange: (value: boolean) => void;
  onWebpImagesChange: (value: boolean) => void;
  onGeometricCompressionChange: (value: string) => void;
  onEpsgCodeChange: (value: string) => void;
  onGaussianSplatsChange?: (value: boolean) => void;
  // 3D Reconstruction options
  useGpsInfo?: boolean;
  meshQuality?: string;
  cesium3DTiles?: boolean;
  las?: boolean;
  onUseGpsInfoChange?: (value: boolean) => void;
  onMeshQualityChange?: (value: string) => void;
  onCesium3DTilesChange?: (value: boolean) => void;
  onLasChange?: (value: boolean) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  sourceType,
  dracoCompression,
  ktx2Compression,
  webpImages,
  geometricCompression,
  epsgCode,
  gaussianSplats = false,
  uploading,
  onDracoCompressionChange,
  onKtx2CompressionChange,
  onWebpImagesChange,
  onGeometricCompressionChange,
  onEpsgCodeChange,
  onGaussianSplatsChange,
  useGpsInfo = false,
  meshQuality = "Medium",
  cesium3DTiles = true,
  las = false,
  onUseGpsInfoChange,
  onMeshQualityChange,
  onCesium3DTilesChange,
  onLasChange,
}) => {
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  const shouldShowOptions =
    sourceType === "3DTILES" ||
    sourceType === "GLTF" ||
    sourceType === "3DTILES_BIM" ||
    sourceType === "3DTILES_PHOTOGRAMMETRY" ||
    sourceType === "POINTCLOUD" ||
    sourceType === "PHOTOS_3D_RECONSTRUCTION";

  if (!shouldShowOptions) return null;

  const getTitle = () => {
    switch (sourceType) {
      case "3DTILES_BIM":
        return "BIM/CAD Options";
      case "3DTILES_PHOTOGRAMMETRY":
        return "3D Capture Options";
      case "GLTF":
        return "Model Options";
      case "POINTCLOUD":
        return "Point Cloud Options";
      case "PHOTOS_3D_RECONSTRUCTION":
        return "Technology Preview - Reconstruct models from photos";
      default:
        return "3D Model Options";
    }
  };

  return (
    <Accordion
      defaultExpanded
      sx={{
        borderRadius: "4px !important",
        "&:before": { display: "none" },
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          borderRadius: "4px",
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        <Settings sx={{ fontSize: "1.25rem", color: accent }} />
        <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
          {getTitle()}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {(sourceType === "3DTILES" ||
          sourceType === "GLTF" ||
          sourceType === "3DTILES_PHOTOGRAMMETRY") && (
          <FormControlLabel
            control={
              <Switch
                checked={dracoCompression}
                onChange={(e) => onDracoCompressionChange(e.target.checked)}
                disabled={uploading}
              />
            }
            label={<Typography sx={{ fontSize: "0.875rem" }}>Draco compression</Typography>}
          />
        )}

        {(sourceType === "3DTILES_BIM" ||
          sourceType === "3DTILES_PHOTOGRAMMETRY") && (
          <FormControlLabel
            control={
              <Switch
                checked={ktx2Compression}
                onChange={(e) => onKtx2CompressionChange(e.target.checked)}
                disabled={uploading}
              />
            }
            label={<Typography sx={{ fontSize: "0.875rem" }}>KTX2 compression</Typography>}
          />
        )}

        {sourceType === "3DTILES" && (
          <FormControlLabel
            control={
              <Switch
                checked={webpImages}
                onChange={(e) => onWebpImagesChange(e.target.checked)}
                disabled={uploading}
              />
            }
            label={<Typography sx={{ fontSize: "0.875rem" }}>WebP images</Typography>}
          />
        )}

        {(sourceType === "3DTILES_BIM" ||
          sourceType === "3DTILES_PHOTOGRAMMETRY") && (
          <Box>
            <Typography
              sx={(theme) => ({
                fontSize: "0.75rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              })}
            >
              Geometric Compression
            </Typography>
            <Select
              id="geometric-compression"
              name="geometric-compression"
              fullWidth
              value={geometricCompression}
              onChange={(e) => onGeometricCompressionChange(e.target.value)}
              disabled={uploading}
              size="small"
              sx={selectStyles}
            >
              <MenuItem value="Draco">Draco</MenuItem>
              <MenuItem value="Meshopt">Meshopt</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>
          </Box>
        )}

        {sourceType === "3DTILES_BIM" && (
          <Box>
            <Typography
              sx={(theme) => ({
                fontSize: "0.75rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
              })}
            >
              EPSG Code (Optional)
            </Typography>
            <TextField
              id="epsg-code"
              name="epsg-code"
              fullWidth
              size="small"
              value={epsgCode}
              onChange={(e) => onEpsgCodeChange(e.target.value)}
              disabled={uploading}
              placeholder="e.g., 4326"
              sx={textFieldStyles}
            />
            <Typography
              sx={(theme) => ({
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
                mt: 0.5,
              })}
            >
              Coordinate reference system code
            </Typography>
          </Box>
        )}

        {sourceType === "3DTILES_BIM" && (
          <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
            Ion will tile your BIM/CAD model into a 3D Tiles 1.1 tileset. For Cesium
            clients, we recommend using Cesium for Unreal v2.11.0 or later, Cesium for
            Unity v1.14.0 or later, and CesiumJS v1.124.0 or later.
          </Alert>
        )}

        {sourceType === "3DTILES_PHOTOGRAMMETRY" && (
          <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
            Ion will tile your photogrammetry, scan, or other mesh into a 3D Tiles 1.1
            tileset. A 3D Tiles 1.1 client is required.
          </Alert>
        )}

        {sourceType === "GLTF" && (
          <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
            Ion will convert your model to glTF format for easy integration.
          </Alert>
        )}

        {sourceType === "POINTCLOUD" && (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={dracoCompression}
                  onChange={(e) => onDracoCompressionChange(e.target.checked)}
                  disabled={uploading}
                />
              }
              label={<Typography sx={{ fontSize: "0.875rem" }}>Draco compression</Typography>}
            />
            {onGaussianSplatsChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={gaussianSplats}
                    onChange={(e) => onGaussianSplatsChange(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem" }}>Gaussian splats</Typography>}
              />
            )}
            <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
              Ion will tile your point cloud data into a 3D Tiles tileset for efficient
              streaming.
            </Alert>
          </>
        )}

        {sourceType === "PHOTOS_3D_RECONSTRUCTION" && (
          <>
            {onUseGpsInfoChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={useGpsInfo}
                    onChange={(e) => onUseGpsInfoChange(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem" }}>
                    Use embedded GPS coordinates to georeference the asset
                  </Typography>
                }
              />
            )}
            {onMeshQualityChange && (
              <Box>
                <Typography
                  sx={(theme) => ({
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 0.5,
                  })}
                >
                  Output quality
                </Typography>
                <Select
                  id="mesh-quality"
                  name="mesh-quality"
                  fullWidth
                  value={meshQuality}
                  onChange={(e) => onMeshQualityChange(e.target.value)}
                  disabled={uploading}
                  size="small"
                  sx={selectStyles}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </Box>
            )}
            {onCesium3DTilesChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={cesium3DTiles}
                    onChange={(e) => onCesium3DTilesChange(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem" }}>3D mesh</Typography>}
              />
            )}
            {onGaussianSplatsChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={gaussianSplats || false}
                    onChange={(e) => onGaussianSplatsChange?.(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem" }}>3D Gaussian splats</Typography>}
              />
            )}
            {onLasChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={las}
                    onChange={(e) => onLasChange(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem" }}>Point cloud</Typography>}
              />
            )}
            <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
              Technology Preview: 3D reconstruction from photos is not yet intended for production
              use. Data may require retiling in the future.
            </Alert>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

