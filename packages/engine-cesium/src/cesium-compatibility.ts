/**
 * Cesium Compatibility Layer
 * Maps the monolithic cesium package to the modular structure expected by Ion SDK
 */
import * as Cesium from "cesium";

// Create compatibility exports for @cesium/engine
export const {
  // Core Cesium types and classes
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Cartesian4,
  Color,
  HeadingPitchRoll,
  Matrix3,
  Matrix4,
  Quaternion,
  Transforms,
  Math: CesiumMath,
  JulianDate,
  Event,
  Property,
  ConstantProperty,
  ConstantPositionProperty,
  Material,
  MaterialProperty,
  ColorMaterialProperty,
  ClassificationType,
  ShadowMode,
  DistanceDisplayCondition,
  VertexFormat,
  Geometry,
  GeometryInstance,
  Spherical,
  Entity,
  EntityCollection,
  Scene,
  PrimitiveCollection,
  LabelCollection,
  PointPrimitiveCollection,
  ClippingPlaneCollection,
  Ellipsoid,
  EllipsoidTerrainProvider,
  Terrain,
  // Add other commonly used Cesium exports here
} = Cesium;

// Create compatibility exports for @cesium/widgets
export const {
  Viewer,
  // Add other widget exports here
} = Cesium;

// Export the entire Cesium object as well
export default Cesium;
