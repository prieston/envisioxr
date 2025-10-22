import { useState } from "react";

export interface CesiumIonUploadOptions {
  dracoCompression?: boolean;
  ktx2Compression?: boolean;
  webpImages?: boolean;
  geometricCompression?: string;
  epsgCode?: string;
  makeDownloadable?: boolean;
}

export interface CesiumIonUploadData {
  file: File;
  name: string;
  description: string;
  sourceType: string;
  accessToken: string;
  longitude?: number;
  latitude?: number;
  height?: number;
  options?: CesiumIonUploadOptions;
}

export interface CesiumIonAssetStatus {
  status: string;
  percentComplete?: number;
  error?: { message?: string };
  name?: string;
  description?: string;
  type?: string;
  bytes?: number;
}

/**
 * Hook for handling Cesium Ion file uploads
 * Pure Cesium Ion logic without app-specific API calls
 */
export const useCesiumIonUpload = () => {
  const [ionUploading, setIonUploading] = useState(false);
  const [ionUploadProgress, setIonUploadProgress] = useState(0);

  /**
   * Poll Cesium Ion asset status until tiling completes
   */
  const pollAssetStatus = async (
    assetId: number,
    accessToken: string,
    onProgress?: (status: string, percentComplete: number) => void
  ): Promise<CesiumIonAssetStatus> => {
    const maxAttempts = 40; // 40 attempts * 3s = 2 minutes max
    const pollInterval = 3000; // 3 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `https://api.cesium.com/v1/assets/${assetId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch asset status: ${response.status}`);
        }

        const assetInfo: CesiumIonAssetStatus = await response.json();
        const status = assetInfo.status;
        const percentComplete = assetInfo.percentComplete || 0;

        console.log(
          `🔄 Tiling status: ${status} (${percentComplete}% complete)`
        );

        if (onProgress) {
          onProgress(status, percentComplete);
        }

        if (status === "COMPLETE") {
          console.log("✅ Tiling complete!");
          return assetInfo;
        }

        if (status === "ERROR" || status === "FAILED") {
          const errorMessage = assetInfo.error?.message || "Tiling failed";
          throw new Error(errorMessage);
        }

        // Continue polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error("Error polling asset status:", error);
        throw error;
      }
    }

    throw new Error(
      `Timeout waiting for tiling to complete after ${(maxAttempts * pollInterval) / 1000}s`
    );
  };

  /**
   * Map source type to Cesium Ion's expected format
   */
  const mapSourceType = (sourceType: string) => {
    let ionType = sourceType;
    let uploadSourceType: string | undefined = undefined;

    if (sourceType === "3DTILES" || sourceType === "GLTF") {
      ionType = sourceType;
      uploadSourceType = "3D_MODEL";
    } else if (sourceType === "3DTILES_BIM") {
      ionType = "3DTILES";
      uploadSourceType = "3D_MODEL";
    } else if (sourceType === "3DTILES_PHOTOGRAMMETRY") {
      ionType = "3DTILES";
      uploadSourceType = "3D_CAPTURE";
    } else if (sourceType === "POINTCLOUD") {
      ionType = "3DTILES";
      uploadSourceType = "POINT_CLOUD";
    } else if (sourceType === "IMAGERY") {
      uploadSourceType = "RASTER_IMAGERY";
    } else if (sourceType === "TERRAIN") {
      uploadSourceType = "RASTER_TERRAIN";
    }

    return { ionType, uploadSourceType };
  };

  /**
   * Upload file to S3 using Cesium Ion's temporary credentials
   */
  const uploadToS3 = async (
    file: File,
    uploadLocation: any,
    onProgress?: (percent: number) => void
  ) => {
    const fileBuffer = await file.arrayBuffer();
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

    const s3Client = new S3Client({
      region: "us-east-1",
      endpoint: uploadLocation.endpoint,
      credentials: {
        accessKeyId: uploadLocation.accessKey,
        secretAccessKey: uploadLocation.secretAccessKey,
        sessionToken: uploadLocation.sessionToken,
      },
    });

    const s3Key = `${uploadLocation.prefix}${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: uploadLocation.bucket,
        Key: s3Key,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type || "application/octet-stream",
      })
    );

    if (onProgress) {
      onProgress(90);
    }
  };

  return {
    ionUploading,
    ionUploadProgress,
    setIonUploading,
    setIonUploadProgress,
    pollAssetStatus,
    mapSourceType,
    uploadToS3,
  };
};

