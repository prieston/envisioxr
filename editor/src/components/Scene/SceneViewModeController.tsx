import React, { useEffect, useRef, forwardRef, ForwardedRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PointerLockControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  RayCollider,
  useRapier,
} from "@react-three/rapier";
import useSceneStore from "../../../app/hooks/useSceneStore";
import * as THREE from "three";
import { Vector3, Quaternion, Euler } from "three";

interface SceneViewModeControllerProps {
  orbitControlsRef: React.MutableRefObject<any>;
}

interface PlayerRigidBodyProps {
  playerHeight: number;
  playerRadius: number;
}

const SPAWN_HEIGHT = 1000; // Start ray from high up
const PLAYER_HEIGHT = 1.8; // Standard player height
const PLAYER_RADIUS = 0.3; // Collision radius

// Forwarded RigidBody component
const PlayerRigidBody = forwardRef<any, PlayerRigidBodyProps>((props, ref) => {
  const { playerHeight, playerRadius } = props;

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      colliders="cuboid"
      position={[0, playerHeight, 0]}
      lockRotations
    >
      <mesh visible={false}>
        <capsuleGeometry args={[playerHeight / 2, playerRadius * 2]} />
      </mesh>
    </RigidBody>
  );
});

// First person controls
const FirstPersonControls = () => {
  const { camera, scene } = useThree();
  const { rapier, world } = useRapier();
  const moveSpeed = 5;
  const jumpForce = 5;
  const playerHeight = 1.8;
  const playerRadius = 0.3;
  const isOnGround = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const velocity = useRef(new Vector3());
  const keys = useRef({ w: false, s: false, a: false, d: false, space: false });
  const lastValidPosition = useRef(new Vector3());
  const groundHeight = useRef(0);
  const hasSpawned = useRef(false);
  const currentGroundY = useRef(0);
  const lastGroundY = useRef(0);
  const groundCheckCount = useRef(0);
  const lastResetTime = useRef(0);
  const moveDirection = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const groundSmoothingFactor = 0.05; // Reduced smoothing factor for more stability
  const groundSamples = useRef<number[]>([]);
  const maxGroundSamples = 5; // Number of ground samples to average

  // Find ground position using ray cast against 3D tiles
  useEffect(() => {
    if (!world || hasSpawned.current) return;

    // Use current camera position as spawn point
    const currentPosition = camera.position.clone();

    // Create ray from current position
    const rayOrigin = new Vector3(
      currentPosition.x,
      currentPosition.y + 100,
      currentPosition.z
    );
    const rayDir = new Vector3(0, -1, 0);
    raycaster.current.set(rayOrigin, rayDir);

    // Find all meshes in the scene
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    console.log("Found meshes:", allMeshes.length);

    // Cast ray against all meshes
    const intersects = raycaster.current.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      groundHeight.current = hitPoint.y;
      currentGroundY.current = hitPoint.y;
      lastGroundY.current = hitPoint.y;
      // Initialize ground samples
      groundSamples.current = Array(maxGroundSamples).fill(hitPoint.y);
      // Spawn slightly above the hit point
      const spawnY = hitPoint.y + playerHeight + 2;
      camera.position.set(currentPosition.x, spawnY, currentPosition.z);
      lastValidPosition.current.copy(camera.position);
      hasSpawned.current = true;
      console.log(
        "Spawned at height:",
        spawnY,
        "Ground height:",
        groundHeight.current
      );
    } else {
      // No ground found, spawn at current height
      groundHeight.current = currentPosition.y;
      currentGroundY.current = currentPosition.y;
      lastGroundY.current = currentPosition.y;
      // Initialize ground samples
      groundSamples.current = Array(maxGroundSamples).fill(currentPosition.y);
      lastValidPosition.current.copy(camera.position);
      hasSpawned.current = true;
      console.log("No ground found, spawned at current height");
    }
  }, [world, scene, camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "Space":
          keys.current.space = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // Find all meshes in the scene
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    // Cast multiple rays in a small area around the player for better ground detection
    const rayOrigins = [
      new Vector3(
        camera.position.x,
        camera.position.y + 1.0,
        camera.position.z
      ),
      new Vector3(
        camera.position.x + 0.5,
        camera.position.y + 1.0,
        camera.position.z
      ),
      new Vector3(
        camera.position.x - 0.5,
        camera.position.y + 1.0,
        camera.position.z
      ),
      new Vector3(
        camera.position.x,
        camera.position.y + 1.0,
        camera.position.z + 0.5
      ),
      new Vector3(
        camera.position.x,
        camera.position.y + 1.0,
        camera.position.z - 0.5
      ),
    ];

    const rayDir = new Vector3(0, -1, 0);
    const groundHeights: number[] = [];

    // Cast all rays and collect ground heights
    for (const origin of rayOrigins) {
      raycaster.current.set(origin, rayDir);
      const intersects = raycaster.current.intersectObjects(allMeshes);
      if (intersects.length > 0) {
        groundHeights.push(intersects[0].point.y);
      }
    }

    // Calculate average ground height from all samples
    let newGroundY = currentGroundY.current;
    if (groundHeights.length > 0) {
      // Sort heights and take the median to avoid outliers
      groundHeights.sort((a, b) => a - b);
      const medianIndex = Math.floor(groundHeights.length / 2);
      newGroundY = groundHeights[medianIndex];

      // Update ground samples array (FIFO)
      groundSamples.current.shift();
      groundSamples.current.push(newGroundY);

      // Calculate average of all samples
      const avgGroundY =
        groundSamples.current.reduce((sum, height) => sum + height, 0) /
        groundSamples.current.length;

      // Only update if the change is within a reasonable range
      if (Math.abs(avgGroundY - currentGroundY.current) < 2) {
        // Use lerp for smooth transitions
        currentGroundY.current = THREE.MathUtils.lerp(
          currentGroundY.current,
          avgGroundY,
          groundSmoothingFactor
        );
        lastGroundY.current = avgGroundY;
      }
    }

    // Update ground state
    isOnGround.current = groundHeights.length > 0;

    // Calculate movement direction based on camera orientation
    moveDirection.current.set(0, 0, 0);

    // Get forward and right vectors from camera
    forward.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
    right.current.set(1, 0, 0).applyQuaternion(camera.quaternion);

    // Forward/Backward
    if (keys.current.w) {
      moveDirection.current.add(forward.current);
    }
    if (keys.current.s) {
      moveDirection.current.sub(forward.current);
    }

    // Left/Right (strafe)
    if (keys.current.a) {
      moveDirection.current.sub(right.current);
    }
    if (keys.current.d) {
      moveDirection.current.add(right.current);
    }

    // Normalize movement direction
    if (moveDirection.current.length() > 0) {
      moveDirection.current.normalize();
    }

    // Apply movement with speed and delta time
    camera.position.x += moveDirection.current.x * moveSpeed * delta;
    camera.position.z += moveDirection.current.z * moveSpeed * delta;

    // Handle jumping
    if (keys.current.space && isOnGround.current) {
      camera.position.y += jumpForce * delta;
    }

    // Apply gravity when not on ground
    if (!isOnGround.current) {
      camera.position.y -= 9.8 * delta; // gravity
    } else {
      // When on ground, maintain a small offset from the ground
      camera.position.y = currentGroundY.current + playerHeight;
    }

    // Check if we've fallen below a certain threshold
    const currentTime = Date.now();
    if (
      camera.position.y < currentGroundY.current - 20 &&
      currentTime - lastResetTime.current > 1000
    ) {
      console.log("Fell below threshold, resetting position");
      camera.position.copy(lastValidPosition.current);
      lastResetTime.current = currentTime;
    }
  });

  return <PointerLockControls />;
};

// Third person controls (MMORPG style)
const ThirdPersonControls = () => {
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const playerRef = useRef<any>(null);
  const moveSpeed = 5;
  const jumpForce = 5;
  const playerHeight = 1.8;
  const playerRadius = 0.3;
  const cameraDistance = 5;
  const cameraHeight = 2;
  const isOnGround = useRef(false);

  // Find ground position using ray cast
  useEffect(() => {
    if (!world) return;

    // Create ray from high up
    const rayOrigin = new Vector3(0, 1000, 0);
    const rayDir = new Vector3(0, -1, 0);
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, 2000, true);

    if (hit) {
      // Spawn slightly above the hit point
      const spawnY = hit.point.y + playerHeight / 2 + 0.1;
      playerRef.current?.setTranslation({ x: 0, y: spawnY, z: 5 });
    } else {
      // No ground found, spawn at default height
      playerRef.current?.setTranslation({ x: 0, y: playerHeight, z: 5 });
    }
  }, [world, rapier]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      const rigidBody = playerRef.current;
      const velocity = rigidBody.linvel();
      const rotation = camera.rotation.clone();

      switch (e.code) {
        case "KeyW":
          velocity.x = Math.sin(rotation.y) * moveSpeed;
          velocity.z = Math.cos(rotation.y) * moveSpeed;
          break;
        case "KeyS":
          velocity.x = -Math.sin(rotation.y) * moveSpeed;
          velocity.z = -Math.cos(rotation.y) * moveSpeed;
          break;
        case "KeyA":
          velocity.x = -Math.cos(rotation.y) * moveSpeed;
          velocity.z = Math.sin(rotation.y) * moveSpeed;
          break;
        case "KeyD":
          velocity.x = Math.cos(rotation.y) * moveSpeed;
          velocity.z = -Math.sin(rotation.y) * moveSpeed;
          break;
        case "Space":
          if (isOnGround.current) {
            velocity.y = jumpForce;
          }
          break;
      }
      rigidBody.setLinvel(velocity);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera]);

  useFrame(() => {
    if (playerRef.current) {
      const position = playerRef.current.translation();
      const targetPosition = new Vector3(
        position.x,
        position.y + cameraHeight,
        position.z
      );
      const cameraOffset = new Vector3(
        Math.sin(camera.rotation.y) * -cameraDistance,
        0,
        Math.cos(camera.rotation.y) * -cameraDistance
      );
      camera.position.copy(targetPosition).add(cameraOffset);
      camera.lookAt(targetPosition);

      // Ground check
      const rayOrigin = new Vector3(position.x, position.y, position.z);
      const rayDir = new Vector3(0, -1, 0);
      const ray = new rapier.Ray(rayOrigin, rayDir);
      const hit = world.castRay(ray, playerHeight / 2 + 0.1, true);
      isOnGround.current = !!hit;
    }
  });

  return (
    <PlayerRigidBody
      ref={playerRef}
      playerHeight={playerHeight}
      playerRadius={playerRadius}
    />
  );
};

// Flight mode controls
const FlightControls = () => {
  const { camera } = useThree();
  const moveSpeed = 10;
  const rotationSpeed = 0.02;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const direction = new Vector3();

      switch (e.code) {
        case "KeyW":
          direction.z = -1;
          break;
        case "KeyS":
          direction.z = 1;
          break;
        case "KeyA":
          direction.x = -1;
          break;
        case "KeyD":
          direction.x = 1;
          break;
        case "Space":
          direction.y = 1;
          break;
        case "ShiftLeft":
          direction.y = -1;
          break;
      }

      direction.applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(direction, moveSpeed);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        camera.rotation.y -= e.movementX * rotationSpeed;
        camera.rotation.x -= e.movementY * rotationSpeed;
        camera.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, camera.rotation.x)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [camera]);

  return null;
};

const SceneViewModeController: React.FC<SceneViewModeControllerProps> = ({
  orbitControlsRef,
}) => {
  const { camera } = useThree();
  const firstPersonControlsRef = useRef<any>(null);

  const viewMode = useSceneStore((state) => state.viewMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);

  // Handle view mode changes
  useEffect(() => {
    // Disable all controls first
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
    }
    if (firstPersonControlsRef.current) {
      firstPersonControlsRef.current.enabled = false;
    }

    // Enable the selected control
    switch (viewMode) {
      case "orbit":
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = !selectedObject && !previewMode;
        }
        break;
      case "firstPerson":
        if (firstPersonControlsRef.current) {
          firstPersonControlsRef.current.enabled = !previewMode;
        }
        break;
      case "thirdPerson":
        if (firstPersonControlsRef.current) {
          firstPersonControlsRef.current.enabled = !previewMode;
          if (selectedObject?.ref) {
            const objectPosition = selectedObject.ref.position;
            camera.position.set(
              objectPosition.x,
              objectPosition.y + 2,
              objectPosition.z + 5
            );
          }
        }
        break;
      case "flight":
        if (firstPersonControlsRef.current) {
          firstPersonControlsRef.current.enabled = !previewMode;
        }
        break;
    }
  }, [viewMode, selectedObject, previewMode, camera, orbitControlsRef]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={1000}
        enablePan={!previewMode}
        enableZoom={!previewMode}
        enableRotate={!previewMode}
      />

      {(viewMode === "firstPerson" ||
        viewMode === "thirdPerson" ||
        viewMode === "flight") && (
        <>
          <PointerLockControls
            ref={firstPersonControlsRef}
            enabled={
              (viewMode === "firstPerson" ||
                viewMode === "thirdPerson" ||
                viewMode === "flight") &&
              !previewMode
            }
          />
          {viewMode === "firstPerson" && !previewMode && (
            <FirstPersonControls />
          )}
          {viewMode === "thirdPerson" && !previewMode && (
            <ThirdPersonControls />
          )}
          {viewMode === "flight" && !previewMode && <FlightControls />}
        </>
      )}
    </>
  );
};

export default SceneViewModeController;
