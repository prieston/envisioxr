import React, { useCallback } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import useSceneStore from "../../hooks/useSceneStore";
import useWorldStore from "../../hooks/useWorldStore";
import LocationSearch from "../LocationSearch";
import CesiumIonAssetsManager from "./CesiumIonAssetsManager";
import BasemapSelector from "./BasemapSelector";

const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(3),
  },
}));

const Section = styled(Box)(({ theme }) => ({
  "& > *:not(:last-child)": {
    marginBottom: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: 500,
  marginBottom: theme.spacing(2),
}));

const LocationInfo = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: theme.spacing(1),
}));

const SearchContainer = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  marginTop: "8px",
}));

const EnvironmentPanel: React.FC = () => {
  const engine = useWorldStore((s) => s.engine);
  const {
    gridEnabled,
    setGridEnabled,
    skyboxType,
    setSkyboxType,
    ambientLightIntensity,
    setAmbientLightIntensity,
    showTiles,
    setShowTiles,
    selectedAssetId,
    selectedLocation,
    setSelectedAssetId,
    setSelectedLocation,
    tilesRenderer,
    cesiumViewer,
    cesiumInstance,
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
      if (!event.target.checked) {
        // Don't clear the selectedAssetId and location when disabling tiles
        // setSelectedAssetId("");
        // setSelectedLocation(null);
      }
    },
    [setShowTiles]
  );

  const handleAmbientLightChange = useCallback(
    (event: Event, value: number | number[]) => {
      setAmbientLightIntensity(value as number);
    },
    [setAmbientLightIntensity]
  );

  const handleBasemapChange = useCallback(
    (basemapType: "cesium" | "google" | "bing" | "none") => {
      if (!cesiumViewer || !cesiumInstance) {
        console.warn("Cesium viewer or instance not available");
        return;
      }

      try {
        switch (basemapType) {
          case "cesium": {
            try {
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                cesiumInstance.createWorldImagery()
              );
            } catch (error) {
              console.error("Error setting Cesium World Imagery:", error);
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
          case "bing": {
            const bingKey = process.env.NEXT_PUBLIC_BING_MAPS_KEY;
            if (!bingKey) {
              console.warn(
                "Bing Maps API key not found. Please set NEXT_PUBLIC_BING_MAPS_KEY environment variable."
              );
              // Fall back to Cesium World Imagery if Bing key is not available
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                cesiumInstance.createWorldImagery()
              );
              return;
            }
            try {
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.BingMapsImageryProvider({
                  url: "https://dev.virtualearth.net",
                  key: bingKey,
                  mapStyle: cesiumInstance.BingMapsStyle.AERIAL_WITH_LABELS,
                })
              );
            } catch (error) {
              console.error("Error setting Bing Maps:", error);
              // Fall back to Cesium World Imagery on error
              cesiumViewer.imageryLayers.removeAll();
              cesiumViewer.imageryLayers.addImageryProvider(
                cesiumInstance.createWorldImagery()
              );
            }
            break;
          }
          case "none": {
            try {
              cesiumViewer.imageryLayers.removeAll();
            } catch (error) {
              console.error("Error removing imagery layers:", error);
            }
            break;
          }
        }
      } catch (error) {
        console.error("Error changing basemap:", error);
      }
    },
    [cesiumViewer, cesiumInstance]
  );

  return (
    <Container>
      {/* Environment Settings */}
      <Section>
        <SectionTitle>Environment Settings</SectionTitle>

        <FormControlLabel
          control={
            <Switch
              checked={gridEnabled}
              onChange={(e) => setGridEnabled(e.target.checked)}
            />
          }
          label="Show Grid"
        />

        <Box>
          <Typography gutterBottom>Skybox Type</Typography>
          <Select
            value={skyboxType}
            onChange={(e) =>
              setSkyboxType(e.target.value as "default" | "none")
            }
            fullWidth
            size="small"
          >
            <MenuItem value="default">Default Sky</MenuItem>
            <MenuItem value="none">No Sky</MenuItem>
          </Select>
        </Box>

        <Box>
          <Typography gutterBottom>Ambient Light</Typography>
          <Slider
            value={ambientLightIntensity}
            onChange={handleAmbientLightChange}
            min={0}
            max={1}
            step={0.1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
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
                    Reference Height:{" "}
                    {tilesRenderer?.group?.position.y.toFixed(2)}m
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
        </Box>
      </Section>

      {/* Cesium Ion Assets Management */}
      <Section>
        <CesiumIonAssetsManager />
      </Section>

      {/* Basemap Selector - Only show for Cesium engine */}
      {engine === "cesium" && (
        <Section>
          <BasemapSelector
            onBasemapChange={handleBasemapChange}
            currentBasemap="cesium"
            disabled={!cesiumViewer || !cesiumInstance}
          />
        </Section>
      )}
    </Container>
  );
};

export default EnvironmentPanel;
