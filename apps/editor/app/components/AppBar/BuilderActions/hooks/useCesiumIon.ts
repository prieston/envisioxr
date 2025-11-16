import { showToast } from "@envisio/ui";
import { useSceneStore } from "@envisio/core";
import {
  useCesiumIonUpload,
  type CesiumIonUploadData,
} from "@envisio/engine-cesium";
import { createIonAsset, completeIonUpload, createCesiumIonAsset } from "@/app/utils/api";

/**
 * App-specific Cesium Ion hook that wraps the generic engine-cesium hook
 * with application API integration logic
 */
export const useCesiumIon = () => {
  const {
    ionUploading,
    ionUploadProgress,
    setIonUploading,
    setIonUploadProgress,
    pollAssetStatus,
    mapSourceType,
    uploadToS3,
  } = useCesiumIonUpload();

  const addCesiumIonAsset = useSceneStore((s) => s.addCesiumIonAsset);
  const addModel = useSceneStore((state) => state.addModel);

  // Handle Cesium Ion asset addition (save to app database)
  const handleCesiumAssetAdd = async (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => {
    try {
      // Save to database
      const { asset: newAsset } = await createCesiumIonAsset({
        assetType: "cesiumIonAsset",
        cesiumAssetId: data.assetId,
        cesiumApiKey: data.apiKey,
        name: data.name,
      });
      showToast(`Saved Cesium Ion asset: ${data.name}`);

      // Add to scene store for immediate rendering (both arrays)
      addCesiumIonAsset({
        name: data.name,
        apiKey: data.apiKey || "",
        assetId: data.assetId,
        enabled: true,
      });

      // Also add to objects array so it appears in scene objects list
      addModel({
        name: data.name,
        type: "cesium-ion-tileset",
        apiKey: data.apiKey,
        assetId: data.assetId,
        position: [0, 0, 0], // Placeholder, actual position handled by Cesium
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      });

      return newAsset;
    } catch (error) {
      console.error("Cesium Ion asset save error:", error);
      showToast("An error occurred while saving Cesium Ion asset.");
      throw error;
    }
  };

  // Save Cesium Ion asset to the library after tiling completes
  const saveCesiumIonAssetToLibrary = async (
    assetId: number,
    assetInfo: any,
    accessToken: string,
    onRefresh?: () => void
  ): Promise<void> => {
    try {
      // Save to your database via API
      await createCesiumIonAsset({
        assetType: "cesiumIonAsset",
        cesiumAssetId: String(assetId),
        cesiumApiKey: accessToken,
        name: assetInfo.name || `Ion Asset ${assetId}`,
        description: assetInfo.description || "",
        metadata: {
          ionAssetId: String(assetId),
          type: assetInfo.type,
          status: assetInfo.status,
          bytes: assetInfo.bytes,
        },
      });

      // Refresh the library to show the new asset
      if (onRefresh) {
        onRefresh();
      }
      showToast("Ion asset added to your library!");
    } catch (error) {
      console.error("Error saving Ion asset:", error);
      throw error;
    }
  };

  // Handle upload to Cesium Ion (integrated with app API)
  const handleUploadToIon = async (
    data: CesiumIonUploadData,
    onRefresh?: () => void
  ): Promise<{ assetId: string }> => {
    setIonUploading(true);
    setIonUploadProgress(0);

    try {
      const {
        file,
        name,
        description,
        sourceType,
        accessToken,
        longitude,
        latitude,
        height,
        options,
      } = data;

      // Step 1: Create asset on Cesium Ion via app API
      setIonUploadProgress(10);

      const { ionType, uploadSourceType } = mapSourceType(sourceType);

      // Build Ion-compatible options
      const ionOptions: Record<string, unknown> = {};

      if (sourceType === "3DTILES_ARCHIVE") {
        ionOptions.sourceType = "3DTILES";
        ionOptions.tilesetJson = options?.tilesetJson || "tileset.json";
      } else if (uploadSourceType) {
        ionOptions.sourceType = uploadSourceType;
      }

      // position: object shape { longitude, latitude, height }
      // Sets the origin point where Ion places the model on the globe
      if (longitude !== undefined && latitude !== undefined) {
        ionOptions.position = {
          longitude,
          latitude,
          height: height || 0,
        };
      }

      // inputCrs: "EPSG:xxxx" format for IFC without embedded CRS
      if (options?.epsgCode) {
        ionOptions.inputCrs = `EPSG:${options.epsgCode}`;
      }

      // geometryCompression: "MESHOPT" or "DRACO" for BIM/CAD (note: no "ric" in field name)
      // Remove "NONE" option as Ion doesn't accept it
      if (options?.geometricCompression) {
        const compression = options.geometricCompression.toUpperCase();
        if (compression === "MESHOPT" || compression === "DRACO") {
          ionOptions.geometryCompression = compression;
        }
      }

      // textureFormat: "KTX2" for BIM/CAD uploads
      if (uploadSourceType === "BIM_CAD" && options?.ktx2Compression) {
        ionOptions.textureFormat = "KTX2";
      }

      const createAssetResponse = await createIonAsset({
        name,
        description,
        type: ionType,
        accessToken,
        options: ionOptions,
      });

      const { assetId, assetMetadata, uploadLocation, onComplete } = createAssetResponse;

      // Prefer assetMetadata.id over assetId or regex parsing
      const metadata = assetMetadata as { id?: number } | undefined;
      const location = uploadLocation as { prefix?: string } | undefined;
      const inferredIdRaw =
        metadata?.id ??
        (typeof assetId === 'number' ? assetId : undefined) ??
        (typeof assetId === 'string' ? Number(assetId) : undefined) ??
        (() => {
          const match = /sources\/(\d+)\//.exec(location?.prefix || "");
          return match ? Number(match[1]) : undefined;
        })();

      if (!inferredIdRaw || isNaN(inferredIdRaw)) {
        throw new Error(
          "Ion response missing assetMetadata.id, assetId, and prefix; cannot proceed."
        );
      }
      const inferredId: number = inferredIdRaw;

      setIonUploadProgress(20);

      // Step 2: Upload file to S3
      await uploadToS3(file, uploadLocation, setIonUploadProgress);

      // Step 3: Notify Cesium Ion that upload is complete
      await completeIonUpload({ onComplete, accessToken });

      setIonUploadProgress(100);

      showToast(`Successfully uploaded to Cesium Ion! Asset ID: ${inferredId}`);

      // Poll for tiling status and save to library when complete
      pollAssetStatus(inferredId, accessToken, (_status, _percent) => {
        // Tiling progress update
      })
        .then((assetInfo) => {
          return saveCesiumIonAssetToLibrary(
            inferredId,
            assetInfo,
            accessToken,
            onRefresh
          );
        })
        .catch((err) => {
          console.error("Polling or saving error:", err);
          showToast(`Tiling status check failed: ${err.message}`);
        });

      return { assetId: String(inferredId) };
    } catch (error) {
      console.error("Ion upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Cesium Ion upload failed: ${errorMessage}`);
      throw error;
    } finally {
      setIonUploading(false);
      setIonUploadProgress(0);
    }
  };

  return {
    ionUploading,
    ionUploadProgress,
    handleCesiumAssetAdd,
    handleUploadToIon,
  };
};
