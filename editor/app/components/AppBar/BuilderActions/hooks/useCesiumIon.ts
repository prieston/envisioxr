import { showToast } from "@envisio/core/utils";
import { useSceneStore } from "@envisio/core";
import {
  useCesiumIonUpload,
  type CesiumIonUploadData,
} from "@envisio/engine-cesium";

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
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: "cesiumIonAsset",
          cesiumAssetId: data.assetId,
          cesiumApiKey: data.apiKey,
          name: data.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save Cesium Ion asset");
      }

      const { asset: newAsset } = await res.json();
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
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: assetInfo.name || `Ion Asset ${assetId}`,
          originalFilename: assetInfo.name,
          description: assetInfo.description || "",
          fileType: "cesium-ion",
          assetType: "cesiumIonAsset",
          cesiumAssetId: String(assetId),
          cesiumApiKey: accessToken,
          metadata: {
            ionAssetId: String(assetId),
            type: assetInfo.type,
            status: assetInfo.status,
            bytes: assetInfo.bytes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }

      const data = await response.json();

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

      // Build Ion-compatible options for IFC/BIM
      const ionOptions: any = {};

      // sourceType: "BIM_CAD" for IFC/BIM tiling
      if (uploadSourceType) {
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

      const createAssetResponse = await fetch("/api/ion-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          type: ionType,
          accessToken,
          options: ionOptions,
        }),
      });

      if (!createAssetResponse.ok) {
        const errorData = await createAssetResponse.json();
        console.error("Cesium Ion API Error Response:", errorData);

        let errorMessage =
          errorData.error || "Failed to create asset on Cesium Ion";
        if (errorData.details) {
          try {
            const details =
              typeof errorData.details === "string"
                ? JSON.parse(errorData.details)
                : errorData.details;
            if (details.message) {
              errorMessage = details.message;
            }
          } catch (e) {
            errorMessage = errorData.details;
          }
        }

        throw new Error(errorMessage);
      }

      const { assetId, assetMetadata, uploadLocation, onComplete } =
        await createAssetResponse.json();

      // Prefer assetMetadata.id over assetId or regex parsing
      const inferredId =
        assetMetadata?.id ??
        assetId ??
        (() => {
          const match = /sources\/(\d+)\//.exec(uploadLocation?.prefix || "");
          return match ? Number(match[1]) : undefined;
        })();

      if (!inferredId) {
        throw new Error(
          "Ion response missing assetMetadata.id, assetId, and prefix; cannot proceed."
        );
      }

      setIonUploadProgress(20);

      // Step 2: Upload file to S3
      await uploadToS3(file, uploadLocation, setIonUploadProgress);

      // Step 3: Notify Cesium Ion that upload is complete
      const completeResponse = await fetch("/api/ion-upload", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onComplete, accessToken }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || "Failed to complete upload");
      }

      setIonUploadProgress(100);

      showToast(`Successfully uploaded to Cesium Ion! Asset ID: ${inferredId}`);

      // Poll for tiling status and save to library when complete
      pollAssetStatus(inferredId, accessToken, (status, percent) => {
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
