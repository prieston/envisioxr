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
  gridDensity = 10,
}) => {
  const { scene } = useThree();
  const visibilityAreaRef = useRef<THREE.Object3D>();
  const materialRef = useRef<THREE.MeshBasicMaterial>();
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

  const calculateVisibleArea = () => {
    // Store current values for comparison
    lastCalculationRef.current = { position, rotation, fov, radius };

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
    const elevationSteps = Math.max(3, Math.floor(gridDensity / 2)); // vertical
    const radiusSteps = Math.max(3, Math.floor(gridDensity / 2));
    const maxElevation = (fov * Math.PI) / 180 / 2; // half FOV as max elevation angle

    const gridPoints: THREE.Vector3[] = [];
    for (let i = 0; i < azimuthSteps; i++) {
      const azimuth = ((i / (azimuthSteps - 1) - 0.5) * (fov * Math.PI)) / 180; // -halfFov to +halfFov
      for (let j = 0; j < elevationSteps; j++) {
        const elevation = (j / (elevationSteps - 1)) * maxElevation; // 0 to maxElevation
        for (let k = 1; k < radiusSteps; k++) {
          // start at 1 to avoid origin
          const r = (k / (radiusSteps - 1)) * radius;
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
    }

    console.log("Created", gridPoints.length, "grid points");

    visiblePoints.current = [];

    // Get all meshes in the scene once, excluding the observer and cone
    const meshes: THREE.Mesh[] = [];
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (
            object !== visibilityAreaRef.current &&
            object.position.distanceTo(origin) > 0.01
          ) {
            meshes.push(object);
          }
        }
      });
    }
    console.log("Found", meshes.length, "meshes in scene for raycasting");

    const hitPoints: THREE.Vector3[] = [];
    for (const gridPoint of gridPoints) {
      const rayDirection = origin.clone().sub(gridPoint).normalize();
      raycaster.current.set(gridPoint, rayDirection);

      const intersects = raycaster.current.intersectObjects(meshes, true);
      const distanceToOrigin = gridPoint.distanceTo(origin);
      let isVisible = false;

      if (intersects.length === 0) {
        isVisible = true;
      } else {
        const firstHit = intersects[0];
        // If the intersection is farther than (or very close to) the origin, it's visible
        if (firstHit.distance >= distanceToOrigin - 0.01) {
          isVisible = true;
        } else {
          // Occluded: store the intersection point
          const hitPoint = gridPoint
            .clone()
            .add(rayDirection.clone().multiplyScalar(firstHit.distance));
          hitPoints.push(hitPoint);
        }
      }

      if (isVisible) {
        // Project the point onto the ground plane (y = 0)
        const groundPoint = gridPoint.clone();
        groundPoint.y = 0.1; // Slightly above ground to prevent z-fighting
        visiblePoints.current.push(groundPoint);
      }
    }

    console.log("Found", visiblePoints.current.length, "visible points");

    // Create a shape from the visible points
    if (visiblePoints.current.length > 0) {
      // Sort points in a clockwise order around the center
      const center = new THREE.Vector3();
      visiblePoints.current.forEach((point) => center.add(point));
      center.divideScalar(visiblePoints.current.length);

      const sortedPoints = visiblePoints.current.sort((a, b) => {
        const angleA = Math.atan2(a.z - center.z, a.x - center.x);
        const angleB = Math.atan2(b.z - center.z, b.x - center.x);
        return angleA - angleB;
      });

      const shape = new THREE.Shape();
      shape.moveTo(sortedPoints[0].x, sortedPoints[0].z);
      for (let i = 1; i < sortedPoints.length; i++) {
        shape.lineTo(sortedPoints[i].x, sortedPoints[i].z);
      }
      shape.closePath();

      console.log("Created shape with", sortedPoints.length, "points");

      // Create geometry from the shape
      const geometry = new THREE.ShapeGeometry(shape);

      // Create a group to hold both the mesh and wireframe
      const group = new THREE.Group();

      // Create the main mesh with a more visible material
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2; // Rotate to lay flat on the ground
      mesh.position.y = 0.5; // Increased height to prevent z-fighting
      group.add(mesh);

      // Add wireframe
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
      );
      wireframe.rotation.x = -Math.PI / 2;
      wireframe.position.y = 0.51; // Slightly above the main mesh
      group.add(wireframe);

      if (visibilityAreaRef.current) {
        console.log("Removing existing visibility area");
        scene.remove(visibilityAreaRef.current);
      }

      console.log("Adding new visibility area to scene");
      scene.add(group);
      visibilityAreaRef.current = group;
      materialRef.current = material;
    } else {
      console.log("No visible points found, skipping shape creation");
    }

    // Add debug visualization of grid points and rays
    if (debugPointsRef.current) {
      scene.remove(debugPointsRef.current);
    }

    // Create debug points for grid points
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 2,
      sizeAttenuation: true,
    });

    const positions = new Float32Array(gridPoints.length * 3);
    gridPoints.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });

    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);
    debugPointsRef.current = points;

    // Add debug lines for rays
    // Clean up previous debug lines and materials
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

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    debugMaterialsRef.current.push(lineMaterial);
    gridPoints.forEach((gridPoint) => {
      const points = [gridPoint, origin];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      debugLinesRef.current.push(line);
    });

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

    // Add blue debug points for intersection hits
    if (hitPoints.length > 0) {
      const hitGeometry = new THREE.BufferGeometry();
      const hitPositions = new Float32Array(hitPoints.length * 3);
      hitPoints.forEach((point, i) => {
        hitPositions[i * 3] = point.x;
        hitPositions[i * 3 + 1] = point.y;
        hitPositions[i * 3 + 2] = point.z;
      });
      hitGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(hitPositions, 3)
      );
      const hitMaterial = new THREE.PointsMaterial({
        color: 0x0000ff,
        size: 3,
        sizeAttenuation: true,
      });
      const hitPointsObj = new THREE.Points(hitGeometry, hitMaterial);
      hitPointsObj.name = "ActualVisibilityAreaDebugHitPoints";
      scene.add(hitPointsObj);
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
