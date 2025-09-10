"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";

interface CesiumViewshedAnalysisProps {
  position: [number, number, number]; // [longitude, latitude, height]
  rotation: [number, number, number]; // [heading, pitch, roll] in radians
  fov: number; // Field of view in degrees
  radius: number; // Visibility radius in meters
  showViewshed: boolean;
  showCone: boolean;
  objectId: string;
}

const CesiumViewshedAnalysis: React.FC<CesiumViewshedAnalysisProps> = ({
  position,
  rotation,
  fov,
  radius,
  showViewshed,
  showCone,
  objectId,
}) => {
  const { cesiumViewer, cesiumInstance } = useSceneStore();
  const viewshedPrimitiveRef = useRef<Cesium.Primitive | null>(null);
  const conePrimitiveRef = useRef<Cesium.Primitive | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Clean up primitives and entities
  const cleanupPrimitives = () => {
    if (cesiumViewer && viewshedPrimitiveRef.current) {
      cesiumViewer.scene.primitives.remove(viewshedPrimitiveRef.current);
      viewshedPrimitiveRef.current = null;
    }
    if (cesiumViewer && conePrimitiveRef.current) {
      // Handle both primitives and entities
      if (conePrimitiveRef.current.id) {
        // It's an entity
        cesiumViewer.entities.removeById(conePrimitiveRef.current.id);
      } else {
        // It's a primitive
        cesiumViewer.scene.primitives.remove(conePrimitiveRef.current);
      }
      conePrimitiveRef.current = null;
    }
  };

  // Create cone visualization using a simple approach
  const createConeVisualization = () => {
    if (!cesiumViewer || !cesiumInstance || !showCone) return;

    cleanupPrimitives();

    const [longitude, latitude, height] = position;
    const [heading, pitch, roll] = rotation;

    // Create a simple cone using a cylinder with different top and bottom radii
    const coneRadius = radius * Math.tan((fov * Math.PI) / 360);

    const coneEntity = cesiumViewer.entities.add({
      id: `viewshed-cone-${objectId}`,
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      cylinder: {
        length: radius,
        topRadius: 0,
        bottomRadius: coneRadius,
        material: Cesium.Color.LIME.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.LIME,
        heightReference: Cesium.HeightReference.NONE,
      },
      orientation: Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        new Cesium.HeadingPitchRoll(heading, pitch, roll)
      ),
    });

    // Store reference for cleanup
    conePrimitiveRef.current = coneEntity as any;
  };

  // Perform viewshed analysis
  const performViewshedAnalysis = async () => {
    if (!cesiumViewer || !cesiumInstance || !showViewshed) return;

    setIsCalculating(true);
    cleanupPrimitives();

    try {
      const [longitude, latitude, height] = position;
      const [heading, pitch, roll] = rotation;

      // Create a viewshed analysis using Cesium's built-in capabilities
      const viewerPosition = Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );

      // Create a grid of points to analyze visibility
      const gridSize = 50; // 50x50 grid
      const stepSize = radius / gridSize;
      const visiblePoints: Cesium.Cartesian3[] = [];

      // Generate grid points in a circular pattern
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i - gridSize / 2) * stepSize;
          const z = (j - gridSize / 2) * stepSize;
          const distance = Math.sqrt(x * x + z * z);

          if (distance <= radius) {
            // Check if point is within FOV
            const angle = Math.atan2(x, z);
            const fovRad = (fov * Math.PI) / 180;

            if (Math.abs(angle) <= fovRad / 2) {
              // Calculate the point in world coordinates
              const localPoint = new Cesium.Cartesian3(x, 0, z);

              // Apply rotation
              const headingMatrix = Cesium.Matrix3.fromRotationZ(heading);
              const pitchMatrix = Cesium.Matrix3.fromRotationX(pitch);
              const rollMatrix = Cesium.Matrix3.fromRotationY(roll);

              const rotationMatrix = Cesium.Matrix3.multiply(
                Cesium.Matrix3.multiply(
                  headingMatrix,
                  pitchMatrix,
                  new Cesium.Matrix3()
                ),
                rollMatrix,
                new Cesium.Matrix3()
              );

              const rotatedPoint = Cesium.Matrix3.multiplyByVector(
                rotationMatrix,
                localPoint,
                new Cesium.Cartesian3()
              );

              const worldPoint = Cesium.Cartesian3.add(
                viewerPosition,
                rotatedPoint,
                new Cesium.Cartesian3()
              );

              // Perform line-of-sight analysis
              const visibility = await checkLineOfSight(
                cesiumViewer,
                viewerPosition,
                worldPoint
              );

              if (visibility) {
                visiblePoints.push(worldPoint);
              }
            }
          }
        }
      }

      // Create visualization of visible points
      if (visiblePoints.length > 0) {
        createViewshedVisualization(visiblePoints);
      }

      console.log(
        `Viewshed analysis complete: ${visiblePoints.length} visible points found`
      );
    } catch (error) {
      console.error("Error performing viewshed analysis:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Check line of sight between two points
  const checkLineOfSight = async (
    viewer: Cesium.Viewer,
    start: Cesium.Cartesian3,
    end: Cesium.Cartesian3
  ): Promise<boolean> => {
    try {
      // Use Cesium's sampleTerrainMostDetailed for accurate terrain sampling
      const positions = [start, end];
      const terrainProvider = viewer.terrainProvider;

      if (terrainProvider && terrainProvider.availability) {
        const updatedPositions = await Cesium.sampleTerrainMostDetailed(
          terrainProvider,
          positions
        );

        // Check if there are any obstacles between the points
        const direction = Cesium.Cartesian3.subtract(
          updatedPositions[1],
          updatedPositions[0],
          new Cesium.Cartesian3()
        );
        const distance = Cesium.Cartesian3.magnitude(direction);
        const normalizedDirection = Cesium.Cartesian3.normalize(
          direction,
          new Cesium.Cartesian3()
        );

        // Sample points along the line
        const sampleCount = Math.floor(distance / 10); // Sample every 10 meters
        for (let i = 1; i < sampleCount; i++) {
          const t = i / sampleCount;
          const samplePoint = Cesium.Cartesian3.lerp(
            updatedPositions[0],
            updatedPositions[1],
            t,
            new Cesium.Cartesian3()
          );

          // Check if the sample point is above terrain
          const terrainHeight = await getTerrainHeight(viewer, samplePoint);
          if (terrainHeight && samplePoint.height < terrainHeight + 2) {
            // 2m buffer
            return false; // Line of sight blocked
          }
        }
      }

      return true; // Line of sight clear
    } catch (error) {
      console.warn("Error checking line of sight:", error);
      return false;
    }
  };

  // Get terrain height at a specific position
  const getTerrainHeight = async (
    viewer: Cesium.Viewer,
    position: Cesium.Cartesian3
  ): Promise<number | null> => {
    try {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      const terrainProvider = viewer.terrainProvider;

      if (terrainProvider && terrainProvider.availability) {
        const height = await Cesium.sampleTerrainMostDetailed(terrainProvider, [
          cartographic,
        ]);
        return height[0].height;
      }
      return null;
    } catch (error) {
      console.warn("Error getting terrain height:", error);
      return null;
    }
  };

  // Create visualization of visible points
  const createViewshedVisualization = (visiblePoints: Cesium.Cartesian3[]) => {
    if (!cesiumViewer || !cesiumInstance) return;

    // Create point cloud geometry
    const positions = new Float32Array(visiblePoints.length * 3);
    for (let i = 0; i < visiblePoints.length; i++) {
      const point = visiblePoints[i];
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }

    const geometry = new Cesium.Geometry({
      attributes: {
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: positions,
        }),
      },
      primitiveType: Cesium.PrimitiveType.POINTS,
    });

    const geometryInstance = new Cesium.GeometryInstance({
      geometry: geometry,
      id: `viewshed-points-${objectId}`,
    });

    const viewshedPrimitive = new Cesium.Primitive({
      geometryInstances: geometryInstance,
      appearance: new Cesium.PointPrimitiveAppearance({
        material: Cesium.Material.fromType("Color", {
          color: Cesium.Color.YELLOW.withAlpha(0.8),
        }),
        pointSize: 3.0,
      }),
    });

    cesiumViewer.scene.primitives.add(viewshedPrimitive);
    viewshedPrimitiveRef.current = viewshedPrimitive;
  };

  // Effect for cone visualization
  useEffect(() => {
    if (showCone) {
      createConeVisualization();
    } else {
      if (conePrimitiveRef.current) {
        cleanupPrimitives();
      }
    }

    return cleanupPrimitives;
  }, [showCone, position, rotation, fov, radius, objectId]);

  // Effect for viewshed analysis
  useEffect(() => {
    if (showViewshed) {
      performViewshedAnalysis();
    } else {
      if (viewshedPrimitiveRef.current) {
        cleanupPrimitives();
      }
    }

    return cleanupPrimitives;
  }, [showViewshed, position, rotation, fov, radius, objectId]);

  return null; // This component doesn't render anything visible
};

export default CesiumViewshedAnalysis;
