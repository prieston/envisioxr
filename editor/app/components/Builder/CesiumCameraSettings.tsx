import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import useSceneStore from "../../hooks/useSceneStore";

const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(1),
}));

const SettingRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

interface CesiumCameraSettingsProps {
  disabled?: boolean;
}

const CesiumCameraSettings: React.FC<CesiumCameraSettingsProps> = ({
  disabled = false,
}) => {
  const { cesiumViewer } = useSceneStore();
  const [cameraHeight, setCameraHeight] = useState(1000);
  const [cameraSpeed, setCameraSpeed] = useState(1.0);

  const handleCameraHeightChange = useCallback(
    (height: number) => {
      if (!cesiumViewer) {
        console.warn("Cesium viewer not available");
        return;
      }

      try {
        // Set camera height above terrain
        const position = cesiumViewer.camera.position;
        const cartographic =
          cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
        if (cartographic) {
          const newPosition =
            cesiumViewer.scene.globe.ellipsoid.cartographicToCartesian({
              longitude: cartographic.longitude,
              latitude: cartographic.latitude,
              height: height,
            });
          cesiumViewer.camera.setView({
            destination: newPosition,
          });
        }
        setCameraHeight(height);
      } catch (error) {
        console.error("Error setting camera height:", error);
      }
    },
    [cesiumViewer]
  );

  const handleCameraSpeedChange = useCallback(
    (speed: number) => {
      if (!cesiumViewer) {
        console.warn("Cesium viewer not available");
        return;
      }

      try {
        // Adjust camera movement speed
        cesiumViewer.scene.screenSpaceCameraController.zoomEventTypes = [
          cesiumViewer.scene.screenSpaceCameraController.zoomEventTypes[0],
        ];
        cesiumViewer.scene.screenSpaceCameraController.zoomAmount = speed;
        setCameraSpeed(speed);
      } catch (error) {
        console.error("Error setting camera speed:", error);
      }
    },
    [cesiumViewer]
  );

  // Initialize camera height when component mounts
  useEffect(() => {
    if (cesiumViewer) {
      const position = cesiumViewer.camera.position;
      const cartographic =
        cesiumViewer.scene.globe.ellipsoid.cartesianToCartographic(position);
      if (cartographic) {
        setCameraHeight(cartographic.height);
      }
    }
  }, [cesiumViewer]);

  return (
    <Container>
      <SectionTitle>Camera Settings</SectionTitle>

      <SettingRow>
        <Typography variant="body2" color="text.secondary">
          Camera Height (meters)
        </Typography>
        <Slider
          value={cameraHeight}
          onChange={(_, value) => handleCameraHeightChange(value as number)}
          min={0}
          max={10000}
          step={100}
          marks={[
            { value: 0, label: "0" },
            { value: 5000, label: "5km" },
            { value: 10000, label: "10km" },
          ]}
          disabled={disabled}
        />
      </SettingRow>

      <SettingRow>
        <Typography variant="body2" color="text.secondary">
          Camera Speed
        </Typography>
        <Slider
          value={cameraSpeed}
          onChange={(_, value) => handleCameraSpeedChange(value as number)}
          min={0.1}
          max={5.0}
          step={0.1}
          marks={[
            { value: 0.1, label: "Slow" },
            { value: 1.0, label: "Normal" },
            { value: 5.0, label: "Fast" },
          ]}
          disabled={disabled}
        />
      </SettingRow>
    </Container>
  );
};

export default CesiumCameraSettings;
