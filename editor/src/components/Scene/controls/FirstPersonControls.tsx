"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  applyGravityAndSnap,
  enablePointerLockMouseLook,
} from "./controlsUtils";

const WALK_SPEED = 4;
const RUN_SPEED = 8;
const JUMP_SPEED = 6;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.8;
const RAY_HEIGHT = 50;
const GROUND_EPS = 0.1;

type MoveKeys = {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  shift: boolean;
};
const KEY_MAP: Record<string, keyof MoveKeys> = {
  KeyW: "w",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  ShiftLeft: "shift",
  ShiftRight: "shift",
};

export default function FirstPersonControls() {
  const { camera, scene, gl } = useThree();
  const raycaster = useRef(new THREE.Raycaster()).current;
  const keys = useRef<MoveKeys>({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });
  const velocityY = useRef(0);
  const canJump = useRef(true);

  // Obstacle to ignore by raycast
  const obstacleRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    // put obstacle and player camera on layer 1
    obstacleRef.current.layers.set(1);
    camera.layers.enable(1);
  }, [camera]);

  // pointer‑lock & mouse look
  useEffect(() => {
    const { cleanup } = enablePointerLockMouseLook(camera, gl.domElement, {
      sensitivity: MOUSE_SENSITIVITY,
      initialOrder: "YXZ" as THREE.EulerOrder,
    });
    return cleanup;
  }, [camera, gl.domElement]);

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && canJump.current) {
        velocityY.current = JUMP_SPEED;
        canJump.current = false;
      }
      const m = KEY_MAP[e.code];
      if (m) keys.current[m] = true;
    };
    const up = (e: KeyboardEvent) => {
      const m = KEY_MAP[e.code];
      if (m) keys.current[m] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    // restrict raycaster to layer 0 only
    raycaster.layers.set(0);
  }, [raycaster]);

  useFrame((_, dt) => {
    // gravity & snap
    const { velocityY: newVY } = applyGravityAndSnap(
      camera,
      velocityY.current,
      dt,
      scene,
      raycaster,
      {
        playerHeight: PLAYER_HEIGHT,
        rayHeight: RAY_HEIGHT,
        groundEps: GROUND_EPS,
      }
    );
    velocityY.current = newVY;

    // movement
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();
    const move = new THREE.Vector3();
    if (keys.current.w) move.add(forward);
    if (keys.current.s) move.sub(forward);
    if (keys.current.d) move.add(right);
    if (keys.current.a) move.sub(right);
    if (move.lengthSq()) {
      move
        .normalize()
        .multiplyScalar((keys.current.shift ? RUN_SPEED : WALK_SPEED) * dt);
      camera.position.add(move);
    }
  });

  return (
    <>
      {/* obstacle that raycast will ignore */}
      <mesh ref={obstacleRef} position={[1, 0.5, -2]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      {/* no visual player mesh, camera acts as player */}
    </>
  );
}
