"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Vector3 } from "three";

const THRUST = 0.2;
const TURN_SPEED = 0.002;
const CAMERA_DISTANCE = 20; // increased for further back view
const CAMERA_HEIGHT = 5; // raised camera for better overview

/**
 * Third-person flight controls without physics.
 * W/S = forward/backward thrust,
 * A/D = roll yaw,
 * Space/Shift = ascend/descend.
 * Click to lock pointer for mouse-look to pitch and yaw.
 */
export default function ThirdPersonFlightControls() {
  const { camera, gl } = useThree();
  const vehicleRef = useRef<THREE.Object3D>(new THREE.Object3D());
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Pointer-lock for mouse control
  useEffect(() => {
    const canvas = gl.domElement;
    const lock = () => canvas.requestPointerLock();
    canvas.addEventListener("click", lock);
    return () => canvas.removeEventListener("click", lock);
  }, [gl]);

  // Input handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.backward = true;
          break;
        case "KeyA":
          keys.current.left = true;
          break;
        case "KeyD":
          keys.current.right = true;
          break;
        case "Space":
          keys.current.up = true;
          break;
        case "ShiftLeft":
          keys.current.down = true;
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.left = false;
          break;
        case "KeyD":
          keys.current.right = false;
          break;
        case "Space":
          keys.current.up = false;
          break;
        case "ShiftLeft":
          keys.current.down = false;
          break;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        vehicleRef.current.rotation.y -= e.movementX * TURN_SPEED;
        vehicleRef.current.rotation.x -= e.movementY * TURN_SPEED;
        const limit = Math.PI / 2 - 0.1;
        vehicleRef.current.rotation.x = Math.max(
          -limit,
          Math.min(limit, vehicleRef.current.rotation.x)
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl.domElement]);

  // Frame update: move vehicle and update camera
  useFrame(() => {
    const v = vehicleRef.current;
    const dir = new Vector3();
    // Thrust forward/back
    if (keys.current.forward) dir.z -= THRUST;
    if (keys.current.backward) dir.z += THRUST;
    // Ascend/descend
    if (keys.current.up) dir.y += THRUST;
    if (keys.current.down) dir.y -= THRUST;
    // Apply local transform
    dir.applyQuaternion(v.quaternion);
    v.position.add(dir);

    // Camera follow behind and above
    const offset = new Vector3(
      0,
      CAMERA_HEIGHT,
      CAMERA_DISTANCE
    ).applyQuaternion(v.quaternion);
    camera.position.copy(v.position).add(offset);
    camera.lookAt(v.position);
  });

  return (
    <primitive object={vehicleRef.current}>
      {/* Scaled-down airplane model */}
      <group>
        <mesh>
          <capsuleGeometry args={[1, 0.25]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.05, 0.5]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, 0.25, -0.75]}>
          <boxGeometry args={[0.5, 0.25, 0.05]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, 0.25, -0.75]}>
          <boxGeometry args={[0.05, 0.25, 0.25]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        <mesh position={[0, 0.1, 0.75]}>
          <sphereGeometry args={[0.075]} />
          <meshStandardMaterial color="#3498db" />
        </mesh>
      </group>
    </primitive>
  );
}
