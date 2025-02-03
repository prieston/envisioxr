"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Preload,
  Grid,
  OrbitControls,
  TransformControls,
  Html,
  useProgress,
} from "@react-three/drei";
import useSceneStore from "@/hooks/useSceneStore";
import * as THREE from "three";
import ObservationPoint from "./ObservationPoint";
import { useSpring } from "@react-spring/three";
import Model from "./Model";

// Loader Component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "white" }}>Loading... {Math.round(progress)}%</div>
    </Html>
  );
};

// ObservationPointHandler Component
const ObservationPointHandler = () => {
  const { camera, controls } = useThree();
  const addingObservation = useSceneStore((state) => state.addingObservation);
  const addObservationPoint = useSceneStore(
    (state) => state.addObservationPoint
  );

  useEffect(() => {
    if (addingObservation && camera && controls) {
      addObservationPoint(camera.position, controls.target);
    }
  }, [addingObservation, camera, controls, addObservationPoint]);

  return null;
};

// CameraPOVCaptureHandler Component
const CameraPOVCaptureHandler = ({ orbitControlsRef }) => {
  const { camera } = useThree();
  const capturingPOV = useSceneStore((state) => state.capturingPOV);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const updateObservationPoint = useSceneStore(
    (state) => state.updateObservationPoint
  );
  const setCapturingPOV = useSceneStore((state) => state.setCapturingPOV);

  useEffect(() => {
    if (capturingPOV && selectedObservation) {
      if (!orbitControlsRef.current) {
        console.warn("OrbitControls reference is null, cannot capture target.");
        return;
      }

      const newPosition = JSON.parse(JSON.stringify(camera.position.toArray()));
      const newTarget = JSON.parse(
        JSON.stringify(orbitControlsRef.current.target.toArray())
      );
      console.info("new target", newTarget);
      updateObservationPoint(selectedObservation.id, {
        position: newPosition,
        target: newTarget,
      });
      setCapturingPOV(false);
    }
  }, [
    capturingPOV,
    selectedObservation,
    camera,
    updateObservationPoint,
    setCapturingPOV,
  ]);

  return null;
};

// CameraSpringController Component
const CameraSpringController = ({ orbitControlsRef }) => {
  const { camera } = useThree();
  const previewMode = useSceneStore((state) => state.previewMode);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);

  const [spring, api] = useSpring(() => ({
    cameraPosition: camera.position.toArray(),
    target: orbitControlsRef.current
      ? orbitControlsRef.current.target.toArray()
      : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  }));

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

  useFrame(() => {
    const previewMode = useSceneStore.getState().previewMode;
    if (previewMode && orbitControlsRef.current) {
      camera.position.set(...spring.cameraPosition.get());
      orbitControlsRef.current.target.set(...spring.target.get());
      orbitControlsRef.current.update();
    }
  });
  return null;
};

// Main Scene Component
export default function Scene({
  initialSceneData,
  onSceneDataChange,
  renderObservationPoints,
}) {
  // Retrieve store state and actions
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );
  const transformMode = useSceneStore((state) => state.transformMode);
  const selectObject = useSceneStore((state) => state.selectObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);
  const selectObservationPoint = useSceneStore(
    (state) => state.selectObservationPoint
  );
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );

  const transformControlsRef = useRef();
  const orbitControlsRef = useRef();
  const initialSceneDataInitialized = useRef(false);

  // Initialize the store from initialSceneData only once
  useEffect(() => {
    if (initialSceneData && !initialSceneDataInitialized.current) {
      setObjects(initialSceneData.objects || []);
      setObservationPoints(initialSceneData.observationPoints || []);
      initialSceneDataInitialized.current = true;
    }
  }, [initialSceneData, setObjects, setObservationPoints]);

  // Propagate store changes upward
  useEffect(() => {
    if (onSceneDataChange) {
      onSceneDataChange({ objects, observationPoints });
    }
  }, [objects, observationPoints, onSceneDataChange]);

  // Disable OrbitControls when an object is selected.
  useEffect(() => {
    if (orbitControlsRef.current) {
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

      transformControlsRef.current.addEventListener(
        "objectChange",
        handleObjectChange
      );

      return () => {
        transformControlsRef.current.removeEventListener(
          "objectChange",
          handleObjectChange
        );
      };
    }
  }, [
    selectedObject,
    setModelPosition,
    setModelRotation,
    setModelScale,
    transformMode,
  ]);

  console.info("Observation points:", observationPoints);

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      onPointerMissed={() => deselectObject()}
    >
      <OrbitControls ref={orbitControlsRef} />
      <CameraSpringController orbitControlsRef={orbitControlsRef} />
      <Suspense fallback={<Loader />}>
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
          renderOrder={-1}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} castShadow />

        {objects.map((obj) => (
          <Model
            key={obj.id}
            id={obj.id}
            url={obj.url}
            type={obj.type}
            position={obj.position}
            scale={obj.scale}
            rotation={obj.rotation}
            selected={selectedObject?.id === obj.id}
            onSelect={selectObject}
          />
        ))}

        {observationPoints.map((point) => (
          <ObservationPoint
            key={point.id}
            id={point.id}
            position={point.position}
            target={point.target}
            selected={selectedObservation?.id === point.id}
            onSelect={selectObservationPoint}
            renderObservationPoints={renderObservationPoints}
          />
        ))}

        {selectedObject && selectedObject.ref && (
          <TransformControls
            ref={transformControlsRef}
            object={selectedObject.ref}
            mode={transformMode}
          />
        )}

        <ObservationPointHandler />
        <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
