"use client";

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import useSceneStore from "../../app/hooks/useSceneStore.ts";
// import dynamic from "next/dynamic";
import useModelLoader from "./useModelLoader.tsx";
import { useModelSelection } from "./hooks/useModelSelection.ts";
import { useModelMaterials } from "./hooks/useModelMaterials.ts";
import ObservationVisibilityArea from "./ObservationVisibilityArea";
import ActualVisibilityArea from "./ActualVisibilityArea";
import IoTDataDisplay from "./IoTDataDisplay";

// // Dynamically import CesiumIonTiles to avoid SSR issues
// const CesiumIonTiles = dynamic(
//   () => import("../../app/components/CesiumIonTiles.tsx"),
//   {
//     ssr: false,
//   }
// ) as React.ComponentType<{
//   apiKey: string;
//   assetId?: string;
//   position?: [number, number, number];
//   rotation?: [number, number, number];
//   scale?: [number, number, number];
//   latitude: number;
//   longitude: number;
// }>;

interface ModelProps {
  id: string;
  url: string;
  type?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  selected?: boolean;
  onSelect?: (id: string, object: THREE.Object3D) => void;
  assetId?: string;
  isObservationModel?: boolean;
  observationProperties?: {
    fov: number;
    showVisibleArea: boolean;
    visibilityRadius: number;
    showActualArea: boolean;
    showCalculatedArea: boolean;
    gridDensity?: number;
    iotProvider?: string;
    iotData?: any;
  };
}

const Model = ({
  id,
  url,
  type = "glb",
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  selected,
  onSelect,
  isObservationModel,
  observationProperties,
}: ModelProps) => {
  const store = useSceneStore();
  const objectFromStore = store.objects.find((obj) => obj.id === id);
  const effectiveObservationProperties =
    objectFromStore?.observationProperties || observationProperties;

  // If this is a Cesium Ion tiles model, render it differently
  // if (type === "tiles" && assetId) {
  //   return (
  //     <CesiumIonTiles
  //       apiKey={process.env.NEXT_PUBLIC_CESIUM_ION_KEY || ""}
  //       assetId={assetId}
  //       position={position}
  //       rotation={rotation}
  //       scale={scale}
  //       latitude={
  //         useSceneStore.getState().selectedLocation?.latitude || 35.6586
  //       }
  //       longitude={
  //         useSceneStore.getState().selectedLocation?.longitude || 139.7454
  //       }
  //     />
  //   );
  // }

  // For regular models, use the model loader
  const modelData = useModelLoader(url, type);

  if (!modelData) {
    return null;
  }

  const originalObject = (modelData as any).scene || modelData;

  // Clone the loaded object and ensure each mesh has its own material.
  const clonedObject = useMemo(() => {
    if (originalObject) {
      const clone = originalObject.clone(true);
      // Set the isModel flag on the parent object
      clone.userData.isModel = true;
      clone.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // Clone material to avoid sharing between instances
          child.material = child.material.clone();
        }
      });
      return clone;
    }
    return null;
  }, [originalObject]);

  const modelRef = useRef<THREE.Object3D | null>(null);
  const previewMode = useSceneStore((state) => state.previewMode);
  const updateModelRef = useSceneStore((state) => state.updateModelRef);

  // Use custom hooks for model functionality
  const { handlePointerDown, handlePointerUp } = useModelSelection({
    id,
    onSelect,
    previewMode,
  });

  useModelMaterials({
    modelRef,
    selected,
    previewMode,
  });

  // Update model properties when they change
  useEffect(() => {
    if (modelRef.current) {
      // Update position
      if (position) {
        modelRef.current.position.set(...position);
      }
      // Update rotation
      if (rotation) {
        modelRef.current.rotation.set(...rotation);
      }
      // Update scale
      if (scale) {
        modelRef.current.scale.set(...scale);
      }
    }
  }, [position, rotation, scale]);

  // Update the model ref in the store
  useEffect(() => {
    if (modelRef.current) {
      updateModelRef(id, modelRef.current);
    }
  }, [id, updateModelRef]);

  if (!clonedObject) {
    return null;
  }

  return (
    <>
      <primitive
        ref={modelRef}
        object={clonedObject}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
      {isObservationModel && effectiveObservationProperties && (
        <>
          {effectiveObservationProperties.showVisibleArea && (
            <ObservationVisibilityArea
              position={position}
              rotation={rotation}
              fov={effectiveObservationProperties.fov}
              radius={effectiveObservationProperties.visibilityRadius}
              showVisibleArea={effectiveObservationProperties.showVisibleArea}
            />
          )}
          {effectiveObservationProperties.showCalculatedArea && (
            <ActualVisibilityArea
              key={`visibility-${id}-${Date.now()}`}
              position={position}
              rotation={rotation}
              fov={effectiveObservationProperties.fov}
              radius={effectiveObservationProperties.visibilityRadius}
              showVisibleArea={
                effectiveObservationProperties.showCalculatedArea
              }
              gridDensity={effectiveObservationProperties.gridDensity || 10}
              objectId={id}
            />
          )}
          {effectiveObservationProperties.iotProvider &&
            effectiveObservationProperties.iotData && (
              <IoTDataDisplay
                position={position}
                data={effectiveObservationProperties.iotData}
              />
            )}
        </>
      )}
    </>
  );
};

export default Model;
