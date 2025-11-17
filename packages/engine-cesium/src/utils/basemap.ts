/**
 * Utility functions for managing Cesium basemaps
 */

export type BasemapType =
  | "cesium"
  | "google"
  | "google-photorealistic"
  | "bing"
  | "none";

/**
 * Utility function to apply basemap type
 * Returns the tileset reference if one was created (for cleanup)
 */
export const applyBasemapType = async (
  viewer: any,
  Cesium: any,
  basemapType: BasemapType
): Promise<any | null> => {
  try {
    // Always remove existing imagery layers first
    viewer.imageryLayers.removeAll();

    // Remove only basemap-related Cesium3DTileset primitives (Google Photorealistic)
    // Preserve custom Cesium Ion assets
    const primitives = viewer.scene.primitives;
    for (let i = primitives.length - 1; i >= 0; i--) {
      const primitive = primitives.get(i);
      if (primitive && primitive.assetId === 2275207) {
        // Only remove Google Photorealistic tileset (assetId 2275207)
        // This is the only basemap-related tileset we manage
        primitives.remove(primitive);
      }
    }

    switch (basemapType) {
      case "cesium": {
        try {
          // Add Cesium World Imagery
          viewer.imageryLayers.addImageryProvider(
            new Cesium.IonImageryProvider({ assetId: 2 })
          );
        } catch (error) {
          // Error setting Cesium World Imagery
          console.error("Error setting Cesium World Imagery:", error);
          // Fallback to OpenStreetMap
          try {
            viewer.imageryLayers.addImageryProvider(
              new Cesium.UrlTemplateImageryProvider({
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
          // Add Google Satellite imagery
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
              credit: "© Google",
            })
          );
        } catch (error) {
          // Error setting Google Satellite
        }
        break;
      }
      case "google-photorealistic": {
        const cesiumKey =
          process.env.NEXT_PUBLIC_CESIUM_ION_KEY ||
          process.env.NEXT_PUBLIC_CESIUM_TOKEN;
        if (!cesiumKey) {
          // Cesium Ion key not found. Falling back to OpenStreetMap.
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              credit: "© OpenStreetMap contributors",
            })
          );
          return;
        }
        try {
          // Add Google Satellite imagery as the base layer for Google Photorealistic
          // This prevents the blue "no imagery" background from showing
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
              credit: "© Google",
            })
          );

          // Add Google Photorealistic 3D tiles on top
          const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(2275207);
          // Set the assetId property for easy identification
          tileset.assetId = 2275207;
          // Remove any existing basemap tileset before adding new one (cleanup)
          for (let i = viewer.scene.primitives.length - 1; i >= 0; i--) {
            const primitive = viewer.scene.primitives.get(i);
            if (primitive && primitive.assetId === 2275207) {
              viewer.scene.primitives.remove(primitive);
            }
          }
          viewer.scene.primitives.add(tileset);
          return tileset; // Return tileset for cleanup tracking
        } catch (error) {
          // Error setting Google Photorealistic
          viewer.imageryLayers.addImageryProvider(
            new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              credit: "© OpenStreetMap contributors",
            })
          );
        }
        break;
      }
      case "bing": {
        try {
          // Add Bing Maps imagery
          viewer.imageryLayers.addImageryProvider(
            new Cesium.BingMapsImageryProvider({
              url: "https://dev.virtualearth.net",
              key: process.env.NEXT_PUBLIC_BING_MAPS_KEY || "",
              mapStyle: Cesium.BingMapsStyle.AERIAL,
            })
          );
        } catch (error) {
          // Error setting Bing Maps, fallback to OpenStreetMap
          console.error("Error setting Bing Maps:", error);
          try {
            viewer.imageryLayers.addImageryProvider(
              new Cesium.UrlTemplateImageryProvider({
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
      case "none": {
        // No imagery or primitives needed for "none"
        break;
      }
    }
    return null; // No tileset created for other basemap types
  } catch (error) {
    // Error applying basemap
    return null;
  }
};

