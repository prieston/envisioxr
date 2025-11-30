"use client";

import { arrayToMatrix4 } from "@klorad/engine-cesium";

export interface Location {
  longitude: number;
  latitude: number;
  height: number;
}

export interface HeadingPitchRoll {
  heading: number;
  pitch: number;
  roll: number;
}

/**
 * Extract location (longitude, latitude, height) from a transform matrix
 */
export function extractLocationFromTransform(
  Cesium: any,
  transform: number[]
): Location {
  const matrix = arrayToMatrix4(Cesium, transform);
  const translation = new Cesium.Cartesian3(
    matrix[12],
    matrix[13],
    matrix[14]
  );
  const cartographic = Cesium.Cartographic.fromCartesian(translation);
  return {
    longitude: Cesium.Math.toDegrees(cartographic.longitude),
    latitude: Cesium.Math.toDegrees(cartographic.latitude),
    height: cartographic.height,
  };
}

/**
 * Extract heading, pitch, and roll from a transform matrix
 */
export function extractHPRFromTransform(
  Cesium: any,
  transform: number[]
): HeadingPitchRoll {
  const matrix = arrayToMatrix4(Cesium, transform);
  // Matrix4 is column-major, so extract upper-left 3x3 rotation matrix
  const rotationMatrix = Cesium.Matrix3.fromArray([
    matrix[0],
    matrix[1],
    matrix[2],
    matrix[4],
    matrix[5],
    matrix[6],
    matrix[8],
    matrix[9],
    matrix[10],
  ]);
  const quaternion = Cesium.Quaternion.fromRotationMatrix(rotationMatrix);
  const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
  return {
    heading: Cesium.Math.toDegrees(hpr.heading),
    pitch: Cesium.Math.toDegrees(hpr.pitch),
    roll: Cesium.Math.toDegrees(hpr.roll),
  };
}

/**
 * Apply transform to tileset with render requests
 */
export function applyTransformToTileset(
  tileset: any,
  Cesium: any,
  transform: number[],
  viewer: any
): void {
  const matrix = arrayToMatrix4(Cesium, transform);
  tileset.modelMatrix = matrix;

  if (viewer && !viewer.isDestroyed()) {
    viewer.scene.requestRender();
    setTimeout(() => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.requestRender();
      }
    }, 50);
    setTimeout(() => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.requestRender();
      }
    }, 100);
  }
}

/**
 * Restore transform to tileset (used for cancel operations)
 */
export function restoreTransform(
  tileset: any,
  Cesium: any,
  transform: number[],
  viewer: any
): void {
  applyTransformToTileset(tileset, Cesium, transform, viewer);
}

