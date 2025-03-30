"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Sky, TransformControls } from "@react-three/drei";
import useSceneStore from "../../../app/hooks/useSceneStore";
import Loader from "./Loader";
import Model from "../Model";
import ObservationPoint from "../ObservationPoint";
import CameraPOVCaptureHandler from "./CameraPOVCaptureHandler";
import ObservationPointHandler from "./ObservationPointHandler";
import CameraSpringController from "./CameraSpringController";

interface SceneProps {
  initialSceneData?: any;
  renderObservationPoints?: boolean;
  onSceneDataChange?: (data: any) => void;
  enableXR?: boolean;
}

export default function Scene({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
}: SceneProps) {
  const orbitControlsRef = useRef(null);
  const transformControlsRef = useRef(null);
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);
  const previewMode = useSceneStore((state) => state.previewMode);
  const transformMode = useSceneStore((state) => state.transformMode);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);
  const selectObservationPoint = useSceneStore(
    (state) => state.selectObservationPoint
  );
  const selectedObservation = useSceneStore(
    (state) => state.selectedObservation
  );

  // Initialize the store from initialSceneData
  useEffect(() => {
    if (initialSceneData) {
      setObjects(initialSceneData.objects || []);
      setObservationPoints(initialSceneData.observationPoints || []);
    }
  }, [initialSceneData, setObjects, setObservationPoints]);

  // Disable OrbitControls when an object is selected
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !selectedObject;
    }
  }, [selectedObject]);

  return (
    <>
      <Canvas
        style={{ background: "#1a1a1a", width: "100%", height: "100%" }}
        camera={{ position: [10, 10, 10], fov: 50 }}
        onPointerMissed={() => deselectObject()}
      >
        <Suspense fallback={null}>
          <OrbitControls ref={orbitControlsRef} />

          {/* Basic scene elements */}
          <Sky
            distance={450000}
            sunPosition={[10, 20, 10]}
            inclination={0.49}
            azimuth={0.25}
          />
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

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <hemisphereLight
            intensity={0.5}
            groundColor="#444444"
            position={[0, 50, 0]}
          />

          {/* Render objects from store */}
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

          {/* Observation Points */}
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

          {/* Transform Controls */}
          {selectedObject && selectedObject.ref && (
            <TransformControls
              ref={transformControlsRef}
              object={selectedObject.ref}
              mode={transformMode}
              onChange={() => {
                if (transformMode === "translate") {
                  setModelPosition(
                    selectedObject.id,
                    selectedObject.ref.position
                  );
                } else if (transformMode === "rotate") {
                  setModelRotation(
                    selectedObject.id,
                    selectedObject.ref.rotation
                  );
                } else if (transformMode === "scale") {
                  setModelScale(selectedObject.id, selectedObject.ref.scale);
                }
              }}
            />
          )}

          {/* Camera POV Capture Handler */}
          <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />

          {/* Observation Point Handler */}
          <ObservationPointHandler />

          {/* Camera Spring Controller for smooth transitions */}
          <CameraSpringController orbitControlsRef={orbitControlsRef} />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
