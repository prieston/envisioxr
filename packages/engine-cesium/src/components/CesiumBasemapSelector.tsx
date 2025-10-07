import React, { useCallback, useState } from "react";
import { Select, MenuItem, FormControl } from "@mui/material";
import { Container, SectionTitle } from "./CesiumBasemapSelector.styles";
import { useSceneStore } from "@envisio/core";

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

      try {
        // Always remove existing imagery layers first
        cesiumViewer.imageryLayers.removeAll();

        // Remove only basemap-related Cesium3DTileset primitives (Google Photorealistic)
        // Preserve custom Cesium Ion assets
        if (
          !cesiumViewer ||
          !cesiumViewer.scene ||
          !cesiumViewer.scene.primitives
        ) {
          return;
        }
        const primitives = cesiumViewer.scene.primitives;
        for (let i = primitives.length - 1; i >= 0; i--) {
          const primitive = primitives.get(i);
          if (primitive && primitive.assetId === 2275207) {
            // Only remove Google Photorealistic tileset (assetId 2275207)
            // This is the only basemap-related tileset we manage
            primitives.remove(primitive);
            // Removed basemap tileset: primitive.assetId
          }
        }

        switch (basemapType) {
          case "cesium": {
            try {
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
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.UrlTemplateImageryProvider({
                  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                  credit: "© OpenStreetMap contributors",
                })
              );
              return;
            }
            try {
              // Add Google Satellite imagery as the base layer for Google Photorealistic
              // This prevents the blue "no imagery" background from showing
              cesiumViewer.imageryLayers.addImageryProvider(
                new cesiumInstance.UrlTemplateImageryProvider({
                  url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                  credit: "© Google",
                })
              );

              // Add Google Photorealistic 3D tiles on top
              const tileset =
                await cesiumInstance.Cesium3DTileset.fromIonAssetId(2275207);

              // Set the assetId property for easy identification
              tileset.assetId = 2275207;

              // Add the tileset to the scene
              if (cesiumViewer.scene && cesiumViewer.scene.primitives) {
                cesiumViewer.scene.primitives.add(tileset);
              }
              // Added Google Photorealistic tileset with assetId: tileset.assetId
            } catch (error) {
              // Error setting Google Photorealistic: error
              // Fall back to OpenStreetMap on error
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
            // No imagery or primitives needed for "none" - already cleared above
            break;
          }
        }

        // Only update the scene store after the basemap change is successfully applied
        onBasemapChange(basemapType);
      } catch (error) {
        console.error("Error changing basemap:", error);
        // Revert the selected basemap if there was an error
        setSelectedBasemap(currentBasemap);
      }
    },
    [cesiumViewer, cesiumInstance, onBasemapChange, currentBasemap]
  );

  if (disabled) {
    return null;
  }

  return (
    <Container>
      <SectionTitle>Basemap</SectionTitle>
      <FormControl fullWidth size="small">
        <Select
          value={selectedBasemap}
          onChange={(e) => handleBasemapChange(e.target.value as any)}
          disabled={disabled}
          sx={{
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.875rem",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(226, 232, 240, 0.8)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(37, 99, 235, 0.4)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2563eb",
              borderWidth: "2px",
            },
          }}
        >
          <MenuItem
            value="cesium"
            sx={{
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                },
              },
            }}
          >
            Cesium World Imagery
          </MenuItem>
          <MenuItem
            value="google"
            sx={{
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                },
              },
            }}
          >
            Google Satellite
          </MenuItem>
          <MenuItem
            value="google-photorealistic"
            sx={{
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                },
              },
            }}
          >
            Google Photorealistic
          </MenuItem>
          <MenuItem
            value="none"
            sx={{
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.12)",
                },
              },
            }}
          >
            No Basemap
          </MenuItem>
        </Select>
      </FormControl>
    </Container>
  );
};

export default CesiumBasemapSelector;
