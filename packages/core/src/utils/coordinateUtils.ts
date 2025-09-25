type TilesRenderer = any;
import { MathUtils, Vector3 } from "three";

// Store the reference location
let referenceLatitude = 40.7128; // Default to NYC
let referenceLongitude = -74.006;

export function setReferenceLocation(latitude: number, longitude: number) {
  referenceLatitude = latitude;
  referenceLongitude = longitude;
}

/**
 * Convert a Three.js local Vector3 (tile-set frame) to geographic coords.
 * @param tilesRenderer  the initialized TilesRenderer
 * @param localPos       position in local Y-up frame
 */
export function localToGeographic(
  tilesRenderer: TilesRenderer,
  localPos: Vector3
): { latitude: number; longitude: number; altitude: number } {
  // Convert local position to geographic offset
  // Use the Earth's radius at the reference latitude for more accurate conversion
  const earthRadius = 6378137.0; // Earth's radius in meters
  const latOffset = (localPos.x / earthRadius) * (180 / Math.PI);
  const lonOffset =
    (localPos.z /
      (earthRadius * Math.cos(referenceLatitude * MathUtils.DEG2RAD))) *
    (180 / Math.PI);

  // Calculate final coordinates
  const latitude = referenceLatitude + latOffset;
  const longitude = referenceLongitude + lonOffset;

  // Use local y position directly as altitude
  const altitude = localPos.y;

  const result = {
    latitude,
    longitude,
    altitude,
  };

  return result;
}

/**
 * Convert geographic (lat, lon, alt) to a Three.js local Vector3.
 * @param tilesRenderer  the initialized TilesRenderer
 * @param latitude
 * @param longitude
 * @param altitude
 */
export function geographicToLocal(
  tilesRenderer: TilesRenderer,
  latitude: number,
  longitude: number,
  altitude: number
): Vector3 {
  // Calculate offsets from reference location
  const latOffset = latitude - referenceLatitude;
  const lonOffset = longitude - referenceLongitude;

  // Convert to local coordinates using Earth's radius
  const earthRadius = 6378137.0; // Earth's radius in meters
  const x = latOffset * earthRadius * (Math.PI / 180);
  const z =
    lonOffset *
    (earthRadius * Math.cos(referenceLatitude * MathUtils.DEG2RAD)) *
    (Math.PI / 180);

  // Use altitude directly as y position
  const y = altitude;

  const localPos = new Vector3(x, y, z);

  return localPos;
}
