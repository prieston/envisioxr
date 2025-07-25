import React, { useCallback, useEffect } from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
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

interface CesiumSkyboxSelectorProps {
  value: "default" | "none" | "stars";
  onChange: (value: "default" | "none" | "stars") => void;
  disabled?: boolean;
}

const CesiumSkyboxSelector: React.FC<CesiumSkyboxSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { cesiumViewer } = useSceneStore();

  const handleSkyboxChange = useCallback(
    (skyboxType: "default" | "none" | "stars") => {
      if (!cesiumViewer) {
        console.warn("Cesium viewer not available");
        return;
      }

      try {
        switch (skyboxType) {
          case "default": {
            // Enable the default Cesium sky by setting showSkyBox to true
            cesiumViewer.scene.skyBox.show = true;
            cesiumViewer.scene.skyAtmosphere.show = true;
            break;
          }
          case "stars": {
            // Enable stars skybox and disable atmosphere
            cesiumViewer.scene.skyBox.show = true;
            cesiumViewer.scene.skyAtmosphere.show = false;
            // Set the skybox to use the stars texture
            cesiumViewer.scene.skyBox = new Cesium.SkyBox({
              sources: {
                positiveX:
                  "https://cesium.com/public/stars/stars_positive_x.jpg",
                negativeX:
                  "https://cesium.com/public/stars/stars_negative_x.jpg",
                positiveY:
                  "https://cesium.com/public/stars/stars_positive_y.jpg",
                negativeY:
                  "https://cesium.com/public/stars/stars_negative_y.jpg",
                positiveZ:
                  "https://cesium.com/public/stars/stars_positive_z.jpg",
                negativeZ:
                  "https://cesium.com/public/stars/stars_negative_z.jpg",
              },
            });
            break;
          }
          case "none": {
            // Disable the sky and atmosphere by setting show to false
            cesiumViewer.scene.skyBox.show = false;
            cesiumViewer.scene.skyAtmosphere.show = false;
            break;
          }
        }
        onChange(skyboxType);
      } catch (error) {
        console.error("Error changing skybox:", error);
      }
    },
    [cesiumViewer, onChange]
  );

  // Apply the current skybox setting when component mounts or value changes
  useEffect(() => {
    if (cesiumViewer && value) {
      handleSkyboxChange(value);
    }
  }, [cesiumViewer, value, handleSkyboxChange]);

  return (
    <Container>
      <SectionTitle>Skybox Type</SectionTitle>
      <FormControl fullWidth size="small" disabled={disabled}>
        <Select
          value={value}
          onChange={(e) =>
            handleSkyboxChange(e.target.value as "default" | "none" | "stars")
          }
          displayEmpty
        >
          <MenuItem value="default">Default Sky</MenuItem>
          <MenuItem value="stars">Stars</MenuItem>
          <MenuItem value="none">No Sky</MenuItem>
        </Select>
      </FormControl>
    </Container>
  );
};

export default CesiumSkyboxSelector;
