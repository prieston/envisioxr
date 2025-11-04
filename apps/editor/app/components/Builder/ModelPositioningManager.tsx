"use client";

import React, { useEffect } from "react";
import { useSceneStore, useWorldStore } from "@envisio/core";
import ModelPositioningOverlay from "./ModelPositioningOverlay";
import * as THREE from "three";
import { setupCesiumClickSelector } from "@envisio/engine-cesium";

interface PendingModel {
  name: string;
  url: string;
  type: string;
  fileType?: string;
  assetId?: string;
}

interface ModelPositioningManagerProps {
  selectingPosition: boolean;
  selectedPosition: [number, number, number] | null;
  pendingModel: PendingModel | null;
  repositioningObjectId?: string | null;
  onPositionSelected: (position: [number, number, number]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModelPositioningManager: React.FC<ModelPositioningManagerProps> = ({
  selectingPosition,
  selectedPosition,
  pendingModel,
  repositioningObjectId,
  onPositionSelected,
  onConfirm,
  onCancel,
}) => {
  const { engine } = useWorldStore();
  // Combine store subscriptions to reduce from 4 to 1
  const sceneState = useSceneStore((s) => ({
    viewMode: s.viewMode,
    cesiumViewer: s.cesiumViewer,
    orbitControlsRef: s.orbitControlsRef,
    scene: s.scene,
  }));

  useEffect(() => {
    if (!selectingPosition) return;
    if (sceneState.viewMode === "firstPerson") return;

    // THREE.JS BRANCH (DOM listener on renderer canvas)
    if (engine === "three") {
      const canvas: HTMLCanvasElement =
        ((sceneState.scene as any)?.renderer
          ?.domElement as HTMLCanvasElement) ||
        (document.querySelector("canvas") as HTMLCanvasElement);

      if (!canvas || !sceneState.orbitControlsRef || !sceneState.scene) return;

      const handleClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mouse = new THREE.Vector2();
        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -(y / rect.height) * 2 + 1;

        const camera = (sceneState.scene as any).camera;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Get all meshes in scene
        const meshes: THREE.Object3D[] = [];
        sceneState.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            meshes.push(obj);
          }
        });

        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          const point = intersects[0].point;
          onPositionSelected([point.x, point.y, point.z]);
        }
      };

      canvas.addEventListener("click", handleClick);
      return () => canvas.removeEventListener("click", handleClick);
    }

    // CESIUM BRANCH
    if (engine === "cesium" && sceneState.cesiumViewer) {
      const Cesium = (window as any).Cesium;

      const cleanup = setupCesiumClickSelector(
        sceneState.cesiumViewer,
        (screenPosition) => {
          if (!screenPosition) return;

          try {
            // Convert screen coordinates to Cartesian2
            const position = new Cesium.Cartesian2(
              screenPosition.x,
              screenPosition.y
            );

            // Try to pick a position on the globe/terrain/3D objects
            let cartesian3: any = null;

            // First, try to pick a 3D position (terrain, models, etc.)
            cartesian3 = sceneState.cesiumViewer.scene.pickPosition(position);

            // If that fails, try to pick on the ellipsoid (globe surface)
            if (!Cesium.defined(cartesian3)) {
              const ray = sceneState.cesiumViewer.camera.getPickRay(position);
              if (ray) {
                cartesian3 = sceneState.cesiumViewer.scene.globe.pick(
                  ray,
                  sceneState.cesiumViewer.scene
                );
              }
            }

            // If still no position, try the ellipsoid directly
            if (!Cesium.defined(cartesian3)) {
              cartesian3 = sceneState.cesiumViewer.camera.pickEllipsoid(
                position,
                sceneState.cesiumViewer.scene.globe.ellipsoid
              );
            }

            if (!Cesium.defined(cartesian3)) {
              console.warn(
                "Could not pick position - clicked on sky or invalid area"
              );
              return;
            }

            // Validate the cartesian3 position
            if (
              isNaN(cartesian3.x) ||
              isNaN(cartesian3.y) ||
              isNaN(cartesian3.z) ||
              !isFinite(cartesian3.x) ||
              !isFinite(cartesian3.y) ||
              !isFinite(cartesian3.z)
            ) {
              console.warn("Invalid cartesian3 position:", cartesian3);
              return;
            }

            // Convert cartesian3 to cartographic (lat/lon/height)
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);

            if (!Cesium.defined(cartographic)) {
              console.warn("Failed to convert cartesian to cartographic");
              return;
            }

            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);
            const height = cartographic.height;

            // Validate the results
            if (
              isNaN(longitude) ||
              isNaN(latitude) ||
              isNaN(height) ||
              !isFinite(longitude) ||
              !isFinite(latitude) ||
              !isFinite(height)
            ) {
              console.warn("Invalid geographic coordinates:", {
                longitude,
                latitude,
                height,
              });
              return;
            }

            onPositionSelected([longitude, latitude, height]);
          } catch (error) {
            console.error("Error converting position:", error);
          }
        }
      );

      // setupCesiumClickSelector returns a cleanup function, just call it directly
      return cleanup;
    }
  }, [selectingPosition, sceneState.viewMode, engine, sceneState.cesiumViewer, sceneState.orbitControlsRef, sceneState.scene, onPositionSelected]);

  // Show overlay when either placing a new model or repositioning an existing one
  const isActive = selectingPosition && (pendingModel || repositioningObjectId);
  if (!isActive) return null;

  // Get display name: either from pending model or repositioning object
  let displayName = "";
  if (pendingModel) {
    displayName = pendingModel.name;
  } else if (repositioningObjectId) {
    // Get the object name from the scene store
    const repositioningObject = useSceneStore
      .getState()
      .objects.find((obj) => obj.id === repositioningObjectId);
    displayName = repositioningObject?.name || "Object";
  }
  const isRepositioning = !!repositioningObjectId;

  return (
    <ModelPositioningOverlay
      modelName={displayName}
      selectedPosition={selectedPosition}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isRepositioning={isRepositioning}
    />
  );
};

export default ModelPositioningManager;
