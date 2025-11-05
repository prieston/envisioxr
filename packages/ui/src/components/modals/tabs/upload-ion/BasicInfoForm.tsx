import React from "react";
import { Box, TextField, Typography, Select, MenuItem } from "@mui/material";
import { textFieldStyles, selectStyles } from "../../../../styles/inputStyles";

interface BasicInfoFormProps {
  name: string;
  description: string;
  accessToken: string;
  sourceType: string;
  tilesetJson: string;
  uploading: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAccessTokenChange: (value: string) => void;
  onSourceTypeChange: (value: string) => void;
  onTilesetJsonChange: (value: string) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  description,
  accessToken,
  sourceType,
  tilesetJson,
  uploading,
  onNameChange,
  onDescriptionChange,
  onAccessTokenChange,
  onSourceTypeChange,
  onTilesetJsonChange,
}) => {
  return (
    <>
      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Asset Name *
        </Typography>
        <TextField
          fullWidth
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={uploading}
          size="small"
          placeholder="Enter asset name"
          sx={textFieldStyles}
        />
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Description
        </Typography>
        <TextField
          fullWidth
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={uploading}
          size="small"
          multiline
          rows={3}
          placeholder="Add a description..."
          sx={textFieldStyles}
        />
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          Cesium Ion Access Token *
        </Typography>
        <TextField
          fullWidth
          value={accessToken}
          onChange={(e) => onAccessTokenChange(e.target.value)}
          disabled={uploading}
          size="small"
          type="password"
          placeholder="Enter your Cesium Ion access token"
          sx={textFieldStyles}
        />
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
            mt: 0.5,
          })}
        >
          Get your token from https://ion.cesium.com/tokens (requires
          assets:write scope)
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={(theme) => ({
            fontSize: "0.75rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
          })}
        >
          What kind of data is this?
        </Typography>
        <Select
          fullWidth
          value={sourceType}
          onChange={(e) => onSourceTypeChange(e.target.value)}
          disabled={uploading}
          size="small"
          sx={selectStyles}
        >
          <MenuItem value="3DTILES_ARCHIVE">
            3D Tiles (existing tileset.json)
          </MenuItem>
          <MenuItem value="3DTILES">3D Model (tile as 3D Tiles)</MenuItem>
          <MenuItem value="GLTF">3D Model (convert to glTF)</MenuItem>
          <MenuItem value="3DTILES_BIM">
            Architecture, Engineering or Construction model (BIM/CAD)
          </MenuItem>
          <MenuItem value="3DTILES_PHOTOGRAMMETRY">
            3D Capture / Reality Model / Photogrammetry
          </MenuItem>
          <MenuItem value="POINTCLOUD">Point Cloud</MenuItem>
          <MenuItem value="IMAGERY">Imagery</MenuItem>
          <MenuItem value="TERRAIN">Terrain</MenuItem>
          <MenuItem value="GEOJSON">GeoJSON</MenuItem>
          <MenuItem value="KML">KML/KMZ</MenuItem>
          <MenuItem value="CZML">CZML</MenuItem>
        </Select>
      </Box>

      {sourceType === "3DTILES_ARCHIVE" && (
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Tileset JSON path
          </Typography>
          <TextField
            fullWidth
            value={tilesetJson}
            onChange={(e) => onTilesetJsonChange(e.target.value)}
            disabled={uploading}
            size="small"
            placeholder="tileset.json"
            sx={textFieldStyles}
          />
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
              mt: 0.5,
            })}
          >
            Relative path to the tileset.json inside the archive
          </Typography>
        </Box>
      )}
    </>
  );
};

