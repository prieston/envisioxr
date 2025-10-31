type TilesRenderer = any;
import { Vector3 } from "three";
export declare function setReferenceLocation(latitude: number, longitude: number): void;
/**
 * Convert a Three.js local Vector3 (tile-set frame) to geographic coords.
 * @param tilesRenderer  the initialized TilesRenderer
 * @param localPos       position in local Y-up frame
 */
export declare function localToGeographic(tilesRenderer: TilesRenderer, localPos: Vector3): {
    latitude: number;
    longitude: number;
    altitude: number;
};
/**
 * Convert geographic (lat, lon, alt) to a Three.js local Vector3.
 * @param tilesRenderer  the initialized TilesRenderer
 * @param latitude
 * @param longitude
 * @param altitude
 */
export declare function geographicToLocal(tilesRenderer: TilesRenderer, latitude: number, longitude: number, altitude: number): Vector3;
export {};
//# sourceMappingURL=coordinateUtils.d.ts.map