import React, { useCallback } from "react";
import { Typography, FormControlLabel, Switch, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSceneStore } from "@envisio/core";
import { LocationSearch } from "@envisio/ui";
import { CesiumIonAssetsManager } from "@envisio/engine-cesium";

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
  // Use specific selectors to avoid unnecessary re-renders
  const showTiles = useSceneStore((state) => state.showTiles);
  const setShowTiles = useSceneStore((state) => state.setShowTiles);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectedLocation = useSceneStore((state) => state.selectedLocation);
  const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
  const setSelectedLocation = useSceneStore(
    (state) => state.setSelectedLocation
  );
  const tilesRenderer = useSceneStore((state) => state.tilesRenderer);

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
