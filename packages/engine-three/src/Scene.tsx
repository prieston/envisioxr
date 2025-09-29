"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, Sky, Html } from "@react-three/drei";
import { useSceneStore } from "@envisio/core/state";
import * as THREE from "three";

import type {
  SceneProps,
  Model,
} from "../../../editor/src/components/Scene/types";
import SceneLights from "../../../editor/src/components/Scene/SceneLights";
import SceneObjects from "../../../editor/src/components/Scene/SceneObjects";
import SceneObservationPoints from "../../../editor/src/components/Scene/SceneObservationPoints";
import SceneTransformControlsNew from "../../../editor/src/components/Scene/SceneTransformControlsNew";
import CameraPOVCaptureHandler from "../../../editor/src/components/Scene/CameraPOVCaptureHandler";
import ObservationPointHandler from "../../../editor/src/components/Scene/ObservationPointHandler";
import CameraSpringController from "../../../editor/src/components/Scene/CameraSpringController";
import XRWrapper from "../../../editor/src/components/Scene/XRWrapper";
import SceneControls from "../../../editor/src/components/Scene/controls/SceneControls";
import Loader from "../../../editor/src/components/Scene/Loader";
import dynamic from "next/dynamic";

// Create a dynamic import for the 3D Tiles components
const TilesComponent = dynamic(
  () =>
    import("../../../editor/app/components/Builder/Environment/TilesComponent"),
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

// Create a component to handle deselection
const DeselectionHandler = () => {
  const { scene, camera, gl } = useThree();
  const deselectObject = useSceneStore((state) => state.deselectObject);

  const handleClick = (e: MouseEvent) => {
    if (e.target !== gl.domElement) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allObjects: THREE.Mesh[] = [];
    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        allObjects.push(object);
      }
    });

    const intersects = raycaster.intersectObjects(allObjects, true);
    if (intersects.length === 0) {
      deselectObject();
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [scene, camera, gl, deselectObject]);

  return null;
};

export default function Scene({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
  isPublishMode = false,
}: SceneProps) {
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
  const cesiumIonAssets = useSceneStore((state) => state.cesiumIonAssets);

  const transformControlsRef = useRef<any>(null);

  const setObjects = useSceneStore((state) => state.setObjects);
  const setObservationPoints = useSceneStore(
    (state) => state.setObservationPoints
  );
  const setSelectedAssetId = useSceneStore((state) => state.setSelectedAssetId);
  const setSelectedLocation = useSceneStore(
    (state) => state.setSelectedLocation
  );
  const setCesiumIonAssets = useSceneStore((state) => state.setCesiumIonAssets);

  useEffect(() => {
    if (initialSceneData) {
      setObjects(initialSceneData.objects || []);
      setObservationPoints(initialSceneData.observationPoints || []);
      setSelectedAssetId(initialSceneData.selectedAssetId || "2275207");
      setSelectedLocation(initialSceneData.selectedLocation || null);
      setCesiumIonAssets(initialSceneData.cesiumIonAssets || []);
    }
  }, [
    initialSceneData,
    setObjects,
    setObservationPoints,
    setSelectedAssetId,
    setSelectedLocation,
    setCesiumIonAssets,
  ]);

  useEffect(() => {
    if (onSceneDataChange) {
      onSceneDataChange({
        objects: objects as Model[],
        observationPoints,
        selectedAssetId,
        selectedLocation,
        cesiumIonAssets,
      });
    }
  }, [
    objects,
    observationPoints,
    selectedAssetId,
    selectedLocation,
    cesiumIonAssets,
    onSceneDataChange,
  ]);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000");
        }}
      >
        <Suspense fallback={null}>
          <XRWrapper enabled={enableXR}>
            <DeselectionHandler />
            {showTiles && (
              <TilesComponent
                apiKey={process.env.NEXT_PUBLIC_CESIUM_ION_KEY || ""}
                assetId={selectedAssetId}
                latitude={selectedLocation?.latitude}
                longitude={selectedLocation?.longitude}
              />
            )}

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

            <SceneLights ambientLightIntensity={ambientLightIntensity} />
            <SceneObjects
              objects={objects as Model[]}
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
            <SceneTransformControlsNew
              selectedObject={selectedObject as Model | null}
              transformControlsRef={transformControlsRef}
            />

            <SceneControls />

            <CameraSpringController />
            <CameraPOVCaptureHandler />
            <ObservationPointHandler />
          </XRWrapper>
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}
