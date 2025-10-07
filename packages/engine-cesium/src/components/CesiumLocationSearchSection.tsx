import React, { useCallback } from "react";
import {
  Container,
  SearchContainer,
  SectionTitle,
} from "./CesiumLocationSearchSection.styles";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core";
import { LocationSearch } from "@envisio/ui";

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
      <SectionTitle>Location Search</SectionTitle>
      <SearchContainer>
        <LocationSearch onAssetSelect={handleAssetSelect} />
      </SearchContainer>
    </Container>
  );
};

export default CesiumLocationSearchSection;
