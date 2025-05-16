import { TilesRenderer } from "3d-tiles-renderer";
import { MathUtils, Vector3 } from "three";

// Store the reference location
let referenceLatitude = 40.7128; // Default to NYC
let referenceLongitude = -74.006;

export function setReferenceLocation(latitude: number, longitude: number) {
  referenceLatitude = latitude;
  referenceLongitude = longitude;
  console.log("[coordinateUtils] Set reference location:", {
    latitude,
    longitude,
  });
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
  console.log("[localToGeographic] Input local position:", {
    x: localPos.x,
    y: localPos.y,
    z: localPos.z,
  });

  console.log("[localToGeographic] Reference location:", {
    refLat: referenceLatitude,
    refLon: referenceLongitude,
  });

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

  console.log("[localToGeographic] Calculated offsets:", {
    latOffset,
    lonOffset,
    altOffset: altitude,
  });

  const result = {
    latitude,
    longitude,
    altitude,
  };

  console.log("[localToGeographic] Output geographic:", result);
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
  console.log("[geographicToLocal] Input geographic:", {
    latitude,
    longitude,
    altitude,
  });

  console.log("[geographicToLocal] Reference location:", {
    refLat: referenceLatitude,
    refLon: referenceLongitude,
  });

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

  console.log("[geographicToLocal] Calculated offsets:", {
    latOffset,
    lonOffset,
  });

  const localPos = new Vector3(x, y, z);

  console.log("[geographicToLocal] Output local position:", {
    x: localPos.x,
    y: localPos.y,
    z: localPos.z,
  });

  return localPos;
}
