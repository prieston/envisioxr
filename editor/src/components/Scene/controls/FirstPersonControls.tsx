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

export default function FirstPersonControls() {
  const { camera, gl } = useThree();
  const bodyRef = useRef<RapierRigidBody>(null!);

  const [isLocked, setIsLocked] = useState(false);
  const [canJump, setCanJump] = useState(true);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<Key, boolean>>({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    const canvas = gl.domElement;
    const requestLock = () => canvas.requestPointerLock();
    const onLock = () => setIsLocked(document.pointerLockElement === canvas);
    canvas.addEventListener("click", requestLock);
    document.addEventListener("pointerlockchange", onLock);
    return () => {
      canvas.removeEventListener("click", requestLock);
      document.removeEventListener("pointerlockchange", onLock);
    };
  }, [gl]);

  const applyHorizontal = () => {
    const body = bodyRef.current;
    if (!body || !isLocked) return;
    const speed = keys.current.shift ? RUN_SPEED : WALK_SPEED;
    const dir = new THREE.Vector3(
      keys.current.d ? 1 : keys.current.a ? -1 : 0,
      0,
      keys.current.s ? 1 : keys.current.w ? -1 : 0
    );
    if (dir.lengthSq() > 0) dir.normalize().multiplyScalar(speed);
    dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
    const vel = body.linvel();
    body.setLinvel({ x: dir.x, y: vel.y, z: dir.z }, true);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      let moved = false;
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          moved = true;
          break;
        case "KeyA":
          keys.current.a = true;
          moved = true;
          break;
        case "KeyS":
          keys.current.s = true;
          moved = true;
          break;
        case "KeyD":
          keys.current.d = true;
          moved = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = true;
          moved = true;
          break;
        case "Space":
          if (canJump && bodyRef.current) {
            const { x, z } = bodyRef.current.linvel();
            bodyRef.current.setLinvel({ x, y: JUMP_VELOCITY, z }, true);
            setCanJump(false);
          }
          return;
      }
      if (moved) applyHorizontal();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      let moved = false;
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          moved = true;
          break;
        case "KeyA":
          keys.current.a = false;
          moved = true;
          break;
        case "KeyS":
          keys.current.s = false;
          moved = true;
          break;
        case "KeyD":
          keys.current.d = false;
          moved = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = false;
          moved = true;
          break;
      }
      if (moved) applyHorizontal();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [canJump, isLocked]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      const limit = Math.PI / 2 - 0.01;
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current));
      camera.rotation.set(pitch.current, yaw.current, 0);
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isLocked, camera]);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;
    const { x, y, z } = body.translation();
    camera.position.set(x, y + 0.5, z);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={1}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      onCollisionEnter={() => setCanJump(true)}
    >
      <CapsuleCollider args={[0.5, 1]} />

      {/* Invisible mesh for debug visualization */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
}
