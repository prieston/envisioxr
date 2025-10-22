import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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
  accessToken: string;
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

export async function POST(request: NextRequest) {
  try {
    // Unique marker to verify we're hitting the latest code
    // eslint-disable-next-line no-console
    console.log("🚀 ION ROUTE v2.0 - POST /api/ion-upload");

    // Check authentication
    const session = (await getServerSession(authOptions)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CesiumIonUploadRequest = await request.json();
    const { name, description, type, accessToken, options } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name and type" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing Cesium Ion access token" },
        { status: 400 }
      );
    }

    // Prepare the request payload for Cesium Ion
    // Start with required fields - description must always be present (can be empty string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assetPayload: Record<string, any> = {
      name,
      description: description || "", // Cesium Ion requires description field, even if empty
      type,
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
    }

    // Only add options to payload if there are any
    if (Object.keys(cleanOptions).length > 0) {
      assetPayload.options = cleanOptions;
    }

    // Log final payload for debugging
    // eslint-disable-next-line no-console
    console.log(
      "🔍 Final assetPayload before sending:",
      JSON.stringify(assetPayload, null, 2)
    );

    // Ion automatically determines the upload location
    // Do NOT add any query parameters (like assetRegion) - Cesium Ion doesn't support them on this endpoint
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
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyString,
      redirect: "manual", // Don't follow redirects that might add query params
    };

    // eslint-disable-next-line no-console
    console.log(
      "📤 Outgoing Ion Request:",
      JSON.stringify(
        {
          url: endpoint,
          method: requestInit.method,
          headers: {
            Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          hasBody: !!requestInit.body,
          payloadSize: bodyString.length,
        },
        null,
        2
      )
    );
    // eslint-disable-next-line no-console
    console.log("📦 Payload:", JSON.stringify(assetPayload, null, 2));
    // eslint-disable-next-line no-console
    console.log("🔍 Request URL (should have NO query params):", endpoint);
    // eslint-disable-next-line no-console
    console.log("🔍 Request method:", requestInit.method);

    // Step 1: Create a new asset on Cesium Ion using user's token
    const createAssetResponse = await fetch(endpoint, requestInit);

    // eslint-disable-next-line no-console
    console.log("Cesium Ion response status:", createAssetResponse.status);
    // eslint-disable-next-line no-console
    console.log("Cesium Ion response URL:", createAssetResponse.url);
    // eslint-disable-next-line no-console
    console.log(
      "Cesium Ion response headers:",
      Object.fromEntries(createAssetResponse.headers.entries())
    );

    if (!createAssetResponse.ok) {
      const errorText = await createAssetResponse.text();
      console.error("Cesium Ion asset creation failed:");
      console.error("Status:", createAssetResponse.status);
      console.error("Response:", errorText);
      console.error("Payload sent:", JSON.stringify(assetPayload, null, 2));

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
    // eslint-disable-next-line no-console
    console.log("🔍 ION RAW RESPONSE:", rawText);

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

    // eslint-disable-next-line no-console
    console.log("✅ Asset created with ID:", assetId);

    // Log the parsed data structure
    // eslint-disable-next-line no-console
    console.log("📦 Parsed Ion Response:", {
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
    const session = (await getServerSession(authOptions)) as Session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { onComplete, accessToken } = body;

    if (!onComplete || !onComplete.method || !onComplete.url) {
      return NextResponse.json(
        { error: "Missing onComplete information" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token for completion" },
        { status: 400 }
      );
    }

    // Notify Cesium Ion that the upload is complete
    // Per Cesium's tutorial: send Authorization header + JSON body with fields
    const requestOptions: RequestInit = {
      method: onComplete.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(onComplete.fields || {}),
    };

    // eslint-disable-next-line no-console
    console.log("📤 Completing upload to Ion:", onComplete.url);

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
