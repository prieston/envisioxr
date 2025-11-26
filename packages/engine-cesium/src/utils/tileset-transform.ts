/**
 * Utility functions for tileset transform operations
 */

/**
 * Creates a Cesium Matrix4 from longitude, latitude, and height
 * with identity rotation (heading/pitch/roll = 0) and scale = 1
 */
export function createTilesetMatrixFromLngLatHeight(params: {
  longitude: number;
  latitude: number;
  height: number;
}): number[] {
  const { longitude, latitude, height } = params;

  // Convert lon/lat/height to Cartesian3
  // We'll use Cesium's Transforms to create the matrix
  // This will be called from within a Cesium context, so we need to pass Cesium instance
  // For now, return a structure that can be used to create the matrix
  // The actual matrix creation will happen in the component with Cesium available

  // Return as array of 16 numbers (Matrix4 column-major order)
  // This is a placeholder - actual implementation will use Cesium.Transforms
  return [
    1, 0, 0, 0, // column 0
    0, 1, 0, 0, // column 1
    0, 0, 1, 0, // column 2
    0, 0, 0, 1, // column 3 (translation will be set)
  ];
}

/**
 * Creates a Cesium Matrix4 from longitude, latitude, and height using Cesium instance
 */
export function createTilesetMatrixFromLngLatHeightWithCesium(
  Cesium: any,
  params: {
    longitude: number;
    latitude: number;
    height: number;
  }
): any {
  const { longitude, latitude, height } = params;

  // Create a position in WGS84
  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

  // Create a transform matrix from ENU (East-North-Up) frame at this position
  // This gives us a local frame at the specified location
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);

  // Return the matrix
  return transform;
}

/**
 * Extracts longitude, latitude, and height from a Cesium Matrix4
 */
export function extractLngLatHeightFromMatrix(
  Cesium: any,
  matrix: any
): { longitude: number; latitude: number; height: number } | null {
  try {
    // Extract translation (last column, first 3 rows)
    const translation = new Cesium.Cartesian3(
      matrix[12],
      matrix[13],
      matrix[14]
    );

    // Convert Cartesian3 to Cartographic (lon/lat/height)
    const cartographic = Cesium.Cartographic.fromCartesian(translation);

    return {
      longitude: Cesium.Math.toDegrees(cartographic.longitude),
      latitude: Cesium.Math.toDegrees(cartographic.latitude),
      height: cartographic.height,
    };
  } catch (error) {
    console.error("Failed to extract lon/lat/height from matrix:", error);
    return null;
  }
}

/**
 * Converts a Matrix4 to a serializable array (16 numbers)
 * Uses Cesium's native serialization to preserve column-major order
 */
export function matrix4ToArray(matrix: any): number[] {
  if (Array.isArray(matrix)) {
    return matrix;
  }

  // Use Cesium's native toArray method if available
  if (matrix && typeof matrix.toArray === 'function') {
    const result = new Array(16);
    return matrix.toArray(result);
  }

  // Fallback: direct indexing (Cesium matrices are array-like)
  const result = new Array(16);
  for (let i = 0; i < 16; i++) {
    result[i] = matrix[i];
  }
  return result;
}

/**
 * Creates a Cesium Matrix4 from a serialized array (16 numbers)
 * Uses Cesium's native deserialization to preserve column-major order
 */
export function arrayToMatrix4(Cesium: any, array: number[]): any {
  // Use Cesium's native fromArray method - preserves column-major order
  return Cesium.Matrix4.fromArray(array);
}

