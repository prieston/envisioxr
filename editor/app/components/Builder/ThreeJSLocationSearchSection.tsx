import React, { useCallback } from "react";
import { Box, Typography, FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import useSceneStore from "../../hooks/useSceneStore";
import LocationSearch from "../LocationSearch";
import CesiumIonAssetsManager from "../Environment/CesiumIonAssetsManager";

const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SearchContainer = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  marginTop: "8px",
}));

const LocationInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "6px",
}));

interface ThreeJSLocationSearchSectionProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const ThreeJSLocationSearchSection: React.FC<
  ThreeJSLocationSearchSectionProps
> = () => {
  const {
    showTiles,
    setShowTiles,
    selectedAssetId,
    selectedLocation,
    setSelectedAssetId,
    setSelectedLocation,
    tilesRenderer,
  } = useSceneStore();

  const handleAssetSelect = useCallback(
    (assetId: string, latitude: number, longitude: number) => {
      setSelectedAssetId(assetId);
      setSelectedLocation({ latitude, longitude });
    },
    [setSelectedAssetId, setSelectedLocation]
  );

  const handleTilesToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setShowTiles(event.target.checked);
    },
    [setShowTiles]
  );

  return (
    <Container>
      <FormControlLabel
        control={
          <Switch
            checked={showTiles}
            onChange={handleTilesToggle}
            size="small"
          />
        }
        label="Show 3D Tiles"
      />

      {showTiles && (
        <>
          <SearchContainer>
            <LocationSearch onAssetSelect={handleAssetSelect} />
          </SearchContainer>
          {selectedLocation && (
            <LocationInfo>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Latitude: {selectedLocation.latitude.toFixed(6)}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Longitude: {selectedLocation.longitude.toFixed(6)}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Reference Height: {tilesRenderer?.group?.position.y.toFixed(2)}m
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Asset ID: {selectedAssetId}
              </Typography>
            </LocationInfo>
          )}
        </>
      )}

      {/* Cesium Ion Assets Management */}
      <CesiumIonAssetsManager />
    </Container>
  );
};

export default ThreeJSLocationSearchSection;
