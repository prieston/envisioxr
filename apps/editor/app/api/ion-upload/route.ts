import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/cesium/encryption";
import { isUserMemberOfOrganization } from "@/lib/organizations";

// Use console directly in API routes (server-side code)
const logger = {
  debug: (...args: unknown[]) => console.debug("[IonUpload]", ...args),
  info: (...args: unknown[]) => console.info("[IonUpload]", ...args),
  warn: (...args: unknown[]) => console.warn("[IonUpload]", ...args),
  error: (...args: unknown[]) => console.error("[IonUpload]", ...args),
};

// Force Node.js runtime (not Edge) for better fetch/FormData support
export const runtime = "nodejs";

interface Session {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

interface CesiumIonUploadRequest {
  name: string;
  description?: string;
  type: string;
  accessToken?: string; // Optional: can use integrationId instead
  integrationId?: string; // Optional: can use accessToken instead
  options?: {
    sourceType?: string;
    position?: {
      longitude: number;
      latitude: number;
      height: number;
    };
    inputCrs?: string; // "EPSG:xxxx" format for IFC without embedded CRS
    geometryCompression?: string; // "MESHOPT" | "DRACO" for BIM/CAD
    textureFormat?: string; // "KTX2" for BIM/CAD
    tilesetJson?: string;
    makeDownloadable?: boolean;
    dracoCompression?: boolean; // For point clouds
    gaussianSplats?: boolean; // For point clouds
    // 3D Reconstruction options
    meshQuality?: string; // "Low" | "Medium" | "High"
    useGpsInfo?: boolean;
    outputs?: {
      cesium3DTiles?: boolean;
      las?: boolean;
      gaussianSplats?: boolean;
    };
  };
}

interface CesiumIonAssetResponse {
  assetId?: number; // Optional: prefer assetMetadata.id
  assetMetadata?: {
    id: number;
    name: string;
    description?: string;
    type?: string;
    bytes?: number;
    dateAdded?: string;
    status?: string;
  };
  uploadLocation: {
    endpoint: string;
    bucket: string;
    prefix: string;
    accessKey: string;
    secretAccessKey: string;
    sessionToken: string;
  };
  onComplete: {
    method: "POST" | "PUT";
    url: string;
    fields?: Record<string, string>;
  };
}

/**
 * POST: Create a Cesium Ion asset and get upload location.
 *
 * Note: This endpoint only creates the asset on Cesium Ion's side.
 * The actual database record is created via POST /api/models which requires organizationId.
 * This endpoint is authenticated but does not require organizationId as it's a utility endpoint
 * that interfaces with Cesium Ion API. The organization scoping happens when the asset
 * record is saved to the database via /api/models POST.
 */
export async function POST(request: NextRequest) {
  try {
    // Unique marker to verify we're hitting the latest code
    // eslint-disable-next-line no-console

    // Check authentication
    const session = (await auth()) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CesiumIonUploadRequest = await request.json();
    const { name, description, type, accessToken, integrationId, options } =
      body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name and type" },
        { status: 400 }
      );
    }

    // Map source type to Cesium Ion's expected format
    const mapSourceTypeToIonType = (sourceType: string): string => {
      if (sourceType === "PHOTOS_3D_RECONSTRUCTION") {
        return "3DTILES";
      }
      if (sourceType === "3DTILES_ARCHIVE") {
        return "3DTILES";
      }
      if (sourceType === "3DTILES_BIM") {
        return "3DTILES";
      }
      if (sourceType === "3DTILES_PHOTOGRAMMETRY") {
        return "3DTILES";
      }
      if (sourceType === "POINTCLOUD") {
        return "3DTILES";
      }
      // For other types, use as-is (GLTF, IMAGERY, TERRAIN, etc.)
      return sourceType;
    };

    const ionType = mapSourceTypeToIonType(type);

    // Get access token from either direct input or integration
    let finalAccessToken: string;
    if (integrationId) {
      // Fetch integration and decrypt upload token
      const integration = await prisma.cesiumIonIntegration.findUnique({
        where: { id: integrationId },
        select: {
          id: true,
          organizationId: true,
          uploadToken: true,
          uploadTokenValid: true,
        },
      });

      if (!integration) {
        return NextResponse.json(
          { error: "Integration not found" },
          { status: 404 }
        );
      }

      // Verify user is a member of the organization
      const isMember = await isUserMemberOfOrganization(
        session.user.id!,
        integration.organizationId
      );
      if (!isMember) {
        return NextResponse.json(
          { error: "User is not a member of this organization" },
          { status: 403 }
        );
      }

      if (!integration.uploadTokenValid) {
        return NextResponse.json(
          { error: "Integration upload token is not valid" },
          { status: 400 }
        );
      }

      finalAccessToken = decryptToken(integration.uploadToken);
    } else if (accessToken) {
      finalAccessToken = accessToken;
    } else {
      return NextResponse.json(
        { error: "Missing Cesium Ion access token or integration ID" },
        { status: 400 }
      );
    }

    // Prepare the request payload for Cesium Ion
    // Start with required fields - description must always be present (can be empty string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assetPayload: Record<string, any> = {
      name,
      description: description || "", // Cesium Ion requires description field, even if empty
      type: ionType, // Use mapped Ion type instead of source type
    };

    // Build options object only with recognized Ion API fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanOptions: Record<string, any> = {};

    if (options) {
      // sourceType: "BIM_CAD" for IFC/BIM tiling (not "3D_MODEL")
      if (options.sourceType) {
        cleanOptions.sourceType = options.sourceType;
      }

      // position: object shape { longitude, latitude, height }
      // Sets the origin point where Ion places the model on the globe
      if (options.position) {
        cleanOptions.position = {
          longitude: options.position.longitude,
          latitude: options.position.latitude,
          height: options.position.height,
        };
      }

      // inputCrs: "EPSG:xxxx" format for IFC without embedded CRS
      if (options.inputCrs) {
        cleanOptions.inputCrs = options.inputCrs;
      }

      // geometryCompression: "MESHOPT" or "DRACO" for BIM/CAD (note: no "ric" in field name)
      if (options.geometryCompression) {
        const compression = options.geometryCompression.toUpperCase();
        if (compression === "MESHOPT" || compression === "DRACO") {
          cleanOptions.geometryCompression = compression;
        }
      }

      // textureFormat: "KTX2" for BIM/CAD
      if (options.textureFormat) {
        cleanOptions.textureFormat = options.textureFormat.toUpperCase();
      }

      if (options.tilesetJson) {
        cleanOptions.tilesetJson = options.tilesetJson;
      }

      if (typeof options.makeDownloadable === "boolean") {
        cleanOptions.makeDownloadable = options.makeDownloadable;
      }

      // Point Cloud options
      if (typeof options.dracoCompression === "boolean") {
        cleanOptions.dracoCompression = options.dracoCompression;
      }

      if (typeof options.gaussianSplats === "boolean") {
        cleanOptions.gaussianSplats = options.gaussianSplats;
      }

      // 3D Reconstruction options
      if (options.meshQuality) {
        cleanOptions.meshQuality = options.meshQuality;
      }

      if (typeof options.useGpsInfo === "boolean") {
        cleanOptions.useGpsInfo = options.useGpsInfo;
      }

      if (options.outputs) {
        cleanOptions.outputs = {
          cesium3DTiles: options.outputs.cesium3DTiles ?? true,
          las: options.outputs.las ?? false,
          gaussianSplats: options.outputs.gaussianSplats ?? false,
        };
      }
    }

    // Only add options to payload if there are any
    if (Object.keys(cleanOptions).length > 0) {
      assetPayload.options = cleanOptions;
    }

    // Log final payload for debugging
    // eslint-disable-next-line no-console

    // Ion automatically determines the upload location
    // Do NOT add any query parameters (like assetRegion) - Cesium Ion doesn't support them on this endpoint
    // Region is specified when requesting upload location, not when creating the asset
    const endpoint = "https://api.cesium.com/v1/assets";

    // Safety guard: ensure no assetRegion parameter sneaks in
    if (endpoint.includes("assetRegion=") || endpoint.includes("?")) {
      throw new Error(
        "Do not use query parameters on Ion create asset endpoint"
      );
    }

    // Prepare request details
    // Important: No query params, only body params
    const bodyString = JSON.stringify(assetPayload);
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${finalAccessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyString,
      redirect: "manual", // Don't follow redirects that might add query params
    };

    // Debug logging for sanity check
    logger.debug("[ion] CREATE URL", endpoint); // must be https://api.cesium.com/v1/assets with NO query
    logger.debug("[ion] CREATE BODY", JSON.stringify(assetPayload, null, 2)); // as above

    // eslint-disable-next-line no-console

    // Step 1: Create a new asset on Cesium Ion using user's token
    const createAssetResponse = await fetch(endpoint, requestInit);

    logger.debug("Cesium Ion response status:", createAssetResponse.status);
    logger.debug("Cesium Ion response URL:", createAssetResponse.url);
    logger.debug(
      "Cesium Ion response headers:",
      Object.fromEntries(createAssetResponse.headers.entries())
    );

    if (!createAssetResponse.ok) {
      const errorText = await createAssetResponse.text();
      logger.error("Cesium Ion asset creation failed:");
      logger.error("Status:", createAssetResponse.status);
      logger.error("Response:", errorText);
      logger.error("Payload sent:", JSON.stringify(assetPayload, null, 2));

      return NextResponse.json(
        {
          error: `Failed to create asset on Cesium Ion: ${createAssetResponse.status}`,
          details: errorText,
          sentPayload: assetPayload,
        },
        { status: createAssetResponse.status }
      );
    }

    // Parse and log the raw Ion response for debugging
    const rawText = await createAssetResponse.text();
    logger.debug("🔍 ION RAW RESPONSE:", rawText);

    const ionResponse: CesiumIonAssetResponse = JSON.parse(rawText);

    // Prefer assetMetadata.id over assetId or regex parsing
    const assetId =
      ionResponse.assetMetadata?.id ??
      ionResponse.assetId ??
      (() => {
        const match = /sources\/(\d+)\//.exec(
          ionResponse.uploadLocation?.prefix || ""
        );
        return match ? Number(match[1]) : undefined;
      })();

    if (!assetId) {
      throw new Error(
        "Ion response missing assetMetadata.id, assetId, and prefix; cannot proceed."
      );
    }

    logger.info("✅ Asset created with ID:", assetId);

    // Log the parsed data structure
    logger.debug("📦 Parsed Ion Response:", {
      assetId,
      hasAssetMetadata: !!ionResponse.assetMetadata,
      uploadLocationKeys: Object.keys(ionResponse.uploadLocation || {}),
      hasOnComplete: !!ionResponse.onComplete,
    });

    // Return upload credentials and asset information to the client
    // Include assetMetadata for better tracking
    return NextResponse.json({
      assetId,
      assetMetadata: ionResponse.assetMetadata,
      uploadLocation: ionResponse.uploadLocation,
      onComplete: ionResponse.onComplete,
    });
  } catch (error) {
    console.error("Ion upload API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Complete the upload after file has been uploaded
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = (await auth()) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { onComplete, accessToken, integrationId } = body;

    if (!onComplete || !onComplete.method || !onComplete.url) {
      return NextResponse.json(
        { error: "Missing onComplete information" },
        { status: 400 }
      );
    }

    // Get access token from either direct input or integration
    let finalAccessToken: string;
    if (integrationId) {
      // Fetch integration and decrypt upload token
      const integration = await prisma.cesiumIonIntegration.findUnique({
        where: { id: integrationId },
        select: {
          id: true,
          organizationId: true,
          uploadToken: true,
          uploadTokenValid: true,
        },
      });

      if (!integration) {
        return NextResponse.json(
          { error: "Integration not found" },
          { status: 404 }
        );
      }

      // Verify user is a member of the organization
      const isMember = await isUserMemberOfOrganization(
        session.user.id!,
        integration.organizationId
      );
      if (!isMember) {
        return NextResponse.json(
          { error: "User is not a member of this organization" },
          { status: 403 }
        );
      }

      if (!integration.uploadTokenValid) {
        return NextResponse.json(
          { error: "Integration upload token is not valid" },
          { status: 400 }
        );
      }

      finalAccessToken = decryptToken(integration.uploadToken);
    } else if (accessToken) {
      finalAccessToken = accessToken;
    } else {
      return NextResponse.json(
        { error: "Missing access token or integration ID for completion" },
        { status: 400 }
      );
    }

    // Notify Cesium Ion that the upload is complete
    // Per Cesium's tutorial: send Authorization header + JSON body with fields
    const requestOptions: RequestInit = {
      method: onComplete.method,
      headers: {
        Authorization: `Bearer ${finalAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(onComplete.fields || {}),
    };

    // eslint-disable-next-line no-console

    const completeResponse = await fetch(onComplete.url, requestOptions);

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text();
      console.error("Cesium Ion upload completion failed:", errorText);
      return NextResponse.json(
        {
          error: `Failed to complete upload: ${completeResponse.status}`,
          details: errorText,
        },
        { status: completeResponse.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ion upload completion error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
