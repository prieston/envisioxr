// ThirdPersonControls.tsx
"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  applyGravityAndSnap,
  enablePointerLockMouseLook,
} from "./controlsUtils";

// Movement & physics constants
const WALK_SPEED = 4;
const RUN_SPEED = 8;
const JUMP_SPEED = 6;
const PLAYER_HEIGHT = 1.8;
const GROUND_EPS = 0.1;
const MOUSE_SENSITIVITY = 0.002;

// Camera offsets (third‑person)
const CAMERA_DISTANCE = 10;
const CAMERA_HEIGHT = 3;

// Keys
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
  const { camera, scene, gl } = useThree();

  // Refs
  const playerRef = useRef<THREE.Mesh>(null!);
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

  // 1) Add a ground plane once, so raycaster can hit it
  useEffect(() => {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "lightgreen" })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = "GroundPlane";
    // default layer 0: raycaster will hit this
    scene.add(ground);
  }, [scene]);

  // 2) Limit raycaster to layer 0
  useEffect(() => {
    raycaster.layers.set(0);
  }, [raycaster]);

  // 3) Pointer‑lock & mouse look for yaw
  useEffect(() => {
    const { cleanup } = enablePointerLockMouseLook(camera, gl.domElement, {
      sensitivity: MOUSE_SENSITIVITY,
      initialOrder: "YXZ" as THREE.EulerOrder,
    });
    return cleanup;
  }, [camera, gl.domElement]);

  // 4) Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && canJump.current) {
        velocityY.current = JUMP_SPEED;
        canJump.current = false;
      }
      const m = KEY_MAP[e.code];
      if (m) keys.current[m] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const m = KEY_MAP[e.code];
      if (m) keys.current[m] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // 5) Main loop
  useFrame((_, dt) => {
    // -- DEBUG & raycast setup --
    const origin = playerRef.current.position.clone();
    origin.y += PLAYER_HEIGHT + GROUND_EPS + 0.1;
    const dir = new THREE.Vector3(0, -1, 0);
    raycaster.set(origin, dir);
    raycaster.far = PLAYER_HEIGHT + GROUND_EPS + 0.2;

    // -- Gravity & snapping --
    const tempCamera = new THREE.PerspectiveCamera();
    tempCamera.position.copy(playerRef.current.position);
    const { velocityY: newVY, onGround } = applyGravityAndSnap(
      tempCamera,
      velocityY.current,
      dt,
      scene,
      raycaster,
      {
        playerHeight: PLAYER_HEIGHT,
        rayHeight: 0, // handled manually
        groundEps: GROUND_EPS,
      }
    );
    playerRef.current.position.copy(tempCamera.position);
    console.log(
      `%c[DEBUG] velY before: ${velocityY.current.toFixed(2)}, after: ${newVY.toFixed(2)}, onGround: ${onGround}`,
      "color: blue;"
    );
    velocityY.current = newVY;

    // -- Movement --
    const forward = new THREE.Vector3();
    playerRef.current.getWorldDirection(forward);
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
      playerRef.current.position.add(move);
    }

    // -- Camera follow --
    const offset = new THREE.Vector3(
      0,
      CAMERA_HEIGHT,
      CAMERA_DISTANCE
    ).applyQuaternion(playerRef.current.quaternion);
    camera.position.copy(playerRef.current.position).add(offset);
    camera.lookAt(playerRef.current.position);
  });

  return (
    <mesh ref={playerRef} position={[0, PLAYER_HEIGHT / 2, 0]}>
      <boxGeometry args={[1, PLAYER_HEIGHT, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
