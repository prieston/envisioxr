"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  Grid,
  Preload,
} from "@react-three/drei";
import useSceneStore from "@/hooks/useSceneStore";
import Loader from "./Loader";
import ObservationPointHandler from "./ObservationPointHandler";
import CameraPOVCaptureHandler from "./CameraPOVCaptureHandler";
import CameraSpringController from "./CameraSpringController";
import Model from "../Model";
import ObservationPoint from "../ObservationPoint";
import XRWrapper from "./XRWrapper";

export default function Scene({
  initialSceneData,
  onSceneDataChange,
  renderObservationPoints,
  enableXR = false,
}) {
  // Retrieve store state and actions
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);
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

  const transformControlsRef = useRef(null);
  const orbitControlsRef = useRef(null);
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

  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      onPointerMissed={() => deselectObject()}
    >
      <XRWrapper enabled={enableXR} orbitControlsRef={orbitControlsRef}>
        <Suspense fallback={<Loader />}>
          <Grid
            position={[0, 0, 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            sectionSize={5}
            sectionThickness={1}
            fadeDistance={100}
            sectionColor="white"
            cellColor="gray"
            renderOrder={-1}
          />
          {/* @ts-ignore-next-line */}
          <ambientLight intensity={0.5} />
          {/* @ts-ignore-next-line */}
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
              onSelect={previewMode || enableXR ? null : selectObject}
            />
          ))}

          {observationPoints.map((point) => (
            <ObservationPoint
              key={point.id}
              id={point.id}
              position={point.position}
              target={point.target}
              selected={selectedObservation?.id === point.id}
              onSelect={previewMode || enableXR ? null : selectObservationPoint}
              previewMode={previewMode}
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

          <Preload all />
        </Suspense>
      </XRWrapper>
    </Canvas>
  );
}
