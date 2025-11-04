import React, { useEffect, useRef, forwardRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useSceneStore } from "@envisio/core";
import * as THREE from "three";
import { Vector3 } from "three";
import {
  handleKeyboardInput,
  calculateMovementDirection,
  detectGround,
  createRayOrigins,
  applyMovement,
  updateThirdPersonCamera,
  KeyStates,
  MovementParams,
} from "../../components/Scene/ControlHelpers";

interface PlayerRigidBodyProps {
  playerHeight: number;
  playerRadius: number;
  children?: React.ReactNode;
}

interface PhysicsObject extends THREE.Object3D {
  setTranslation?: (x: number, y: number, z: number) => void;
  translation?: () => { x: number; y: number; z: number };
  linvel?: () => { x: number; y: number; z: number };
  setLinvel?: (velocity: THREE.Vector3) => void;
}

// Forwarded RigidBody component
const PlayerRigidBody = forwardRef<any, PlayerRigidBodyProps>((props, ref) => {
  const { playerHeight, playerRadius, children } = props;

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
      {children}
    </RigidBody>
  );
});
PlayerRigidBody.displayName = "PlayerRigidBody";

// First person controls
const FirstPersonControls = () => {
  const { camera, scene } = useThree();
  const { world } = useRapier();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.walkSpeed;
  const jumpForce = 5;
  const playerHeight = 1.8;
  const isOnGround = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const velocity = useRef(new Vector3());
  const keys = useRef<KeyStates>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });
  const lastValidPosition = useRef(new Vector3());
  const groundHeight = useRef(0);
  const hasSpawned = useRef(false);
  const currentGroundY = useRef(0);
  const lastGroundY = useRef(0);
  const lastResetTime = useRef(0);
  const moveDirection = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const groundSamples = useRef<number[]>([]);
  const maxGroundSamples = 5;

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

    // Cast ray against all meshes
    const intersects = raycaster.current.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      groundHeight.current = hitPoint.y;
      currentGroundY.current = hitPoint.y;
      lastGroundY.current = hitPoint.y;
      groundSamples.current = Array(maxGroundSamples).fill(hitPoint.y);
      const spawnY = hitPoint.y + playerHeight + 2;
      camera.position.set(currentPosition.x, spawnY, currentPosition.z);
      lastValidPosition.current.copy(camera.position);
      hasSpawned.current = true;
    } else {
      groundHeight.current = currentPosition.y;
      currentGroundY.current = currentPosition.y;
      lastGroundY.current = currentPosition.y;
      groundSamples.current = Array(maxGroundSamples).fill(currentPosition.y);
      lastValidPosition.current.copy(camera.position);
      hasSpawned.current = true;
    }
  }, [world, scene, camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // Calculate movement direction
    calculateMovementDirection(
      camera,
      keys.current,
      moveDirection.current,
      forward.current,
      right.current
    );

    // Create ray origins for ground detection
    const rayOrigins = createRayOrigins(camera.position);
    const rayDir = new Vector3(0, -1, 0);

    // Detect ground
    const { isOnGround: newIsOnGround, groundHeight: newGroundHeight } =
      detectGround(
        raycaster.current,
        scene,
        camera.position,
        rayOrigins,
        rayDir
      );

    isOnGround.current = newIsOnGround;
    if (newIsOnGround) {
      currentGroundY.current = newGroundHeight;
    }

    // Apply movement
    const movementParams: MovementParams = {
      moveSpeed,
      friction: 0.95,
      maxSpeed: 10,
    };

    applyMovement(
      camera.position,
      moveDirection.current,
      velocity.current,
      movementParams,
      delta,
      isOnGround.current
    );

    // Handle jumping
    if (keys.current.space && isOnGround.current) {
      camera.position.y += jumpForce * delta;
    }

    // Apply gravity when not on ground
    if (!isOnGround.current) {
      camera.position.y -= 9.8 * delta;
    } else {
      camera.position.y = currentGroundY.current + playerHeight;
    }

    // Check if we've fallen below a certain threshold
    const currentTime = Date.now();
    if (
      camera.position.y < currentGroundY.current - 20 &&
      currentTime - lastResetTime.current > 1000
    ) {
      camera.position.copy(lastValidPosition.current);
      lastResetTime.current = currentTime;
    }
  });

  return <PointerLockControls />;
};

// Third person controls (MMORPG style)
const ThirdPersonControls = () => {
  const { camera, scene } = useThree();
  const { world } = useRapier();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.walkSpeed;
  const jumpForce = 5;
  const playerHeight = 1.8;
  const playerRadius = 0.3;
  const cameraDistance = 5;
  const cameraHeight = 2;
  const isOnGround = useRef(false);
  const velocity = useRef(new Vector3());
  const keys = useRef<KeyStates>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });
  const moveDirection = useRef(new Vector3());
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const playerRef = useRef<PhysicsObject>(
    new THREE.Object3D() as PhysicsObject
  );
  const raycaster = useRef(new THREE.Raycaster());

  const updatePosition = (newPos: Vector3) => {
    if (playerRef.current?.setTranslation) {
      playerRef.current.setTranslation(newPos.x, newPos.y, newPos.z);
    }
  };

  // Find ground position using ray cast
  useEffect(() => {
    if (!world) return;

    // Create ray from high up
    const rayOrigin = new Vector3(0, 1000, 0);
    const rayDir = new Vector3(0, -1, 0);
    raycaster.current.set(rayOrigin, rayDir);

    // Find all meshes in the scene
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    const intersects = raycaster.current.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const spawnY = hitPoint.y + playerHeight / 2 + 0.1;
      updatePosition(new Vector3(0, spawnY, 5));
    } else {
      // No ground found, spawn at default height
      updatePosition(new Vector3(0, playerHeight, 5));
    }
  }, [world, scene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    const rigidBody = playerRef.current;
    if (!rigidBody.translation || !rigidBody.linvel || !rigidBody.setLinvel)
      return;

    const position = rigidBody.translation();
    const targetPosition = new Vector3(
      position.x,
      position.y + cameraHeight,
      position.z
    );

    // Calculate movement direction
    calculateMovementDirection(
      camera,
      keys.current,
      moveDirection.current,
      forward.current,
      right.current
    );

    // Apply movement
    const movementParams: MovementParams = {
      moveSpeed,
      friction: 0.95,
      maxSpeed: 10,
    };

    // Update velocity based on movement direction
    const currentVelocity = rigidBody.linvel();
    velocity.current.set(
      currentVelocity.x,
      currentVelocity.y,
      currentVelocity.z
    );

    applyMovement(
      targetPosition,
      moveDirection.current,
      velocity.current,
      movementParams,
      delta,
      isOnGround.current
    );

    // Handle jumping
    if (keys.current.space && isOnGround.current) {
      velocity.current.y = jumpForce;
    }

    // Apply gravity when not on ground
    if (!isOnGround.current) {
      velocity.current.y -= 9.8 * delta;
    }

    // Update rigid body velocity
    rigidBody.setLinvel(velocity.current);

    // Update camera position
    updateThirdPersonCamera(
      camera,
      targetPosition,
      cameraDistance,
      cameraHeight,
      camera.rotation.y
    );

    // Ground check
    const rayOrigin = new Vector3(position.x, position.y, position.z);
    const rayDir = new Vector3(0, -1, 0);
    raycaster.current.set(rayOrigin, rayDir);

    // Find all meshes in the scene
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    const intersects = raycaster.current.intersectObjects(allMeshes);
    isOnGround.current = intersects.length > 0;
  });

  return (
    <PlayerRigidBody
      ref={playerRef}
      playerHeight={playerHeight}
      playerRadius={playerRadius}
    >
      {/* Visual representation of the player */}
      <group>
        {/* Body */}
        <mesh position={[0, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 2]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Head */}
        <mesh position={[0, playerHeight * 0.9, 0]}>
          <sphereGeometry args={[playerRadius * 0.8]} />
          <meshStandardMaterial color="#f5d0a9" />
        </mesh>
        {/* Arms */}
        <mesh position={[playerRadius * 1.2, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.3, playerRadius * 0.5]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        <mesh position={[-playerRadius * 1.2, playerHeight * 0.5, 0]}>
          <capsuleGeometry args={[playerHeight * 0.3, playerRadius * 0.5]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
        {/* Legs */}
        <mesh position={[playerRadius * 0.5, playerHeight * 0.2, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 0.5]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        <mesh position={[-playerRadius * 0.5, playerHeight * 0.2, 0]}>
          <capsuleGeometry args={[playerHeight * 0.4, playerRadius * 0.5]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
      </group>
    </PlayerRigidBody>
  );
};

// Flight mode controls
const FlightControls = () => {
  const { camera } = useThree();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.flightSpeed;
  const rotationSpeed = controlSettings.turnSpeed;

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

// Third person flight controls
const ThirdPersonFlightControls = () => {
  const { camera } = useThree();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const moveSpeed = controlSettings.flightSpeed;
  const rotationSpeed = controlSettings.turnSpeed;
  const vehicleRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const cameraDistance = 10;
  const cameraHeight = 3;

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

      direction.applyQuaternion(vehicleRef.current.quaternion);
      vehicleRef.current.position.addScaledVector(direction, moveSpeed);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        vehicleRef.current.rotation.y -= e.movementX * rotationSpeed;
        vehicleRef.current.rotation.x -= e.movementY * rotationSpeed;
        vehicleRef.current.rotation.x = Math.max(
          -Math.PI / 4,
          Math.min(Math.PI / 4, vehicleRef.current.rotation.x)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    // Update camera position to follow the vehicle
    const targetPosition = vehicleRef.current.position.clone();
    const cameraOffset = new Vector3(
      Math.sin(vehicleRef.current.rotation.y) * -cameraDistance,
      cameraHeight,
      Math.cos(vehicleRef.current.rotation.y) * -cameraDistance
    );
    camera.position.copy(targetPosition).add(cameraOffset);
    camera.lookAt(targetPosition);
  });

  return (
    <primitive object={vehicleRef.current}>
      {/* Visual representation of the airplane */}
      <group>
        {/* Fuselage */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[4, 0.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[6, 0.1, 1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 0.5, -1.5]}>
          <boxGeometry args={[1, 0.5, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Vertical stabilizer */}
        <mesh position={[0, 0.5, -1.5]}>
          <boxGeometry args={[0.1, 0.5, 0.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 0.2, 1.5]}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>
    </primitive>
  );
};

// Car controls
const CarControls = forwardRef<any, Record<string, never>>((_props, _ref) => {
  const { camera, scene } = useThree();
  const controlSettings = useSceneStore((state) => state.controlSettings);
  const baseTurnSpeed = controlSettings.turnSpeed;
  const turnSmoothing = controlSettings.smoothness;
  const targetRotation = useRef(0);
  const isOnGround = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const currentGroundY = useRef(0);
  const lastValidPosition = useRef(new Vector3());
  const hasSpawned = useRef(false);
  const groundSamples = useRef<number[]>([]);
  const maxGroundSamples = 5;
  const moveDirection = useRef(new Vector3());
  const carDirection = useRef(new Vector3(0, 0, 1));
  const keys = useRef<KeyStates>({ w: false, s: false, a: false, d: false });
  const carRotation = useRef(0);
  const carPosition = useRef(new Vector3());
  const currentSpeed = useRef(0);
  const maxSpeed = 20;
  const acceleration = 0.5;
  const deceleration = 0.3;

  // Initialize car position and rotation
  useEffect(() => {
    if (!scene || hasSpawned.current) return;

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

    // Cast ray against all meshes
    const intersects = raycaster.current.intersectObjects(allMeshes);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      currentGroundY.current = hitPoint.y;
      groundSamples.current = Array(maxGroundSamples).fill(hitPoint.y);

      // Initialize car position
      const spawnY = hitPoint.y + 1;
      carPosition.current.set(currentPosition.x, spawnY, currentPosition.z);
      lastValidPosition.current.copy(carPosition.current);

      // Set initial camera position and rotation
      camera.position.copy(carPosition.current);
      camera.rotation.set(0, Math.PI, 0); // Face forward initially

      hasSpawned.current = true;
    } else {
      currentGroundY.current = currentPosition.y;
      groundSamples.current = Array(maxGroundSamples).fill(currentPosition.y);

      // Initialize car position
      carPosition.current.copy(currentPosition);
      lastValidPosition.current.copy(carPosition.current);

      // Set initial camera position and rotation
      camera.position.copy(carPosition.current);
      camera.rotation.set(0, Math.PI, 0); // Face forward initially

      hasSpawned.current = true;
    }
  }, [scene, camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      handleKeyboardInput(e, keys.current, false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // Ground detection
    const allMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        allMeshes.push(object);
      }
    });

    // Cast multiple rays for ground detection
    const rayOrigins = createRayOrigins(carPosition.current);
    const rayDir = new Vector3(0, -1, 0);

    // Detect ground
    const { isOnGround: newIsOnGround, groundHeight: newGroundHeight } =
      detectGround(
        raycaster.current,
        scene,
        carPosition.current,
        rayOrigins,
        rayDir
      );

    isOnGround.current = newIsOnGround;
    if (newIsOnGround) {
      currentGroundY.current = newGroundHeight;
    }

    // Calculate current speed
    let targetSpeed = 0;
    let accelerationRate = deceleration;

    if (keys.current.w) {
      targetSpeed = maxSpeed;
      accelerationRate = acceleration;
    } else if (keys.current.s) {
      targetSpeed = maxSpeed;
      accelerationRate = acceleration;
    }

    currentSpeed.current = THREE.MathUtils.lerp(
      currentSpeed.current,
      targetSpeed,
      accelerationRate
    );

    // Handle car rotation - only when moving
    if (
      (keys.current.w || keys.current.s) &&
      (keys.current.a || keys.current.d)
    ) {
      // Speed-based turn rate - slower turns at higher speeds
      const speedFactor = 1 - (currentSpeed.current / maxSpeed) * 0.7;
      const adjustedTurnSpeed = baseTurnSpeed * speedFactor;

      if (keys.current.a) {
        targetRotation.current += adjustedTurnSpeed;
      }
      if (keys.current.d) {
        targetRotation.current -= adjustedTurnSpeed;
      }
    }

    // Smoothly interpolate current rotation to target rotation
    carRotation.current = THREE.MathUtils.lerp(
      carRotation.current,
      targetRotation.current,
      turnSmoothing
    );

    // Update car direction
    carDirection.current.set(
      Math.sin(carRotation.current),
      0,
      Math.cos(carRotation.current)
    );

    // Calculate movement
    moveDirection.current.set(0, 0, 0);
    if (keys.current.w) {
      moveDirection.current.add(carDirection.current);
    }
    if (keys.current.s) {
      moveDirection.current.sub(carDirection.current);
    }

    // Normalize and apply movement
    if (moveDirection.current.length() > 0) {
      moveDirection.current.normalize();
      const speed = currentSpeed.current * (keys.current.s ? -1 : 1);
      carPosition.current.x += moveDirection.current.x * speed * delta;
      carPosition.current.z += moveDirection.current.z * speed * delta;
    }

    // Update height
    if (isOnGround.current) {
      carPosition.current.y = currentGroundY.current + 1;
    }

    // Update camera position and rotation
    camera.position.copy(carPosition.current);
    camera.rotation.y = carRotation.current + Math.PI; // Always face forward, no mouse rotation
  });

  return null;
});
CarControls.displayName = "CarControls";

// Third person car controls
const ThirdPersonCarControls = forwardRef<any, Record<string, never>>(
  (_props, _ref) => {
    const { camera, scene } = useThree();
    const controlSettings = useSceneStore((state) => state.controlSettings);
    const moveSpeed = controlSettings.carSpeed;
    const turnSpeed = controlSettings.turnSpeed;
    const isOnGround = useRef(false);
    const raycaster = useRef(new THREE.Raycaster());
    const currentGroundY = useRef(0);
    const lastValidPosition = useRef(new Vector3());
    const hasSpawned = useRef(false);
    const groundSamples = useRef<number[]>([]);
    const maxGroundSamples = 5;
    const groundSmoothingFactor = 0.05;
    const cameraDistance = 10;
    const cameraHeight = 5;
    const moveDirection = useRef(new Vector3());
    const carDirection = useRef(new Vector3(0, 0, -1));
    const keys = useRef<KeyStates>({ w: false, s: false, a: false, d: false });
    const carRotation = useRef(0);
    const vehicleRef = useRef<THREE.Object3D>(new THREE.Object3D());
    const carHeight = 1;
    const velocity = useRef(new Vector3());
    const gravity = 9.8;
    const maxSpeed = 20;
    const friction = 0.95;

    // Find ground position using ray cast against 3D tiles
    useEffect(() => {
      if (!scene || hasSpawned.current) return;

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

      // Cast ray against all meshes
      const intersects = raycaster.current.intersectObjects(allMeshes);
      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        currentGroundY.current = hitPoint.y;
        // Initialize ground samples
        groundSamples.current = Array(maxGroundSamples).fill(hitPoint.y);
        // Spawn slightly above the hit point
        const spawnY = hitPoint.y + carHeight;
        vehicleRef.current.position.set(
          currentPosition.x,
          spawnY,
          currentPosition.z
        );
        lastValidPosition.current.copy(vehicleRef.current.position);
        hasSpawned.current = true;
      } else {
        // No ground found, spawn at current height
        currentGroundY.current = currentPosition.y;
        // Initialize ground samples
        groundSamples.current = Array(maxGroundSamples).fill(currentPosition.y);
        vehicleRef.current.position.copy(currentPosition);
        lastValidPosition.current.copy(currentPosition);
        hasSpawned.current = true;
      }
    }, [scene, camera]);

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

      // Cast multiple rays in a small area around the vehicle for better ground detection
      const rayOrigins = [
        new Vector3(
          vehicleRef.current.position.x,
          vehicleRef.current.position.y + 1.0,
          vehicleRef.current.position.z
        ),
        new Vector3(
          vehicleRef.current.position.x + 0.5,
          vehicleRef.current.position.y + 1.0,
          vehicleRef.current.position.z
        ),
        new Vector3(
          vehicleRef.current.position.x - 0.5,
          vehicleRef.current.position.y + 1.0,
          vehicleRef.current.position.z
        ),
        new Vector3(
          vehicleRef.current.position.x,
          vehicleRef.current.position.y + 1.0,
          vehicleRef.current.position.z + 0.5
        ),
        new Vector3(
          vehicleRef.current.position.x,
          vehicleRef.current.position.y + 1.0,
          vehicleRef.current.position.z - 0.5
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
        }
      }

      // Update ground state
      isOnGround.current = groundHeights.length > 0;

      // Handle car turning (independent of camera direction)
      if (keys.current.a) {
        carRotation.current += turnSpeed;
      }
      if (keys.current.d) {
        carRotation.current -= turnSpeed;
      }

      // Update car direction based on rotation
      carDirection.current.set(
        Math.sin(carRotation.current),
        0,
        Math.cos(carRotation.current)
      );

      // Update vehicle rotation to match car direction
      vehicleRef.current.rotation.y = carRotation.current;

      // Calculate movement direction based on car direction
      moveDirection.current.set(0, 0, 0);

      // Forward/Backward
      if (keys.current.w) {
        moveDirection.current.add(carDirection.current);
      }
      if (keys.current.s) {
        moveDirection.current.sub(carDirection.current);
      }

      // Normalize movement direction
      if (moveDirection.current.length() > 0) {
        moveDirection.current.normalize();
      }

      // Apply physics
      // Apply movement force
      if (isOnGround.current) {
        velocity.current.x += moveDirection.current.x * moveSpeed * delta;
        velocity.current.z += moveDirection.current.z * moveSpeed * delta;
      }

      // Apply gravity
      if (!isOnGround.current) {
        velocity.current.y -= gravity * delta;
      } else {
        // When on ground, maintain a small offset from the ground
        if (
          vehicleRef.current.position.y <
          currentGroundY.current + carHeight
        ) {
          vehicleRef.current.position.y = currentGroundY.current + carHeight;
          velocity.current.y = 0;
        }
      }

      // Apply friction
      velocity.current.x *= friction;
      velocity.current.z *= friction;

      // Limit speed
      const horizontalSpeed = Math.sqrt(
        velocity.current.x * velocity.current.x +
          velocity.current.z * velocity.current.z
      );
      if (horizontalSpeed > maxSpeed) {
        const ratio = maxSpeed / horizontalSpeed;
        velocity.current.x *= ratio;
        velocity.current.z *= ratio;
      }

      // Update position
      vehicleRef.current.position.x += velocity.current.x * delta;
      vehicleRef.current.position.y += velocity.current.y * delta;
      vehicleRef.current.position.z += velocity.current.z * delta;

      // Update camera position to follow the car from behind
      const targetPosition = vehicleRef.current.position.clone();
      const cameraOffset = new Vector3(
        Math.sin(carRotation.current) * -cameraDistance,
        cameraHeight,
        Math.cos(carRotation.current) * -cameraDistance
      );
      camera.position.copy(targetPosition).add(cameraOffset);
      camera.lookAt(targetPosition);
    });

    return (
      <primitive object={vehicleRef.current}>
        {/* Visual representation of the car */}
        <group>
          {/* Car body */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 0.5, 4]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          {/* Car roof */}
          <mesh position={[0, 1.2, -0.5]}>
            <boxGeometry args={[1.8, 0.5, 2]} />
            <meshStandardMaterial color="#3498db" />
          </mesh>
          {/* Windshield */}
          <mesh position={[0, 1.2, 0.5]}>
            <boxGeometry args={[1.8, 0.5, 0.1]} />
            <meshStandardMaterial color="#95a5a6" transparent opacity={0.7} />
          </mesh>
          {/* Wheels */}
          <mesh position={[1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          <mesh position={[-1, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          <mesh position={[1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          <mesh position={[-1, 0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
          {/* Headlights */}
          <mesh position={[0.7, 0.5, 2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#f1c40f"
              emissive="#f1c40f"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[-0.7, 0.5, 2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#f1c40f"
              emissive="#f1c40f"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Taillights */}
          <mesh position={[0.7, 0.5, -2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[-0.7, 0.5, -2]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </primitive>
    );
  }
);
ThirdPersonCarControls.displayName = "ThirdPersonCarControls";

const SceneViewModeController = () => {
  // Combine all scene store subscriptions into a single selector to reduce subscriptions from 8 to 1
  const sceneState = useSceneStore((state) => ({
    viewMode: state.viewMode,
    isThirdPerson: state.isThirdPerson,
  }));

  // Destructure for cleaner lookups
  const { viewMode, isThirdPerson } = sceneState;

  const renderControls = () => {
    switch (viewMode) {
      case "firstPerson":
        return <FirstPersonControls />;
      case "thirdPerson":
        return <ThirdPersonControls />;
      case "flight":
        return isThirdPerson ? (
          <ThirdPersonFlightControls />
        ) : (
          <FlightControls />
        );
      case "car":
        return isThirdPerson ? <ThirdPersonCarControls /> : <CarControls />;
      default:
        return null;
    }
  };

  return renderControls();
};

export default SceneViewModeController;
