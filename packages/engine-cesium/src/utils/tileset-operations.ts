/**
 * Professional utilities for Cesium 3D Tileset operations
 * Handles transform application, serialization, and positioning
 */

import { arrayToMatrix4, matrix4ToArray } from "./tileset-transform";
import { waitForSceneReady } from "./viewer-config";

/**
 * Extract transform from model metadata
 * @param metadata - Model metadata object
 * @returns Transform data or undefined if not found
 */
export function extractTransformFromMetadata(
  metadata: Record<string, unknown> | undefined | null
): TilesetTransformData | undefined {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  if (
    !("transform" in metadata) ||
    metadata.transform === null ||
    metadata.transform === undefined
  ) {
    return undefined;
  }

  const transform = metadata.transform as
    | {
        matrix?: unknown;
        longitude?: number;
        latitude?: number;
        height?: number;
      }
    | undefined;

  if (!transform || typeof transform !== "object") {
    return undefined;
  }

  if (!("matrix" in transform) || !Array.isArray(transform.matrix)) {
    return undefined;
  }

  const matrix = transform.matrix as number[];
  if (matrix.length !== 16) {
    return undefined;
  }

  return {
    matrix,
    longitude: transform.longitude,
    latitude: transform.latitude,
    height: transform.height,
  };
}

export interface TilesetTransformData {
  matrix: number[];
  longitude?: number;
  latitude?: number;
  height?: number;
}

/**
 * Apply a transform to a Cesium tileset
 * @param Cesium - Cesium library instance
 * @param tileset - The Cesium3DTileset to transform
 * @param transform - Transform data with matrix array
 * @param options - Additional options
 * @returns true if transform was applied successfully
 */
export function applyTransformToTileset(
  Cesium: any,
  tileset: any,
  transform: TilesetTransformData | undefined,
  options?: {
    viewer?: any;
    requestRender?: boolean;
    log?: boolean;
  }
): boolean {
  if (!transform?.matrix || transform.matrix.length !== 16) {
    return false;
  }

  try {
    const matrix = arrayToMatrix4(Cesium, transform.matrix);

    tileset.modelMatrix = matrix;

    if (options?.requestRender && options?.viewer) {
      options.viewer.scene.requestRender();
    }

    return true;
  } catch (err) {
    console.error("[TilesetOps] Failed to apply transform:", err);
    return false;
  }
}

/**
 * Extract transform data from a tileset's current modelMatrix
 * @param Cesium - Cesium library instance
 * @param tileset - The Cesium3DTileset
 * @returns Transform data or null
 */
export function extractTransformFromTileset(
  Cesium: any,
  tileset: any
): TilesetTransformData | null {
  if (!tileset?.modelMatrix) {
    return null;
  }

  try {
    const matrix = matrix4ToArray(tileset.modelMatrix);

    // Extract translation from matrix
    const translation = new Cesium.Cartesian3(
      tileset.modelMatrix[12],
      tileset.modelMatrix[13],
      tileset.modelMatrix[14]
    );

    // Check if translation is valid (not at origin)
    const magnitude = Cesium.Cartesian3.magnitude(translation);
    if (magnitude < 1e-10) {
      // Translation is at origin, return matrix only without coordinates
      return {
        matrix,
      };
    }

    // Try to convert to cartographic coordinates
    // This can fail if the point is not on the ellipsoid or is invalid
    let cartographic;
    try {
      cartographic = Cesium.Cartographic.fromCartesian(translation);
    } catch (cartErr) {
      // If conversion fails, return matrix only without coordinates
      console.warn(
        "[TilesetOps] Could not convert translation to cartographic, returning matrix only:",
        cartErr
      );
      return {
        matrix,
      };
    }

    // Check if cartographic is valid
    if (!cartographic || cartographic.longitude === undefined) {
      return {
        matrix,
      };
    }

    return {
      matrix,
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height,
    };
  } catch (err) {
    console.error("[TilesetOps] Failed to extract transform:", err);
    return null;
  }
}

/**
 * Position camera to view a tileset with transform
 * @param viewer - Cesium Viewer instance
 * @param Cesium - Cesium library instance
 * @param transform - Transform data with coordinates
 * @param options - Camera positioning options
 */
export async function positionCameraForTileset(
  viewer: any,
  Cesium: any,
  transform?: TilesetTransformData,
  options?: {
    offset?: number;
    duration?: number;
    pitch?: number;
  }
): Promise<void> {
  // Wait for scene to be ready before accessing viewer.camera
  try {
    await waitForSceneReady(viewer, 20, 50);
  } catch (err) {
    console.warn("[positionCameraForTileset] Scene not ready:", err);
    return;
  }

  // Double-check viewer is still valid
  if (
    !viewer ||
    (viewer.isDestroyed && viewer.isDestroyed()) ||
    !viewer.scene
  ) {
    return;
  }

  if (!transform?.longitude || !transform?.latitude) {
    // Default view if no transform
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-122.4194, 37.7749, 10000000),
      duration: options?.duration ?? 0,
    });
    return;
  }

  const { longitude, latitude, height = 0 } = transform;
  const offset = options?.offset ?? 200;
  const pitch = options?.pitch ?? -45;

  const idealHeight = Math.max(height + offset, 50);
  const destination = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    idealHeight
  );

  const orientation = {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(pitch),
    roll: 0,
  };

  viewer.camera.flyTo({
    destination,
    orientation,
    duration: options?.duration ?? 1.5,
  });
}

/**
 * Wait for tileset to be ready
 * @param tileset - The Cesium3DTileset
 * @param timeout - Max wait time in ms
 * @returns Promise that resolves when ready
 */
export async function waitForTilesetReady(
  tileset: any,
  timeout: number = 5000
): Promise<void> {
  if ((tileset as any).readyPromise) {
    await Promise.race([
      (tileset as any).readyPromise,
      new Promise((resolve) => setTimeout(resolve, timeout)),
    ]);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Load a Cesium 3D Tileset and apply transform from metadata if available
 * This function handles the complete flow:
 * 1. Loads the tileset
 * 2. Applies transform before adding to scene
 * 3. Re-applies transform after tileset is ready (Cesium sometimes resets it)
 * 4. Forces multiple renders to ensure proper update
 * @param Cesium - Cesium library instance
 * @param cesiumAssetId - Cesium Ion asset ID
 * @param metadata - Model metadata (optional, will extract transform from it)
 * @param transform - Direct transform data (optional, takes precedence over metadata)
 * @param options - Additional options
 * @returns The loaded tileset
 */
export async function loadTilesetWithTransform(
  Cesium: any,
  cesiumAssetId: string,
  metadata?: Record<string, unknown> | null,
  transform?: TilesetTransformData,
  options?: {
    viewer?: any;
    log?: boolean;
  }
): Promise<any> {
  // Extract transform from metadata if not provided directly
  const transformToApply = transform || extractTransformFromMetadata(metadata);
  const transformMatrix = transformToApply?.matrix;

  // Load tileset - wrap in try-catch to catch any errors during loading
  let tileset: any;
  try {
    tileset = await Cesium.Cesium3DTileset.fromIonAssetId(
      parseInt(cesiumAssetId)
    );
  } catch (loadError: any) {
    // Check if this is a Gaussian splatting error
    const errorMessage = loadError?.message || String(loadError) || "";
    const errorStack = loadError?.stack || "";

    if (
      errorMessage.includes("KHR_spz_gaussian_splats_compression") ||
      errorMessage.includes("Unsupported glTF Extension") ||
      errorMessage.includes("gaussian_splats") ||
      errorMessage.includes("gaussian_splatting") ||
      errorStack.includes("KHR_spz_gaussian_splats_compression")
    ) {
      // Re-throw with a more user-friendly message
      throw new Error(
        "This model uses Gaussian splatting with an unsupported extension. " +
          "Please re-upload the model to Cesium Ion to generate a compatible version " +
          "with the updated Gaussian splatting extensions."
      );
    }
    // Re-throw other errors as-is
    throw loadError;
  }

  // Apply transform BEFORE adding to scene
  if (transformMatrix && transformMatrix.length === 16) {
    const matrix = arrayToMatrix4(Cesium, transformMatrix);
    tileset.modelMatrix = matrix;
  }

  return tileset;
}

/**
 * Re-apply transform to a tileset after it's ready
 * This is necessary because Cesium sometimes resets the modelMatrix after the tileset becomes ready
 * @param Cesium - Cesium library instance
 * @param tileset - The Cesium3DTileset
 * @param transform - Transform data
 * @param options - Additional options
 */
export function reapplyTransformAfterReady(
  Cesium: any,
  tileset: any,
  transform: TilesetTransformData | undefined,
  options?: {
    viewer?: any;
    log?: boolean;
  }
): void {
  if (!transform?.matrix || transform.matrix.length !== 16) {
    return;
  }

  try {
    const matrix = arrayToMatrix4(Cesium, transform.matrix);
    tileset.modelMatrix = matrix;

    if (options?.viewer) {
      // Force Cesium to update and render the tileset at new position
      // Request multiple renders to ensure bounding sphere is recalculated
      options.viewer.scene.requestRender();

      // Force immediate updates with staggered timeouts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (options.viewer && !options.viewer.isDestroyed()) {
            try {
            options.viewer.scene.requestRender();
            } catch (err) {
              console.error("[TilesetOps] Error requesting render in setTimeout:", {
                error: err,
                viewerExists: !!options.viewer,
                hasScene: options.viewer?.scene ? "yes" : "no",
                timestamp: new Date().toISOString(),
              });
            }
          }
        }, i * 100);
      }
    }
  } catch (err) {
    console.error("[TilesetOps] Failed to re-apply transform:", err);
  }
}

/**
 * Extract transform and georeferencing information from a tileset
 * This consolidates the duplicate logic for extracting transforms from:
 * - Metadata
 * - Initial transform
 * - Tileset modelMatrix
 * - Tileset bounding sphere (for Cesium Ion georeferenced tilesets)
 * @param Cesium - Cesium library instance
 * @param tileset - The Cesium3DTileset
 * @param metadata - Model metadata (optional)
 * @param initialTransform - Initial transform array (optional)
 * @returns Object with computedTransform and isGeoreferenced flag
 */
export function extractTilesetGeoreferencing(
  Cesium: any,
  tileset: any,
  metadata?: Record<string, unknown> | null,
  initialTransform?: number[]
): {
  computedTransform: TilesetTransformData | undefined;
  isGeoreferenced: boolean;
} {
  // Extract transform from metadata or use initialTransform
  const transformFromMetadata = extractTransformFromMetadata(metadata);

  // If no transform from metadata but tileset has a modelMatrix, extract it
  // Also check bounding sphere center for georeferenced tilesets from Cesium Ion
  let transformFromTileset: TilesetTransformData | undefined = undefined;
  if (!transformFromMetadata && !initialTransform) {
    // Check if tileset is valid before accessing its properties
    if (!tileset) {
      return {
        computedTransform: undefined,
        isGeoreferenced: false,
      };
    }

    // Check if tileset is destroyed
    if (tileset.isDestroyed && tileset.isDestroyed()) {
      return {
        computedTransform: undefined,
        isGeoreferenced: false,
      };
    }

    try {
      // First try to extract from modelMatrix
      if (tileset.modelMatrix) {
        const extracted = extractTransformFromTileset(Cesium, tileset);
        if (
          extracted &&
          extracted.longitude !== undefined &&
          extracted.latitude !== undefined
        ) {
          transformFromTileset = extracted;
        }
      }

      // If modelMatrix doesn't have coordinates, check bounding sphere center
      // This handles tilesets georeferenced by Cesium Ion where the location
      // is embedded in the tileset's root transform (not in modelMatrix)
      if (!transformFromTileset || !transformFromTileset.longitude) {
        // Check if tileset is still valid before accessing boundingSphere
        // Accessing boundingSphere can trigger internal Cesium getters that may fail
        if (tileset && !(tileset.isDestroyed && tileset.isDestroyed())) {
          try {
            const boundingSphere = tileset.boundingSphere;
            if (boundingSphere && boundingSphere.center) {
              const centerMagnitude = Cesium.Cartesian3.magnitude(
                boundingSphere.center
              );
              // Only check if center is not at origin (has meaningful location)
              if (centerMagnitude > 1000) {
                // At least 1km from origin
                const cartographic = Cesium.Cartographic.fromCartesian(
                  boundingSphere.center
                );
                if (cartographic && cartographic.longitude !== undefined) {
                  const longitude = Cesium.Math.toDegrees(
                    cartographic.longitude
                  );
                  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
                  const height = cartographic.height;

                  // Check if coordinates are valid (not at origin or invalid)
                  if (
                    !isNaN(longitude) &&
                    !isNaN(latitude) &&
                    Math.abs(longitude) <= 180 &&
                    Math.abs(latitude) <= 90 &&
                    (Math.abs(longitude) > 0.001 || Math.abs(latitude) > 0.001)
                  ) {
                    const matrix =
                      tileset.modelMatrix || Cesium.Matrix4.IDENTITY;
                    transformFromTileset = {
                      longitude,
                      latitude,
                      height,
                      matrix: matrix4ToArray(matrix),
                    };
                  }
                }
              }
            }
          } catch (bsErr) {
            // Ignore bounding sphere extraction errors
          }
        }
      }
    } catch (err) {
      console.warn(
        "[TilesetOps] Failed to extract transform from tileset:",
        err
      );
    }
  }

  // Compute transform using same logic as normal flow
  const computedTransform: TilesetTransformData | undefined =
    initialTransform && initialTransform.length === 16
      ? { matrix: initialTransform }
      : transformFromMetadata || transformFromTileset;

  // Determine if georeferenced
  // A model is georeferenced ONLY if:
  // 1. There's an explicit transform from metadata or initialTransform (always georeferenced), OR
  // 2. The transform has valid longitude/latitude coordinates (not just a matrix)
  const isGeoreferenced: boolean =
    !!transformFromMetadata ||
    (initialTransform && initialTransform.length === 16) ||
    (computedTransform &&
      computedTransform.longitude !== undefined &&
      computedTransform.latitude !== undefined) ||
    false;

  return {
    computedTransform,
    isGeoreferenced,
  };
}

/**
 * Find an existing tileset in the scene by asset ID
 * @param viewer - Cesium Viewer instance
 * @param cesiumAssetId - Cesium Ion asset ID
 * @returns Existing tileset if found, null otherwise
 */
export function findExistingTileset(
  viewer: any,
  cesiumAssetId: string
): any | null {
  if (!viewer?.scene) {
    return null;
  }

  for (let i = 0; i < viewer.scene.primitives.length; i++) {
    const primitive = viewer.scene.primitives.get(i);
    if (primitive && primitive._kloradAssetId === cesiumAssetId) {
      return primitive;
    }
  }

  return null;
}
