import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import * as THREE from "three";

const DRONE_ACCELERATION = 20; // units/s²
const DRONE_FRICTION = 0.98; // per-frame damping when no input
const DRONE_MAX_SPEED = 30; // cap velocity
const MOUSE_SENSITIVITY = 0.01;
// rotationSpeed comes from your controlSettings.turnSpeed

const FlightControls: React.FC = () => {
  const { camera, gl } = useThree();
  const { flightSpeed, turnSpeed } = useSceneStore((s) => s.controlSettings);
  const moveSpeed = flightSpeed;
  const rotSpeed = turnSpeed;

  // state
  const keys = useRef<Record<string, boolean>>({
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    Space: false,
    ShiftLeft: false,
  });
  const velocity = useRef(new THREE.Vector3());
  const accelDir = useRef(new THREE.Vector3());

  // 1) pointer-lock on click
  useEffect(() => {
    const onClick = () => gl.domElement.requestPointerLock();
    gl.domElement.addEventListener("click", onClick);
    return () => {
      gl.domElement.removeEventListener("click", onClick);
    };
  }, [gl.domElement]);

  // 2) track keys
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code in keys.current) keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code in keys.current) keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // 3) mouse-look
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        camera.rotation.order = "YXZ";
        camera.rotation.y -= e.movementX * rotSpeed * MOUSE_SENSITIVITY;
        camera.rotation.x -= e.movementY * rotSpeed * MOUSE_SENSITIVITY;
        camera.rotation.x = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, camera.rotation.x)
        );
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl.domElement, rotSpeed, camera]);

  // 4) frame-loop: apply acceleration, inertia, move camera
  useFrame((_, delta) => {
    const v = velocity.current;
    const dirLocal = accelDir.current.set(0, 0, 0);

    // build input vector in local camera space
    if (keys.current.KeyW) dirLocal.z -= 1;
    if (keys.current.KeyS) dirLocal.z += 1;
    if (keys.current.KeyA) dirLocal.x -= 1;
    if (keys.current.KeyD) dirLocal.x += 1;
    if (keys.current.Space) dirLocal.y += 1;
    if (keys.current.ShiftLeft) dirLocal.y -= 1;

    if (dirLocal.lengthSq() > 0) {
      // accelerate in that direction
      dirLocal.normalize();
      dirLocal.applyQuaternion(camera.quaternion);
      v.addScaledVector(dirLocal, DRONE_ACCELERATION * delta);
    } else {
      // no input → friction damping
      v.multiplyScalar(DRONE_FRICTION);
    }

    // clamp to max drone speed
    const maxV = moveSpeed ?? DRONE_MAX_SPEED;
    if (v.length() > maxV) v.setLength(maxV);

    // move camera
    camera.position.addScaledVector(v, delta);
  });

  return null;
};

export default FlightControls;
