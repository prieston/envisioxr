import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../../utils/logger";
import type { CesiumIonAsset } from "./types";

const logger = createLogger("SceneStore");

export function createCesiumActions(set: any, get: any) {
  return {
    setCesiumViewer: (viewer: any) => set({ cesiumViewer: viewer }),
    setCesiumInstance: (instance: any) => set({ cesiumInstance: instance }),
    setBasemapType: (
      type: "cesium" | "google" | "google-photorealistic" | "bing" | "none"
    ) => set({ basemapType: type }),
    setCesiumLightingEnabled: (enabled: boolean) =>
      set({ cesiumLightingEnabled: enabled }),
    setCesiumShadowsEnabled: (enabled: boolean) =>
      set({ cesiumShadowsEnabled: enabled }),
    setCesiumCurrentTime: (time: string | null) =>
      set({ cesiumCurrentTime: time }),
    setSelectedCesiumFeature: (feature: any) =>
      set({ selectedCesiumFeature: feature }),
    setTilesRenderer: (renderer: any) => set({ tilesRenderer: renderer }),

    addGoogleTiles: (apiKey: string) =>
      set((state: any) => ({
        objects: [
          ...state.objects,
          {
            id: uuidv4(),
            name: "Google Photorealistic Tiles",
            type: "tiles",
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            apiKey,
            component: "TilesRenderer",
          },
        ],
      })),

    addCesiumIonTiles: () =>
      set((state: any) => ({
        objects: [
          ...state.objects,
          {
            id: uuidv4(),
            name: "Cesium Ion Tiles",
            url: "https://assets.ion.cesium.com/1/",
            type: "tiles",
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            assetId: "2275207",
          },
        ],
      })),

    addCesiumIonAsset: (asset: Omit<CesiumIonAsset, "id">) =>
      set((state: any) => ({
        cesiumIonAssets: [...state.cesiumIonAssets, { ...asset, id: uuidv4() }],
      })),

    removeCesiumIonAsset: (id: string) =>
      set((state: any) => ({
        cesiumIonAssets: state.cesiumIonAssets.filter(
          (asset: CesiumIonAsset) => asset.id !== id
        ),
      })),

    updateCesiumIonAsset: (id: string, updates: Partial<CesiumIonAsset>) =>
      set((state: any) => ({
        cesiumIonAssets: state.cesiumIonAssets.map((asset: CesiumIonAsset) =>
          asset.id === id ? { ...asset, ...updates } : asset
        ),
      })),

    toggleCesiumIonAsset: (id: string) =>
      set((state: any) => ({
        cesiumIonAssets: state.cesiumIonAssets.map((asset: CesiumIonAsset) =>
          asset.id === id ? { ...asset, enabled: !asset.enabled } : asset
        ),
      })),

    setCesiumIonAssets: (assets: CesiumIonAsset[]) =>
      set({ cesiumIonAssets: assets }),

    flyToCesiumIonAsset: (assetId: string) => {
      const state = get();
      const asset = state.cesiumIonAssets.find(
        (a: CesiumIonAsset) => a.id === assetId
      );
      const cesiumViewer = state.cesiumViewer;
      const cesiumInstance = state.cesiumInstance;

      if (!asset || !cesiumViewer || !cesiumInstance) {
        logger.warn(
          "Asset, Cesium viewer, or Cesium instance not available for fly-to"
        );
        return;
      }

      const primitives = (cesiumViewer as any).scene.primitives;
      const expectedAssetId = parseInt((asset as any).assetId);
      let targetTileset: any = null;

      for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives.get(i);
        if (
          primitive &&
          (primitive as any).assetId === expectedAssetId
        ) {
          targetTileset = primitive;
          break;
        }
      }

      if (!targetTileset) {
        logger.warn(
          `[CesiumIon] Could not find tileset for asset: ${(asset as any).name} (${(asset as any).assetId})`
        );
        return;
      }

      try {
        (cesiumViewer as any).flyTo(targetTileset, {
          duration: 2.0,
          offset: new (cesiumInstance as any).HeadingPitchRange(0, -0.5, 1000),
        });
      } catch (error) {
        logger.error("Error flying to asset", error);
      }
    },
  };
}
