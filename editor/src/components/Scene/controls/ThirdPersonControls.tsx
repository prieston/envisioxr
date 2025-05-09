"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RigidBody,
  RapierRigidBody,
  CapsuleCollider,
} from "@react-three/rapier";
import * as THREE from "three";

const WALK_SPEED = 4;
const RUN_SPEED = 8;
const JUMP_VELOCITY = 6;
const MOUSE_SENSITIVITY = 0.002;

type Key = "w" | "a" | "s" | "d" | "shift";

export default function ThirdPersonControls() {
  const { camera, gl } = useThree();
  const bodyRef = useRef<RapierRigidBody>(null!);

  // Jump state
  const [canJump, setCanJump] = useState(true);

  // Look orientation
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Pointer-lock state
  const [isLocked, setIsLocked] = useState(false);

  // Movement keys
  const keys = useRef<Record<Key, boolean>>({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });

  // Request pointer lock on click, track lock changes
  useEffect(() => {
    const canvas = gl.domElement;
    const requestLock = () => canvas.requestPointerLock();
    const onLockChange = () =>
      setIsLocked(document.pointerLockElement === canvas);
    const onEscape = (e: KeyboardEvent) => {
      if (e.code === "Escape") document.exitPointerLock();
    };

    canvas.addEventListener("click", requestLock);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("keydown", onEscape);

    return () => {
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("keydown", onEscape);
    };
  }, [gl]);

  // Mouse movement when locked
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      const limit = Math.PI / 4;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isLocked]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = true;
          break;
        case "Space":
          if (canJump && bodyRef.current) {
            const vel = bodyRef.current.linvel();
            bodyRef.current.setLinvel(
              { x: vel.x, y: JUMP_VELOCITY, z: vel.z },
              true
            );
            setCanJump(false);
          }
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = false;
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canJump]);

  // Movement relative to yaw
  const applyMovement = () => {
    const body = bodyRef.current;
    if (!body) return;
    const speed = keys.current.shift ? RUN_SPEED : WALK_SPEED;
    const dir = new THREE.Vector3(
      (keys.current.d ? 1 : 0) + (keys.current.a ? -1 : 0),
      0,
      (keys.current.s ? 1 : 0) + (keys.current.w ? -1 : 0)
    );
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed);
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    }
    const vel = body.linvel();
    body.setLinvel({ x: dir.x, y: vel.y, z: dir.z }, true);
  };

  // Update each frame
  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    applyMovement();

    const pos = body.translation();
    const offset = new THREE.Vector3(0, 2, 5)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch.current)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const desiredPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(offset);
    camera.position.lerp(desiredPos, 0.1);
    camera.lookAt(pos.x, pos.y + 1, pos.z);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={1}
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
      onCollisionEnter={() => setCanJump(true)}
    >
      <CapsuleCollider args={[0.5, 1]} />
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
}
