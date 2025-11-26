/**
 * Professional utilities for Cesium 3D Tileset operations
 * Handles transform application, serialization, and positioning
 */

import { arrayToMatrix4, matrix4ToArray } from './tileset-transform';

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
    if (options?.log) {
      console.log('[TilesetOps] No valid transform to apply');
    }
    return false;
  }

  try {
    const matrix = arrayToMatrix4(Cesium, transform.matrix);

    // Verify round-trip if logging is enabled
    if (options?.log) {
      const verify = Cesium.Matrix4.toArray(matrix, new Array(16));
      const match = verify.every(
        (v: number, i: number) => Math.abs(v - transform.matrix[i]) < 0.0000001
      );

      console.log('[TilesetOps] Applying transform:', {
        longitude: transform.longitude,
        latitude: transform.latitude,
        height: transform.height,
        matrixString: transform.matrix.join(',').substring(0, 50) + '...',
        verified: match,
      });
    }

    tileset.modelMatrix = matrix;

    if (options?.requestRender && options?.viewer) {
      options.viewer.scene.requestRender();
    }

    return true;
  } catch (err) {
    console.error('[TilesetOps] Failed to apply transform:', err);
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

    const cartographic = Cesium.Cartographic.fromCartesian(translation);

    return {
      matrix,
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height,
    };
  } catch (err) {
    console.error('[TilesetOps] Failed to extract transform:', err);
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
export function positionCameraForTileset(
  viewer: any,
  Cesium: any,
  transform?: TilesetTransformData,
  options?: {
    offset?: number;
    duration?: number;
    pitch?: number;
  }
): void {
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
  const destination = Cesium.Cartesian3.fromDegrees(longitude, latitude, idealHeight);

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

