"use client";

import React, { useRef, useEffect, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Sky, Html } from "@react-three/drei";
import useSceneStore from "../../../app/hooks/useSceneStore";
import {
  SceneProps,
  SceneLights,
  SceneObjects,
  SceneObservationPoints,
  SceneTransformControls,
  CameraPOVCaptureHandler,
  ObservationPointHandler,
  CameraSpringController,
  XRWrapper,
} from ".";
import SceneViewModeController from "./SceneViewModeController";
import Loader from "./Loader";
import { isWebGPUAvailable, createWebGPUContext } from "../../../lib/webgpu";
import dynamic from "next/dynamic";

// Create a dynamic import for the 3D Tiles components
const TilesComponent = dynamic(
  () => import("../../../app/components/TilesComponent"),
  {
    ssr: false,
    loading: () => (
      <Html center>
        <div
          style={{
            color: "white",
            background: "rgba(0,0,0,0.7)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          Loading 3D Tiles components...
        </div>
      </Html>
    ),
  }
);

export default function Scene({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
  isPublishMode = false,
}: SceneProps) {
  const [isWebGPU, setIsWebGPU] = useState(false);

  // Scene state from store
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);
  const gridEnabled = useSceneStore((state) => state.gridEnabled);
  const ambientLightIntensity = useSceneStore(
    (state) => state.ambientLightIntensity
  );
  const skyboxType = useSceneStore((state) => state.skyboxType);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectedLocation = useSceneStore((state) => state.selectedLocation);
  const showTiles = useSceneStore((state) => state.showTiles);

  // Refs
  const orbitControlsRef = useRef<any>(null);
  const transformControlsRef = useRef<any>(null);

  // Store actions
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );
  const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
  const setSelectedLocation = useSceneStore(
    (state) => state.setSelectedLocation
  );
  const setOrbitControlsRef = useSceneStore(
    (state) => state.setOrbitControlsRef
  );

  // Initialize WebGPU
  useEffect(() => {
    isWebGPUAvailable().then(setIsWebGPU);
  }, []);

  // Initialize scene data
  useEffect(() => {
    if (initialSceneData) {
      setObjects(initialSceneData.objects || []);
      setObservationPoints(initialSceneData.observationPoints || []);
      setSelectedAssetId(initialSceneData.selectedAssetId || "2275207");
      setSelectedLocation(initialSceneData.selectedLocation || null);
    }
  }, [
    initialSceneData,
    setObjects,
    setObservationPoints,
    setSelectedAssetId,
    setSelectedLocation,
  ]);

  // Update scene data
  useEffect(() => {
    if (onSceneDataChange) {
      onSceneDataChange({
        objects,
        observationPoints,
        selectedAssetId: useSceneStore.getState().selectedAssetId,
        selectedLocation: useSceneStore.getState().selectedLocation,
      });
    }
  }, [objects, observationPoints, onSceneDataChange]);

  // Store orbit controls ref
  useEffect(() => {
    setOrbitControlsRef(orbitControlsRef.current);
  }, [setOrbitControlsRef]);

  const handleAssetSelect = (
    assetId: string,
    latitude: number,
    longitude: number
  ) => {
    setSelectedAssetId(assetId);
    setSelectedLocation({ latitude, longitude });
  };

  return (
    <>
      <Canvas
        style={{ background: "#1a1a1a", width: "100%", height: "100%" }}
        camera={{ position: [10, 10, 10], fov: 50, far: 1e9 }}
        onPointerMissed={() => useSceneStore.getState().deselectObject()}
        gl={{
          ...(isWebGPU && { backend: "webgpu" }),
          ...createWebGPUContext(),
        }}
      >
        <Suspense fallback={null}>
          <XRWrapper enabled={enableXR} orbitControlsRef={orbitControlsRef}>
            {showTiles && (
              <TilesComponent
                apiKey={process.env.NEXT_PUBLIC_CESIUM_ION_KEY || ""}
                assetId={selectedAssetId}
                latitude={selectedLocation?.latitude}
                longitude={selectedLocation?.longitude}
              />
            )}

            {/* Environment Elements */}
            {skyboxType === "default" && (
              <Sky
                distance={450000}
                sunPosition={[10, 20, 10]}
                inclination={0.49}
                azimuth={0.25}
              />
            )}
            {gridEnabled && (
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
            )}

            {/* Scene Components */}
            <SceneLights ambientLightIntensity={ambientLightIntensity} />
            <SceneObjects
              objects={objects}
              previewMode={previewMode}
              enableXR={enableXR}
              isPublishMode={isPublishMode}
            />
            <SceneObservationPoints
              points={observationPoints}
              previewMode={previewMode}
              enableXR={enableXR}
              renderObservationPoints={renderObservationPoints}
            />
            <SceneTransformControls
              selectedObject={selectedObject}
              transformControlsRef={transformControlsRef}
            />
            <SceneViewModeController orbitControlsRef={orbitControlsRef} />
            <CameraSpringController orbitControlsRef={orbitControlsRef} />
            <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />
            <ObservationPointHandler />
          </XRWrapper>
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
