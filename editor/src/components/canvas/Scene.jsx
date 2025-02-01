"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Preload,
  Grid,
  OrbitControls,
  TransformControls,
  useGLTF,
  Sphere,
  Html,
  useProgress,
} from "@react-three/drei";
import useSceneStore from "@/hooks/useSceneStore";
import * as THREE from "three";
import ObservationPoint from "./ObservationPoint";
import { useSpring } from "@react-spring/three";

// ✅ Loader Component (Prevents Scene Flashing)
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "white" }}>Loading... {Math.round(progress)}%</div>
    </Html>
  );
};

// ✅ Model Component
const Model = ({ id, url, position, scale, rotation, selected, onSelect }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();
  // Ref to store pointer down position
  const pointerDown = useRef(null);
  // A small movement threshold (in pixels) to distinguish a click from a drag
  const CLICK_THRESHOLD = 5;

  // Apply selection highlighting
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive = selected
            ? new THREE.Color(0x00ffff)
            : new THREE.Color(0x000000);
        }
      });
    }
  }, [selected]);

  // Save pointer position on pointer down.
  const handlePointerDown = (e) => {
    e.stopPropagation();
    pointerDown.current = { x: e.clientX, y: e.clientY };
  };

  // On pointer up, compare positions and select if within threshold.
  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (!pointerDown.current) return;
    const dx = e.clientX - pointerDown.current.x;
    const dy = e.clientY - pointerDown.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Only treat as click if movement is small and not in preview mode.
    if (distance < CLICK_THRESHOLD && !useSceneStore.getState().previewMode) {
      onSelect(id, modelRef.current);
    }
    pointerDown.current = null;
  };

  return (
    <Suspense fallback={null}>
      <primitive
        object={scene}
        ref={modelRef}
        position={position}
        scale={scale}
        rotation={rotation}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </Suspense>
  );
};


// ✅ ObservationPointHandler Component
const ObservationPointHandler = () => {
  const { camera, controls } = useThree();
  const addingObservation = useSceneStore((state) => state.addingObservation);
  const addObservationPoint = useSceneStore((state) => state.addObservationPoint);

  useEffect(() => {
    if (addingObservation && camera && controls) {
      addObservationPoint(camera.position, controls.target);
    }
  }, [addingObservation, camera, controls, addObservationPoint]);

  return null;
};

// ✅ CameraPOVCaptureHandler Component (unchanged)
const CameraPOVCaptureHandler = ({ orbitControlsRef }) => {
  const { camera } = useThree();
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const selectedObservation = useSceneStore((state) => state.selectedObservation);
  const updateObservationPoint = useSceneStore((state) => state.updateObservationPoint);
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);

  useEffect(() => {
    if (capturingPOV && selectedObservation) {
      if (!orbitControlsRef.current) {
        console.warn("OrbitControls reference is null, cannot capture target.");
        return;
      }

      const newPosition = JSON.parse(JSON.stringify(camera.position.toArray()));
      const newTarget = JSON.parse(JSON.stringify(orbitControlsRef.current.target.toArray()));
      console.info("new target", newTarget);
      updateObservationPoint(selectedObservation.id, {
        position: newPosition,
        target: newTarget,
      });
      setCapturingPOV(false);
    }
  }, [capturingPOV, selectedObservation, camera, updateObservationPoint, setCapturingPOV]);

  return null;
};

/**
 * New Child Component for Camera Animation using react-spring.
 * This component is rendered inside Canvas so that it can use useThree.
 */
const CameraSpringController = ({ orbitControlsRef }) => {
  const { camera } = useThree();
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);

  // Create a spring for the camera's position and OrbitControls target.
  const [spring, api] = useSpring(() => ({
    cameraPosition: camera.position.toArray(),
    target: orbitControlsRef.current
      ? orbitControlsRef.current.target.toArray()
      : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  // When preview mode is active and the observation changes, update the spring.
  useEffect(() => {
    if (previewMode && observationPoints.length > 0) {
      const currentPoint = observationPoints[previewIndex];
      if (currentPoint && currentPoint.position && currentPoint.target) {
        api.start({
          cameraPosition: currentPoint.position,
          target: currentPoint.target,
        });
      }
    }
  }, [previewMode, previewIndex, observationPoints, api]);

  // On every frame, update the camera and controls with the animated values.
  useFrame(() => {
    // Always get the latest previewMode value.
    const previewMode = useSceneStore.getState().previewMode;
    if (previewMode && orbitControlsRef.current) {
      camera.position.set(...spring.cameraPosition.get());
      orbitControlsRef.current.target.set(...spring.target.get());
      orbitControlsRef.current.update();
    }
  });
  return null;
};

// ✅ Main Scene Component
export default function Scene({ ...props }) {
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectedObservation = useSceneStore((state) => state.selectedObservation);
  const transformMode = useSceneStore((state) => state.transformMode);
  const selectObject = useSceneStore((state) => state.selectObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);
  const selectObservationPoint = useSceneStore((state) => state.selectObservationPoint);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);

  const transformControlsRef = useRef();
  const orbitControlsRef = useRef();

  // Disable OrbitControls when an object is selected or (if you want) during preview mode.
  useEffect(() => {
    if (orbitControlsRef.current) {
      // For example, disable controls if an object is selected.
      orbitControlsRef.current.enabled = !selectedObject;
    }
  }, [selectedObject]);

  // Handle TransformControls object movement.
  useEffect(() => {
    if (transformControlsRef.current && selectedObject) {
      const handleObjectChange = () => {
        if (selectedObject?.ref) {
          if (transformMode === "translate") {
            setModelPosition(selectedObject.id, selectedObject.ref.position);
          } else if (transformMode === "rotate") {
            setModelRotation(selectedObject.id, selectedObject.ref.rotation);
          } else if (transformMode === "scale") {
            setModelScale(selectedObject.id, selectedObject.ref.scale);
          }
        }
      };

      transformControlsRef.current.addEventListener("objectChange", handleObjectChange);

      return () => {
        transformControlsRef.current.removeEventListener("objectChange", handleObjectChange);
      };
    }
  }, [selectedObject, setModelPosition, setModelRotation, setModelScale, transformMode]);

  console.info("thepoints", observationPoints);

  return (
    <Canvas
      {...props}
      camera={{ position: [0, 5, 10], fov: 50 }}
      onPointerMissed={() => deselectObject()} // Deselect when clicking empty space.
    >
      {/* OrbitControls (and pass the ref for camera animation) */}
      <OrbitControls ref={orbitControlsRef} />

      {/* Insert our CameraSpringController inside Canvas */}
      <CameraSpringController orbitControlsRef={orbitControlsRef} />

      <Suspense fallback={<Loader />}>
        {/* Grid (Preserved when loading models) */}
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          sectionSize={5}
          sectionThickness={1}
          fadeDistance={100}
          sectionColor={[1, 1, 1]}
          cellColor={[0.5, 0.5, 0.5]}
          renderOrder={-1} // Ensures grid renders before models.
        />

        {/* Scene Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} castShadow />

        {/* Render All Models */}
        {objects.map((obj) => (
          <Model
            key={obj.id}
            id={obj.id}
            url={obj.url}
            position={obj.position}
            scale={obj.scale}
            rotation={obj.rotation}
            selected={selectedObject?.id === obj.id}
            onSelect={selectObject}
          />
        ))}

        {/* Render Observation Points (Highlighted when selected) */}
        {observationPoints.map((point) => (
          <ObservationPoint
            key={point.id}
            id={point.id}
            position={point.position}
            target={point.target}
            selected={selectedObservation?.id === point.id}
            onSelect={selectObservationPoint}
          />
        ))}

        {/* Transform Controls (Move, Rotate, Scale) */}
        {selectedObject && selectedObject.ref && (
          <TransformControls
            ref={transformControlsRef}
            object={selectedObject.ref}
            mode={transformMode}
          />
        )}

        {/* Observation Point Handler inside Canvas */}
        <ObservationPointHandler />

        <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />

        {/* Preload all models */}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
