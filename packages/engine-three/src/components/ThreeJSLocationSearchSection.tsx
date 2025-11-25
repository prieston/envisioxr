import React, { useCallback } from "react";
import { Typography, FormControlLabel, Switch, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSceneStore } from "@klorad/core";
import { LocationSearch } from "@klorad/ui";
import { CesiumIonAssetsManager } from "@klorad/engine-cesium";

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
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: theme.spacing(1),
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
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 7 to 1
  const sceneState = useSceneStore((state) => ({
    showTiles: state.showTiles,
    setShowTiles: state.setShowTiles,
    selectedAssetId: state.selectedAssetId,
    selectedLocation: state.selectedLocation,
    setSelectedAssetId: state.setSelectedAssetId,
    setSelectedLocation: state.setSelectedLocation,
    tilesRenderer: state.tilesRenderer,
  }));

  // Destructure for cleaner lookups
  const {
    showTiles,
    setShowTiles,
    selectedAssetId,
    selectedLocation,
    setSelectedAssetId,
    setSelectedLocation,
    tilesRenderer,
  } = sceneState;

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

      <CesiumIonAssetsManager />
    </Container>
  );
};

export default ThreeJSLocationSearchSection;
