"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

// Adjusted constants for slower speed and easier turning
const ACCELERATION = 15; // reduced acceleration for slower top speed
const BRAKE_FORCE = 20; // stronger braking
const STEER_TORQUE = 15; // increased torque for sharper, easier turns
const DRAG_FACTOR = 0.9; // more linear drag to slow down quicker
const ANGULAR_DRAG = 0.5; // moderate angular drag to let steering reset faster

/**
 * Third-person car driving controls
 * W/S = throttle/brake, A/D = steering
 */
export default function CarControls() {
  const bodyRef = useRef<RapierRigidBody>(null!);
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const { camera } = useThree();

  // Keyboard input listeners
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
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Driving logic each frame
  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    // Orientation quaternion
    const { x: qx, y: qy, z: qz, w: qw } = body.rotation();
    const quat = new THREE.Quaternion(qx, qy, qz, qw);

    // Calculate forward vector
    const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);

    // Apply acceleration/brake
    if (keys.current.forward) {
      const impulse = forwardVec.clone().multiplyScalar(ACCELERATION);
      body.applyImpulse({ x: impulse.x, y: 0, z: impulse.z }, true);
    }
    if (keys.current.backward) {
      const impulse = forwardVec.clone().multiplyScalar(-BRAKE_FORCE);
      body.applyImpulse({ x: impulse.x, y: 0, z: impulse.z }, true);
    }

    // Steering torque
    if (keys.current.left) {
      body.applyTorqueImpulse({ x: 0, y: STEER_TORQUE, z: 0 }, true);
    }
    if (keys.current.right) {
      body.applyTorqueImpulse({ x: 0, y: -STEER_TORQUE, z: 0 }, true);
    }

    // Linear and angular drag
    const vel = body.linvel();
    body.setLinvel(
      { x: vel.x * DRAG_FACTOR, y: vel.y, z: vel.z * DRAG_FACTOR },
      true
    );
    const ang = body.angvel();
    body.setAngvel(
      {
        x: ang.x * ANGULAR_DRAG,
        y: ang.y * ANGULAR_DRAG,
        z: ang.z * ANGULAR_DRAG,
      },
      true
    );

    // Camera follow behind car
    const pos = body.translation();
    const camOffset = new THREE.Vector3(0, 5, 12).applyQuaternion(quat);
    const desiredPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(camOffset);
    camera.position.lerp(desiredPos, 0.1);
    camera.lookAt(pos.x, pos.y + 1, pos.z);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      mass={1200}
      linearDamping={0.2}
      angularDamping={0.5}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
