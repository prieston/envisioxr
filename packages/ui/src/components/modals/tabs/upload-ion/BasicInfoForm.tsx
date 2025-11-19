import React from "react";
import { Box, TextField, Typography, Select, MenuItem } from "@mui/material";
import {
  textFieldStyles,
  selectStyles,
  menuItemStyles,
} from "../../../../styles/inputStyles";

interface CesiumIonIntegration {
  id: string;
  label: string;
  uploadTokenValid: boolean;
}

interface BasicInfoFormProps {
  name: string;
  description: string;
  integrationId: string;
  accessToken: string;
  sourceType: string;
  tilesetJson: string;
  uploading: boolean;
  sourceTypeLocked?: boolean;
  integrations?: CesiumIonIntegration[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIntegrationIdChange: (value: string) => void;
  onAccessTokenChange: (value: string) => void;
  onSourceTypeChange: (value: string) => void;
  onTilesetJsonChange: (value: string) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  description,
  integrationId,
  accessToken,
  sourceType,
  tilesetJson,
  uploading,
  sourceTypeLocked = false,
  integrations = [],
  onNameChange,
  onDescriptionChange,
  onIntegrationIdChange,
  onAccessTokenChange,
  onSourceTypeChange,
  onTilesetJsonChange,
}) => {
  const validIntegrations = integrations.filter((i) => i.uploadTokenValid);
  const hasValidIntegrations = validIntegrations.length > 0;
  const hasAnyIntegrations = integrations.length > 0;

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
          id="ion-asset-name"
          name="ion-asset-name"
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
          id="ion-asset-description"
          name="ion-asset-description"
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

      {hasAnyIntegrations ? (
        <Box>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 0.5,
            })}
          >
            Cesium Ion Integration *
          </Typography>
          <Select
            id="ion-integration"
            name="ion-integration"
            fullWidth
            value={integrationId}
            onChange={(e) => onIntegrationIdChange(e.target.value)}
            disabled={uploading || !hasValidIntegrations}
            size="small"
            displayEmpty
            sx={(theme) => ({
              ...((typeof selectStyles === "function"
                ? selectStyles(theme)
                : selectStyles) as Record<string, unknown>),
              "& .MuiSelect-select": {
                cursor: hasValidIntegrations ? "pointer" : "not-allowed",
              },
              "& input": {
                cursor: hasValidIntegrations ? "pointer" : "not-allowed",
              },
            })}
            MenuProps={{
              disablePortal: true,
              disableScrollLock: true,
              disableAutoFocus: true,
              disableEnforceFocus: true,
              disableRestoreFocus: true,
              BackdropProps: {
                invisible: true,
                sx: {
                  pointerEvents: "auto",
                  cursor: "default",
                },
              },
              PaperProps: {
                sx: (theme) => ({
                  maxHeight: 300,
                  zIndex: 1600, // Higher than drawer (1500)
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#14171A"
                      : theme.palette.background.paper,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "4px",
                  mt: 0.5,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }),
              },
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
            }}
          >
            <MenuItem value="" disabled sx={menuItemStyles}>
              {hasValidIntegrations
                ? "Select an integration"
                : "No valid integrations available"}
            </MenuItem>
            {hasValidIntegrations &&
              validIntegrations.map((integration) => (
                <MenuItem
                  key={integration.id}
                  value={integration.id}
                  sx={menuItemStyles}
                >
                  {integration.label}
                </MenuItem>
              ))}
            {!hasValidIntegrations &&
              integrations.map((integration) => (
                <MenuItem
                  key={integration.id}
                  value={integration.id}
                  disabled
                  sx={menuItemStyles}
                >
                  {integration.label} (Invalid token)
                </MenuItem>
              ))}
          </Select>
          <Typography
            sx={(theme) => ({
              fontSize: "0.75rem",
              color: hasValidIntegrations
                ? theme.palette.text.secondary
                : theme.palette.error.main,
              mt: 0.5,
            })}
          >
            {hasValidIntegrations
              ? "Select a Cesium Ion integration with upload permissions"
              : "No integrations with valid upload tokens. Please configure an integration in Settings."}
          </Typography>
        </Box>
      ) : (
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
            id="ion-access-token"
            name="ion-access-token"
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
      )}

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
          id="ion-source-type"
          name="ion-source-type"
          fullWidth
          value={sourceType}
          onChange={(e) => onSourceTypeChange(e.target.value)}
          disabled={uploading || sourceTypeLocked}
          size="small"
          sx={(theme) => ({
            ...((typeof selectStyles === "function"
              ? selectStyles(theme)
              : selectStyles) as Record<string, unknown>),
            "& .MuiSelect-select": {
              cursor: "pointer",
            },
            "& input": {
              cursor: "pointer",
            },
          })}
          MenuProps={{
            disablePortal: true,
            disableScrollLock: true,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
            BackdropProps: {
              invisible: true,
              sx: {
                pointerEvents: "auto",
                cursor: "default",
              },
            },
            PaperProps: {
              sx: (theme) => ({
                maxHeight: 300,
                zIndex: 1600, // Higher than drawer (1500)
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#14171A"
                    : theme.palette.background.paper,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "4px",
                mt: 0.5,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }),
            },
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
          }}
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
            id="ion-tileset-json"
            name="ion-tileset-json"
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
