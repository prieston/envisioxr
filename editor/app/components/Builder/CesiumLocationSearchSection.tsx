import React, { useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as Cesium from "cesium";
import { useSceneStore } from "@envisio/core/state";
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

interface CesiumLocationSearchSectionProps {
  value?: any;
  onChange?: (value: any) => void;
  onClick?: () => void;
  disabled?: boolean;
}

const CesiumLocationSearchSection: React.FC<
  CesiumLocationSearchSectionProps
> = () => {
  const {
    selectedAssetId,
    selectedLocation,
    setSelectedAssetId,
    setSelectedLocation,
    cesiumViewer,
  } = useSceneStore();

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
