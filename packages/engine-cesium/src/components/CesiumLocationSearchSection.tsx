import React, { useCallback } from "react";
import { Typography } from "@mui/material";
import {
  Container,
  SearchContainer,
  LocationInfo,
} from "./CesiumLocationSearchSection.styles";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core";
import { LocationSearch } from "@envisio/ui";
import { CesiumIonAssetsManager } from ".";

interface CesiumLocationSearchSectionProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const CesiumLocationSearchSection: React.FC<
  CesiumLocationSearchSectionProps
> = () => {
  // Use specific selectors to avoid unnecessary re-renders
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectedLocation = useSceneStore((state) => state.selectedLocation);
  const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
  const setSelectedLocation = useSceneStore(
    (state) => state.setSelectedLocation
  );
  const cesiumViewer = useSceneStore((state) => state.cesiumViewer);

  const handleAssetSelect = useCallback(
    (assetId: string, latitude: number, longitude: number) => {
      setSelectedAssetId(assetId);
      setSelectedLocation({ latitude, longitude });

      // Fly to the selected location in Cesium
      if (cesiumViewer) {
        cesiumViewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000),
          duration: 2.0,
        });
      }
    },
    [setSelectedAssetId, setSelectedLocation, cesiumViewer]
  );

  return (
    <Container>
      <SearchContainer>
        <LocationSearch onAssetSelect={handleAssetSelect} />
      </SearchContainer>

      {selectedLocation && (
        <LocationInfo>
          <Typography variant="caption" display="block" color="text.secondary">
            Latitude: {selectedLocation.latitude.toFixed(6)}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Longitude: {selectedLocation.longitude.toFixed(6)}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Asset ID: {selectedAssetId}
          </Typography>
        </LocationInfo>
      )}

      {/* Cesium Ion Assets Management */}
      <CesiumIonAssetsManager />
    </Container>
  );
};

export default CesiumLocationSearchSection;
