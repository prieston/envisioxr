"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setReferenceLocation = setReferenceLocation;
exports.localToGeographic = localToGeographic;
exports.geographicToLocal = geographicToLocal;
var three_1 = require("three");
// Store the reference location
var referenceLatitude = 40.7128; // Default to NYC
var referenceLongitude = -74.006;
function setReferenceLocation(latitude, longitude) {
    referenceLatitude = latitude;
    referenceLongitude = longitude;
}
/**
 * Convert a Three.js local Vector3 (tile-set frame) to geographic coords.
 * @param tilesRenderer  the initialized TilesRenderer
 * @param localPos       position in local Y-up frame
 */
function localToGeographic(tilesRenderer, localPos) {
    // Convert local position to geographic offset
    // Use the Earth's radius at the reference latitude for more accurate conversion
    var earthRadius = 6378137.0; // Earth's radius in meters
    var latOffset = (localPos.x / earthRadius) * (180 / Math.PI);
    var lonOffset = (localPos.z /
        (earthRadius * Math.cos(referenceLatitude * three_1.MathUtils.DEG2RAD))) *
        (180 / Math.PI);
    // Calculate final coordinates
    var latitude = referenceLatitude + latOffset;
    var longitude = referenceLongitude + lonOffset;
    // Use local y position directly as altitude
    var altitude = localPos.y;
    var result = {
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
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
function geographicToLocal(tilesRenderer, latitude, longitude, altitude) {
    // Calculate offsets from reference location
    var latOffset = latitude - referenceLatitude;
    var lonOffset = longitude - referenceLongitude;
    // Convert to local coordinates using Earth's radius
    var earthRadius = 6378137.0; // Earth's radius in meters
    var x = latOffset * earthRadius * (Math.PI / 180);
    var z = lonOffset *
        (earthRadius * Math.cos(referenceLatitude * three_1.MathUtils.DEG2RAD)) *
        (Math.PI / 180);
    // Use altitude directly as y position
    var y = altitude;
    var localPos = new three_1.Vector3(x, y, z);
    return localPos;
}
