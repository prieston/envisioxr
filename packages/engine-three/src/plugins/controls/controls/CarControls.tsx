"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BASE_MAX_FORWARD = 20;
const BASE_MAX_REVERSE = 10;
const BASE_ACCELERATION = 30;
const BASE_FRICTION = 30;
const EPS_SPEED = 0.1;
const STEER_ANGLE = Math.PI / 2;
const STEER_SPEED = 10;

const PLAYER_HEIGHT = 0.5;
const COCKPIT_OFFSET = new THREE.Vector3(0, 1.2, 0.5);
const RAY_HEIGHT = 2;
const GROUND_EPS = 0.1;

export default function FirstPersonCarControls() {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster()).current;

  // Car state
  const carPosition = useRef(new THREE.Vector3());
  const carHeading = useRef(0);
  const speed = useRef(0);
  const throttle = useRef(0); // +1 forward, -1 reverse
  const steerTarget = useRef(0); // +1 left, -1 right
  const steerCurrent = useRef(0);
  const velocityY = useRef(0);
  const isBoost = useRef(false);

  // Spawn at camera start
  useEffect(() => {
    const start = camera.position.clone();
    raycaster.set(
      start.clone().add(new THREE.Vector3(0, RAY_HEIGHT, 0)),
      new THREE.Vector3(0, -1, 0)
    );
    const hit = raycaster.intersectObjects(scene.children, true)[0];
    const groundY = hit ? hit.point.y : start.y;
    carPosition.current.set(start.x, groundY + PLAYER_HEIGHT, start.z);
  }, []);

  // Input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
          throttle.current = 1; // forward
          break;
        case "KeyS":
          throttle.current = -1; // reverse
          break;
        case "KeyA":
          steerTarget.current = 1; // left
          break;
        case "KeyD":
          steerTarget.current = -1; // right
          break;
        case "ShiftLeft":
        case "ShiftRight":
          isBoost.current = true;
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "KeyS":
          throttle.current = 0;
          break;
        case "KeyA":
        case "KeyD":
          steerTarget.current = 0;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          isBoost.current = false;
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

  // Helper: gravity + snap the carPosition
  function applyGravityAndSnapOnPosition(
    position: THREE.Vector3,
    vy: number,
    dt: number
  ): { vy: number; onGround: boolean } {
    vy -= 9.81 * dt;
    position.y += vy * dt;

    const origin = position.clone().add(new THREE.Vector3(0, RAY_HEIGHT, 0));
    raycaster.set(origin, new THREE.Vector3(0, -1, 0));
    const hit = raycaster.intersectObjects(scene.children, true)[0];
    const groundY = hit ? hit.point.y : -Infinity;

    const targetY = groundY + PLAYER_HEIGHT;
    if (position.y <= targetY + GROUND_EPS) {
      position.y = targetY;
      return { vy: 0, onGround: true };
    }
    return { vy, onGround: false };
  }

  // Main loop
  useFrame((_, dt) => {
    // 1) Gravity & snap
    const { vy, onGround } = applyGravityAndSnapOnPosition(
      carPosition.current,
      velocityY.current,
      dt
    );
    velocityY.current = vy;

    // 2) Boost factor
    const boostMul = isBoost.current ? 1.5 : 1;
    const maxF = BASE_MAX_FORWARD * boostMul;
    const maxR = BASE_MAX_REVERSE * boostMul;
    const accel = BASE_ACCELERATION * boostMul;
    const friction = BASE_FRICTION;

    // 3) Update speed
    if (throttle.current !== 0 && onGround) {
      speed.current = THREE.MathUtils.clamp(
        speed.current + accel * throttle.current * dt,
        -maxR,
        maxF
      );
    } else {
      // apply friction always
      const sign = Math.sign(speed.current);
      speed.current -= sign * friction * dt;
      if (Math.abs(speed.current) < EPS_SPEED) speed.current = 0;
    }

    // 4) Steering smoothing + inversion in reverse
    steerCurrent.current +=
      (steerTarget.current - steerCurrent.current) *
      Math.min(dt * STEER_SPEED, 1);
    const steerSign = speed.current < 0 ? -1 : 1;
    const turn =
      steerCurrent.current *
      steerSign *
      STEER_ANGLE *
      (Math.abs(speed.current) / maxF);
    carHeading.current += turn * dt;

    // 5) Move carPosition (inverted forward vector)
    if (speed.current !== 0) {
      const forward = new THREE.Vector3(
        -Math.sin(carHeading.current),
        0,
        -Math.cos(carHeading.current)
      );
      carPosition.current.addScaledVector(forward, speed.current * dt);
    }

    // 6) Camera in cockpit
    const cockpitOffset = COCKPIT_OFFSET.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      carHeading.current
    );
    camera.position.copy(carPosition.current.clone().add(cockpitOffset));
    camera.rotation.set(0, carHeading.current, 0);
  });

  return null;
}
