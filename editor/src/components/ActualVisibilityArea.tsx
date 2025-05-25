import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface ActualVisibilityAreaProps {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
  radius: number;
  showVisibleArea: boolean;
  gridDensity?: number;
}

const ActualVisibilityArea: React.FC<ActualVisibilityAreaProps> = ({
  position,
  rotation,
  fov,
  radius,
  showVisibleArea,
  gridDensity = 20,
}) => {
  const { scene } = useThree();
  const visibilityAreaRef = useRef<THREE.Object3D>();
  const raycaster = useRef(new THREE.Raycaster());
  const visiblePoints = useRef<THREE.Vector3[]>([]);
  const debugPointsRef = useRef<THREE.Points>();
  const debugLinesRef = useRef<THREE.Line[]>([]);
  const debugMaterialsRef = useRef<THREE.LineBasicMaterial[]>([]);
  const lastCalculationRef = useRef<{
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
    radius: number;
  }>();

  const isPartOfOriginObject = (
    mesh: THREE.Mesh,
    origin: THREE.Vector3
  ): boolean => {
    let current: THREE.Object3D | null = mesh;
    while (current) {
      if (current.position.distanceTo(origin) < 0.1) {
        return true;
      }
      current = current.parent;
    }
    return false;
  };

  const calculateVisibleArea = () => {
    // Store current values for comparison
    lastCalculationRef.current = { position, rotation, fov, radius };

    // Configure raycaster
    raycaster.current.near = 0.01; // Reduced near plane to catch closer intersections
    raycaster.current.far = radius * 2; // Make sure we can detect intersections beyond our radius

    console.log("Starting visibility calculation with:", {
      position,
      rotation,
      fov,
      radius,
      showVisibleArea,
      gridDensity,
    });

    if (!showVisibleArea) {
      console.log("Visibility calculation skipped - showVisibleArea is false");
      return;
    }

    const origin = new THREE.Vector3(...position);
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyEuler(new THREE.Euler(...rotation));

    // 3D cone grid parameters
    const azimuthSteps = gridDensity; // horizontal
    const elevationSteps = Math.max(5, Math.floor(gridDensity / 2)); // Increased minimum elevation steps
    const maxElevation = (fov * Math.PI) / 180 / 2; // half FOV as max elevation angle

    const gridPoints: THREE.Vector3[] = [];
    for (let i = 0; i < azimuthSteps; i++) {
      const azimuth = ((i / (azimuthSteps - 1) - 0.5) * (fov * Math.PI)) / 180; // -halfFov to +halfFov
      for (let j = 0; j < elevationSteps; j++) {
        // Calculate elevation from -maxElevation to +maxElevation
        const elevation = ((j / (elevationSteps - 1)) * 2 - 1) * maxElevation;
        // Only create point at maximum radius
        const r = radius;
        // Spherical to Cartesian (cone points forward in -Z by default)
        const x = Math.sin(azimuth) * Math.cos(elevation) * r;
        const y = Math.sin(elevation) * r;
        const z = -Math.cos(azimuth) * Math.cos(elevation) * r;
        const localPoint = new THREE.Vector3(x, y, z);
        // Rotate to match object orientation
        localPoint.applyEuler(new THREE.Euler(...rotation));
        // Translate to world position
        localPoint.add(origin);
        gridPoints.push(localPoint);
      }
    }

    console.log("Created", gridPoints.length, "grid points");

    visiblePoints.current = [];

    // Get all meshes in the scene once, excluding debug objects
    const meshes: THREE.Mesh[] = [];
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const isDebug = object.userData.isDebug;
          const isOriginObject = isPartOfOriginObject(object, origin);
          const distanceToOrigin = object.position.distanceTo(origin);

          if (!isDebug && !isOriginObject) {
            meshes.push(object);
            console.log("Including mesh for raycasting:", {
              name: object.name,
              type: object.type,
              position: object.position.toArray(),
              isDebug,
              distanceToOrigin,
              geometry: object.geometry.type,
              vertices: object.geometry.attributes.position.count,
            });
          } else {
            console.log("Excluding mesh from raycasting:", {
              name: object.name,
              type: object.type,
              position: object.position.toArray(),
              isDebug,
              distanceToOrigin,
              reason: isDebug ? "debug object" : "origin object",
            });
          }
        }
      });
    }
    console.log("Found", meshes.length, "meshes in scene for raycasting");

    const hitPoints: THREE.Vector3[] = [];
    for (const gridPoint of gridPoints) {
      // Cast ray from origin to grid point
      const rayDirection = gridPoint.clone().sub(origin).normalize();
      raycaster.current.set(origin, rayDirection);

      const intersects = raycaster.current.intersectObjects(meshes, true);
      const distanceToGrid = gridPoint.distanceTo(origin);
      let isVisible = false;

      console.log(
        "Checking ray from origin:",
        origin.toArray(),
        "to grid point:",
        gridPoint.toArray()
      );
      console.log("Ray direction:", rayDirection.toArray());
      console.log("Distance to grid:", distanceToGrid);
      console.log("Number of intersections:", intersects.length);

      if (intersects.length === 0) {
        isVisible = true;
        console.log("No intersections - point is visible");
      } else {
        // Sort intersections by distance
        intersects.sort((a, b) => a.distance - b.distance);
        const firstHit = intersects[0];

        console.log("Intersection details:", {
          totalHits: intersects.length,
          firstHit: {
            distance: firstHit.distance,
            point: firstHit.point.toArray(),
            object: firstHit.object.name,
            objectType: firstHit.object.type,
            face: firstHit.face
              ? {
                  normal: firstHit.face.normal.toArray(),
                  materialIndex: firstHit.face.materialIndex,
                }
              : null,
          },
        });

        // If the first hit is beyond the grid point, the point is visible
        if (firstHit.distance > distanceToGrid) {
          isVisible = true;
          console.log("First hit is beyond grid point - point is visible");
        } else {
          // Calculate how far along the ray the hit occurred (0 to 1)
          const hitRatio = firstHit.distance / distanceToGrid;
          console.log("Hit ratio:", hitRatio);

          // If the hit occurred within the first 95% of the ray length, consider it occluded
          if (hitRatio < 0.95) {
            // Occluded: store the intersection point
            hitPoints.push(firstHit.point);
            console.log(
              "Point is occluded - hit point is between origin and grid point"
            );
          } else {
            isVisible = true;
            console.log(
              "Hit point is too close to grid point - point is visible"
            );
          }
        }
      }

      if (isVisible) {
        // Project the point onto the ground plane (y = 0)
        const groundPoint = gridPoint.clone();
        groundPoint.y = 0.1; // Slightly above ground to prevent z-fighting
        visiblePoints.current.push(groundPoint);
        console.log(
          "Added visible point to ground plane:",
          groundPoint.toArray()
        );
      }
    }

    console.log("Found", visiblePoints.current.length, "visible points");
    console.log("Found", hitPoints.length, "hit points");

    // Remove old intersection debug points
    if (scene) {
      try {
        const objectsToRemove: THREE.Object3D[] = [];
        scene.traverse((object) => {
          if (
            object.type === "Points" &&
            object.name === "ActualVisibilityAreaDebugHitPoints"
          ) {
            objectsToRemove.push(object);
          }
        });
        // Remove objects after traversal is complete
        objectsToRemove.forEach((object) => scene.remove(object));
      } catch (error) {
        console.warn("Error during scene traversal:", error);
      }
    }

    // Add green spheres for intersection hits
    if (hitPoints.length > 0) {
      console.log(
        "Creating debug points for",
        hitPoints.length,
        "intersections"
      );
      console.log("Hit points positions (fixed to 2 decimals):");
      hitPoints.forEach((point, index) => {
        console.log(
          `Hit point ${index}: [${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`
        );
      });

      // Create a group for all hit point spheres
      const hitPointsGroup = new THREE.Group();
      hitPointsGroup.name = "ActualVisibilityAreaDebugHitPoints";
      hitPointsGroup.userData.isDebugObject = true;

      // Create a sphere geometry to be reused
      const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });

      // Create a sphere for each hit point
      hitPoints.forEach((point) => {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(point);
        hitPointsGroup.add(sphere);
      });

      scene.add(hitPointsGroup);
      console.log("Added debug spheres to scene");
    }

    // Clean up any existing visibility area
    if (visibilityAreaRef.current) {
      scene.remove(visibilityAreaRef.current);
      visibilityAreaRef.current = undefined;
    }
  };

  useEffect(() => {
    if (showVisibleArea) {
      // Only calculate if values have changed
      const shouldCalculate =
        !lastCalculationRef.current ||
        JSON.stringify(lastCalculationRef.current) !==
          JSON.stringify({ position, rotation, fov, radius });

      if (shouldCalculate) {
        calculateVisibleArea();
      }
    } else {
      if (visibilityAreaRef.current) {
        scene.remove(visibilityAreaRef.current);
      }
      if (debugPointsRef.current) {
        scene.remove(debugPointsRef.current);
      }
      if (debugLinesRef.current) {
        debugLinesRef.current.forEach((line) => {
          scene.remove(line);
          if (line.geometry) line.geometry.dispose();
        });
        debugLinesRef.current = [];
      }
      if (debugMaterialsRef.current) {
        debugMaterialsRef.current.forEach((material) => material.dispose());
        debugMaterialsRef.current = [];
      }
    }

    return () => {
      if (visibilityAreaRef.current) {
        scene.remove(visibilityAreaRef.current);
      }
      if (debugPointsRef.current) {
        scene.remove(debugPointsRef.current);
      }
      if (debugLinesRef.current) {
        debugLinesRef.current.forEach((line) => {
          scene.remove(line);
          if (line.geometry) line.geometry.dispose();
        });
        debugLinesRef.current = [];
      }
      if (debugMaterialsRef.current) {
        debugMaterialsRef.current.forEach((material) => material.dispose());
        debugMaterialsRef.current = [];
      }
    };
  }, [showVisibleArea]); // Only depend on showVisibleArea

  return null;
};

export default ActualVisibilityArea;
