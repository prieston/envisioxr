"use client";

import React, { useRef, useEffect, Suspense } from "react";
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
import Loader from "./Loader";
import dynamic from "next/dynamic";
import LocationSearch from "../../../app/components/LocationSearch";

// Create a dynamic import for the 3D Tiles components to ensure they're loaded client-side
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
  const orbitControlsRef = useRef<any>(null);
  const transformControlsRef = useRef<any>(null);
  const objects = useSceneStore((state) => state.objects);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);
  const selectedAssetId = useSceneStore((state) => state.selectedAssetId);
  const selectedLocation = useSceneStore((state) => state.selectedLocation);
  const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
  const setSelectedLocation = useSceneStore(
    (state) => state.setSelectedLocation
  );

  // Initialize the store from initialSceneData
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

  // Update scene data when asset or location changes
  useEffect(() => {
    if (onSceneDataChange) {
      onSceneDataChange({
        objects,
        observationPoints,
        selectedAssetId,
        selectedLocation,
      });
    }
  }, [
    objects,
    observationPoints,
    selectedAssetId,
    selectedLocation,
    onSceneDataChange,
  ]);

  // Set initial camera position based on observation points
  useEffect(() => {
    if (observationPoints.length > 0 && orbitControlsRef.current) {
      const firstPoint = observationPoints[0];
      if (firstPoint.position && firstPoint.target) {
        orbitControlsRef.current.target.set(...firstPoint.target);
        orbitControlsRef.current.update();
      }
    }
  }, [observationPoints]);

  // Disable OrbitControls when an object is selected
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !selectedObject;
    }
  }, [selectedObject]);

  const handleAssetSelect = (
    assetId: string,
    latitude: number,
    longitude: number
  ) => {
    setSelectedAssetId(assetId);
    setSelectedLocation({ latitude, longitude });

    // Calculate camera position based on the selected location
    if (orbitControlsRef.current) {
      // Convert lat/lon to radians
      const latRad = latitude * (Math.PI / 180);
      const lonRad = longitude * (Math.PI / 180);

      // Calculate camera position (adjust these values to control the camera distance and angle)
      const distance = 1000; // Distance from the target
      const height = 500; // Height above the target
      const x = distance * Math.cos(latRad) * Math.sin(lonRad);
      const y = height;
      const z = distance * Math.cos(latRad) * Math.cos(lonRad);

      // Set the camera position and target
      orbitControlsRef.current.target.set(0, 0, 0);
      orbitControlsRef.current.object.position.set(x, y, z);
      orbitControlsRef.current.update();
    }
  };

  return (
    <>
      <Canvas
        style={{ background: "#1a1a1a", width: "100%", height: "100%" }}
        camera={{ position: [10, 10, 10], fov: 50, far: 1e9 }}
        onPointerMissed={() => useSceneStore.getState().deselectObject()}
      >
        <Suspense fallback={null}>
          <XRWrapper enabled={enableXR} orbitControlsRef={orbitControlsRef}>
            <TilesComponent
              apiKey={process.env.NEXT_PUBLIC_CESIUM_ION_KEY || ""}
              assetId={selectedAssetId}
              latitude={selectedLocation?.latitude}
              longitude={selectedLocation?.longitude}
            />

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

            {/* Scene Components */}
            <SceneLights />
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

            {/* Scene Handlers */}
            <CameraPOVCaptureHandler orbitControlsRef={orbitControlsRef} />
            <ObservationPointHandler />
            <CameraSpringController orbitControlsRef={orbitControlsRef} />
          </XRWrapper>
        </Suspense>
      </Canvas>
      {!isPublishMode && <LocationSearch onAssetSelect={handleAssetSelect} />}
      <Loader />
    </>
  );
}
