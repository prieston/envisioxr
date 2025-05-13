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
const TURN_SPEED = 0.002;
const MOUSE_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.8;
const RAY_HEIGHT = 50;
const GROUND_EPS = 0.1;
const CAMERA_OFFSET = new THREE.Vector3(0, 2, -5);

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

export default function ThirdPersonControls() {
  // simple obstacle to avoid
  const avoidRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    if (avoidRef.current) avoidRef.current.layers.set(1);
  }, []);

  const { camera, scene, gl } = useThree();
  const playerRef = useRef<THREE.Mesh>(null!);
  // assign player to layer 1 to avoid self-intersection
  useEffect(() => {
    playerRef.current.layers.set(1);
  }, []);
  const raycaster = useRef(new THREE.Raycaster()).current;
  // restrict raycaster to layer 0 (world geometry) only
  useEffect(() => {
    raycaster.layers.set(0);
  }, []);
  const keys = useRef<MoveKeys>({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
  });
  const velocityY = useRef(0);
  const canJump = useRef(true);

  // Pointer-lock & mouse-look: now rotates the player mesh
  useEffect(() => {
    const { cleanup } = enablePointerLockMouseLook(camera, gl.domElement, {
      sensitivity: MOUSE_SENSITIVITY,
      initialOrder: "YXZ" as THREE.EulerOrder,
    });
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        // yaw (horizontal)
        playerRef.current.rotation.y -= e.movementX * TURN_SPEED;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      cleanup();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, gl.domElement]);

  // Keyboard for movement and jump
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

  useFrame((_, dt) => {
    // Gravity & snap (manual raycast excluding player)
    // update vertical velocity
    velocityY.current -= 9.8 * dt;
    // cast from above player down
    const origin = playerRef.current.position.clone();
    origin.y += RAY_HEIGHT;
    raycaster.set(origin, new THREE.Vector3(0, -1, 0));
    const hits = raycaster
      .intersectObjects(scene.children, true)
      .filter((hit) => hit.object !== playerRef.current);
    if (hits.length && hits[0].distance < PLAYER_HEIGHT + GROUND_EPS) {
      // on or close to ground
      velocityY.current = Math.max(0, velocityY.current);
      // snap to ground
      playerRef.current.position.y = hits[0].point.y + PLAYER_HEIGHT / 2;
      canJump.current = true;
    } else {
      // in air
      playerRef.current.position.y += velocityY.current * dt;
    }

    // Local forward vector (based on player rotation) (based on player rotation)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      playerRef.current.quaternion
    );
    forward.y = 0;
    forward.normalize();

    // Right vector
    const right = new THREE.Vector3()
      .crossVectors(forward, new THREE.Vector3(0, 1, 0))
      .normalize();

    // Movement dir
    const move = new THREE.Vector3();
    if (keys.current.w) move.add(forward);
    if (keys.current.s) move.sub(forward);
    if (keys.current.d) move.add(right);
    if (keys.current.a) move.sub(right);

    if (move.lengthSq()) {
      move
        .normalize()
        .multiplyScalar((keys.current.shift ? RUN_SPEED : WALK_SPEED) * dt);
      playerRef.current.position.add(move);
    }

    // Camera follow logic
    const offset = CAMERA_OFFSET.clone().applyQuaternion(
      playerRef.current.quaternion
    );
    const desiredPosition = playerRef.current.position.clone().add(offset);
    camera.position.lerp(desiredPosition, 0.1);
    camera.lookAt(playerRef.current.position);
  });

  return (
    <mesh ref={playerRef} position={[0, PLAYER_HEIGHT / 2, 0]}>
      <boxGeometry args={[1, PLAYER_HEIGHT, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
