import React, { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography, Button, ButtonGroup } from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";

const Container = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  width: "100%",
  "& .MuiButton-root": {
    flex: 1,
    fontSize: "0.8rem",
    padding: theme.spacing(1),
    textTransform: "none",
  },
}));

interface CesiumBasemapSelectorProps {
  onBasemapChange: (
    basemapType: "cesium" | "google" | "google-photorealistic" | "none"
  ) => void;
  currentBasemap?: string;
  disabled?: boolean;
}

const CesiumBasemapSelector: React.FC<CesiumBasemapSelectorProps> = ({
  onBasemapChange,
  currentBasemap = "none",
  disabled = false,
}) => {
  const [selectedBasemap, setSelectedBasemap] = useState(currentBasemap);
  const { cesiumViewer, cesiumInstance } = useSceneStore();

  const handleBasemapChange = useCallback(
    async (
      basemapType: "cesium" | "google" | "google-photorealistic" | "none"
    ) => {
      if (!cesiumViewer || !cesiumInstance) {
        console.warn("Cesium viewer or instance not available");
        return;
      }

      setSelectedBasemap(basemapType);
      onBasemapChange(basemapType);

      try {
        switch (basemapType) {
          case "cesium": {
            try {
              cesiumViewer.imageryLayers.removeAll();
              // Use the default imagery provider that was set during viewer creation
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.IonImageryProvider({ assetId: 2 })
              );
            } catch (error) {
              console.error("Error setting Cesium World Imagery:", error);
              // Fallback to a simple URL template provider
              try {
                cesiumViewer.imageryLayers.addImageryProvider(
                  new cesiumInstance.UrlTemplateImageryProvider({
                    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                    credit: "© OpenStreetMap contributors",
                  })
                );
              } catch (fallbackError) {
                console.error("Error setting fallback imagery:", fallbackError);
              }
            }
            break;
          }
          case "google": {
            try {
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.UrlTemplateImageryProvider({
                  url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                  credit: "Google Satellite",
                })
              );
            } catch (error) {
              console.error("Error setting Google Satellite:", error);
            }
            break;
          }
          case "google-photorealistic": {
            const cesiumKey =
              process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
              process.env.NEXT_PUBLIC_CESIUM_TOKEN;
            if (!cesiumKey) {
              console.warn(
                "Cesium Ion key not found. Please set NEXT_PUBLIC_CESIUM_ION_KEY environment variable."
              );
              // Fall back to OpenStreetMap if Cesium key is not available
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.UrlTemplateImageryProvider({
                  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                  credit: "© OpenStreetMap contributors",
                })
              );
              return;
            }
            try {
              // Remove existing imagery layers
              cesiumViewer.imageryLayers.removeAll();

              // Add Google Photorealistic 3D tiles through Cesium Ion
              // Asset ID 2275207 is Google Photorealistic 3D
              const tileset =
                await cesiumInstance.Cesium3DTileset.fromIonAssetId(2275207);

              // Add the tileset to the scene
              cesiumViewer.scene.primitives.add(tileset);
            } catch (error) {
              console.error("Error setting Google Photorealistic:", error);
              // Fall back to OpenStreetMap on error
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.UrlTemplateImageryProvider({
                  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                  credit: "© OpenStreetMap contributors",
                })
              );
            }
            break;
          }
          case "none": {
            cesiumViewer.imageryLayers.removeAll();
            break;
          }
        }
      } catch (error) {
        console.error("Error changing basemap:", error);
      }
    },
    [cesiumViewer, cesiumInstance, onBasemapChange]
  );

  if (disabled) {
    return null;
  }

  return (
    <Container>
      <SectionTitle>Basemap</SectionTitle>
      <StyledButtonGroup
        orientation="vertical"
        variant="outlined"
        size="small"
        disabled={disabled}
      >
        <Button
          onClick={() => handleBasemapChange("cesium")}
          variant={selectedBasemap === "cesium" ? "contained" : "outlined"}
        >
          Cesium World Imagery
        </Button>
        <Button
          onClick={() => handleBasemapChange("google")}
          variant={selectedBasemap === "google" ? "contained" : "outlined"}
        >
          Google Satellite
        </Button>
        <Button
          onClick={() => handleBasemapChange("google-photorealistic")}
          variant={
            selectedBasemap === "google-photorealistic"
              ? "contained"
              : "outlined"
          }
        >
          Google Photorealistic
        </Button>
        <Button
          onClick={() => handleBasemapChange("none")}
          variant={selectedBasemap === "none" ? "contained" : "outlined"}
        >
          No Basemap
        </Button>
      </StyledButtonGroup>
    </Container>
  );
};

export default CesiumBasemapSelector;
