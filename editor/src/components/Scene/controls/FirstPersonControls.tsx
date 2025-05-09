import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls as ThreePointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import * as THREE from "three";
import {
  handleKeyboardInput,
  calculateMovementDirection,
  detectGround,
  createRayOrigins,
  applyMovement,
  KeyStates,
  MovementParams,
} from "../ControlHelpers";

const GRAVITY = 9.8;
const JUMP_VELOCITY = 5;
const PLAYER_HEIGHT = 1.8;
const PROBE_OFFSET = 0.3;

export default function FirstPersonControls() {
  const { camera, scene, gl } = useThree();
  const controlSettings = useSceneStore((s) => s.controlSettings);
  const moveSpeed = (controlSettings.walkSpeed * 1000) / 3600; // km/h → m/s

  // refs for state
  const isOnGround = useRef(false);
  const hasSpawned = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<KeyStates>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });
  const lastValidPos = useRef(new THREE.Vector3());
  const currentGroundY = useRef(0);
  const controlsRef = useRef<ThreePointerLockControls>();

  // multi‐ray ground sampling
  const sampleGround = (pos: THREE.Vector3) => {
    const offsets: [number, number][] = [
      [0, 0],
      [PROBE_OFFSET, 0],
      [-PROBE_OFFSET, 0],
      [0, PROBE_OFFSET],
      [0, -PROBE_OFFSET],
    ];
    let bestY: number | null = null;
    offsets.forEach(([dx, dz]) => {
      const probe = pos.clone().add(new THREE.Vector3(dx, 0, dz));
      const origins = createRayOrigins(probe);
      const { isOnGround, groundHeight } = detectGround(
        raycaster.current,
        scene,
        probe,
        origins,
        new THREE.Vector3(0, -1, 0)
      );
      if (isOnGround) {
        bestY = bestY === null ? groundHeight : Math.max(bestY, groundHeight);
      }
    });
    return {
      groundHeight: bestY !== null ? bestY : currentGroundY.current,
      isOnGround: bestY !== null,
    };
  };

  // 1) pointer‐lock on click
  useEffect(() => {
    controlsRef.current = new ThreePointerLockControls(camera, gl.domElement);
    const onClick = () => controlsRef.current?.lock();
    gl.domElement.addEventListener("click", onClick);
    return () => {
      gl.domElement.removeEventListener("click", onClick);
      controlsRef.current?.dispose();
    };
  }, [camera, gl.domElement]);

  // 2) initial spawn at ground
  useEffect(() => {
    if (hasSpawned.current) return;
    const start = camera.position.clone();
    const { groundHeight } = sampleGround(start);
    currentGroundY.current = groundHeight;
    camera.position.set(start.x, groundHeight + PLAYER_HEIGHT, start.z);
    lastValidPos.current.copy(camera.position);
    isOnGround.current = true;
    hasSpawned.current = true;
  }, [camera.position, scene]);

  // 3) keyboard handling
  useEffect(() => {
    const down = (e: KeyboardEvent) =>
      handleKeyboardInput(e, keys.current, true);
    const up = (e: KeyboardEvent) =>
      handleKeyboardInput(e, keys.current, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 4) main loop
  useFrame((_, delta) => {
    // — horizontal movement (x/z)
    const moveDir = new THREE.Vector3();
    calculateMovementDirection(
      camera,
      keys.current,
      moveDir,
      new THREE.Vector3(),
      new THREE.Vector3()
    );
    const horiz: MovementParams = {
      moveSpeed,
      friction: 0.95,
      maxSpeed: 10,
    };
    applyMovement(
      camera.position,
      moveDir,
      velocity.current,
      horiz,
      delta,
      isOnGround.current
    );

    // — jump impulse
    if (keys.current.space && isOnGround.current) {
      velocity.current.y = JUMP_VELOCITY;
      isOnGround.current = false;
    }

    // — apply gravity & integrate Y
    velocity.current.y -= GRAVITY * delta;
    camera.position.y += velocity.current.y * delta;

    // — sample ground height
    const { groundHeight } = sampleGround(camera.position);

    // — decide landing only if moving downward and feet at/below ground
    const feetY = camera.position.y - PLAYER_HEIGHT;
    const landingThreshold = 0.05;
    if (velocity.current.y <= 0 && feetY <= groundHeight + landingThreshold) {
      // landed!
      camera.position.y = groundHeight + PLAYER_HEIGHT;
      velocity.current.y = 0;
      isOnGround.current = true;
      lastValidPos.current.copy(camera.position);
      currentGroundY.current = groundHeight;
    } else {
      // still in air
      isOnGround.current = false;
    }

    // — out‐of‐bounds safeguard
    if (camera.position.y < currentGroundY.current - 20) {
      camera.position.copy(lastValidPos.current);
      velocity.current.set(0, 0, 0);
      isOnGround.current = true;
    }
  });

  return null;
}
