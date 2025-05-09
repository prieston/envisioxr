import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useSceneStore from "../../../../app/hooks/useSceneStore";
import {
  handleKeyboardInput,
  detectGround,
  createRayOrigins,
  KeyStates,
} from "../ControlHelpers";

const CAR_ACCELERATION = 10; // units/s²
const CAR_FRICTION = 0.95; // coast-down
const CAR_BRAKE = 0.8; // hand-brake skid
const TURN_SPEED = 0.05; // radians/frame at full throttle
const LATERAL_DAMPING = 0.03; // how quickly sideways speed bleeds off
const CAR_HEIGHT_OFFSET = 0.5; // how high above ground
const CAMERA_BACK_DIST = 10;
const CAMERA_HEIGHT = 1.5;
const CAMERA_LOOK_AHEAD = 10;
const EDGE_PROBE_DIST = 1; // how far ahead to check for ground

const CarControls: React.FC = () => {
  const { camera, scene } = useThree();
  const { carSpeed } = useSceneStore((s) => s.controlSettings);
  const maxSpeed = carSpeed ?? 20;

  // mutable state refs
  const keys = useRef<KeyStates>({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false,
  });
  const raycaster = useRef(new THREE.Raycaster());
  const carPos = useRef(new THREE.Vector3());
  const lastValidPos = useRef(new THREE.Vector3());
  const groundY = useRef(0);
  const rotation = useRef(0); // yaw
  const carDir = useRef(new THREE.Vector3()); // forward direction
  const vel = useRef(new THREE.Vector3()); // velocity vector

  // 1) Spawn on whatever ground is under the camera
  useEffect(() => {
    const start = camera.position.clone();
    const origins = createRayOrigins(start);
    const { groundHeight } = detectGround(
      raycaster.current,
      scene,
      start,
      origins,
      new THREE.Vector3(0, -1, 0)
    );

    groundY.current = groundHeight;
    carPos.current.set(start.x, groundHeight + CAR_HEIGHT_OFFSET, start.z);
    lastValidPos.current.copy(carPos.current);

    // position camera behind the car
    camera.position.set(
      carPos.current.x - CAMERA_BACK_DIST,
      carPos.current.y + CAMERA_HEIGHT,
      carPos.current.z - CAMERA_BACK_DIST
    );
    // look straight ahead, parallel to ground
    const lookPt = carPos.current
      .clone()
      .add(
        carDir.current
          .set(0, 0, 1)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current)
      )
      .setY(camera.position.y);
    camera.lookAt(lookPt);
  }, [scene, camera]);

  // 2) WASD + Space → keys.current
  useEffect(() => {
    const onDown = (e: KeyboardEvent) =>
      handleKeyboardInput(e, keys.current, true);
    const onUp = (e: KeyboardEvent) =>
      handleKeyboardInput(e, keys.current, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // 3) Main loop: drive, steer, edge‐stop, ground‐check, camera
  useFrame((_, delta) => {
    const v = vel.current;

    // — Forward vector from yaw
    carDir.current.set(
      Math.sin(rotation.current),
      0,
      Math.cos(rotation.current)
    );

    // — Steering only when moving, reverse when backing up
    const forwardDot = carDir.current.dot(v);
    const steerSign = forwardDot >= 0 ? 1 : -1;
    const speedFactor = Math.min(v.length() / maxSpeed, 1);
    if (keys.current.a)
      rotation.current += TURN_SPEED * speedFactor * steerSign;
    if (keys.current.d)
      rotation.current -= TURN_SPEED * speedFactor * steerSign;

    // — Acceleration / Reverse
    if (keys.current.w)
      v.addScaledVector(carDir.current, CAR_ACCELERATION * delta);
    if (keys.current.s)
      v.addScaledVector(carDir.current, -CAR_ACCELERATION * delta);

    // — Hand‐brake vs coast
    if (keys.current.space) v.multiplyScalar(CAR_BRAKE);
    else if (!keys.current.w && !keys.current.s) v.multiplyScalar(CAR_FRICTION);

    // — Clamp and kill tiny drifts
    if (v.length() > maxSpeed) v.setLength(maxSpeed);
    if (v.length() < 0.01) v.set(0, 0, 0);

    // — Lateral damping to reduce drift
    const forwardComp = carDir.current
      .clone()
      .multiplyScalar(carDir.current.dot(v));
    const lateralComp = v
      .clone()
      .sub(forwardComp)
      .multiplyScalar(LATERAL_DAMPING);
    v.copy(forwardComp.add(lateralComp));

    // — EDGE PROTECTION: look ahead before moving
    const probePos = carPos.current
      .clone()
      .add(carDir.current.clone().multiplyScalar(EDGE_PROBE_DIST));
    const originsAhead = createRayOrigins(probePos);
    const { isOnGround: groundAhead } = detectGround(
      raycaster.current,
      scene,
      probePos,
      originsAhead,
      new THREE.Vector3(0, -1, 0)
    );
    if (!groundAhead && (keys.current.w || keys.current.s)) {
      // cancel throttle so you can’t drive over the edge
      v.set(0, 0, 0);
    }

    // — Move the car
    carPos.current.addScaledVector(v, delta);

    // — Ground‐check & snap Y
    const origins = createRayOrigins(carPos.current);
    const { isOnGround, groundHeight } = detectGround(
      raycaster.current,
      scene,
      carPos.current,
      origins,
      new THREE.Vector3(0, -1, 0)
    );
    if (isOnGround) {
      groundY.current = groundHeight;
      lastValidPos.current.copy(carPos.current);
      carPos.current.y = groundHeight + CAR_HEIGHT_OFFSET;
    } else {
      carPos.current.copy(lastValidPos.current);
    }

    // — Camera follows behind‐and‐above
    const camOffset = carDir.current.clone().multiplyScalar(-CAMERA_BACK_DIST);
    camera.position
      .copy(carPos.current)
      .add(
        camOffset.setY(camera.position.y - carPos.current.y + CAMERA_HEIGHT)
      );

    // — Look straight ahead, parallel to ground
    const lookAhead = carDir.current.clone().multiplyScalar(CAMERA_LOOK_AHEAD);
    const lookPoint = carPos.current
      .clone()
      .add(lookAhead)
      .setY(camera.position.y);
    camera.lookAt(lookPoint);
  });

  return null;
};

export default CarControls;
