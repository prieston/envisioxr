import React, { useCallback } from "react";
import { Typography, FormControlLabel, Switch } from "@mui/material";
import {
  Container,
  SearchContainer,
  LocationInfo,
} from "./LocationSearchSection.styles";
import { useSceneStore } from "@envisio/core";
import LocationSearch from "../../LocationSearch";
import CesiumIonAssetsManager from "../../Environment/CesiumIonAssetsManager";

interface LocationSearchSectionProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const LocationSearchSection: React.FC<LocationSearchSectionProps> = () => {
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

      <CesiumIonAssetsManager />
    </Container>
  );
};

export default LocationSearchSection;
