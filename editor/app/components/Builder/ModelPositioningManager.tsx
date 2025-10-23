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
  onPositionSelected: (position: [number, number, number]) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModelPositioningManager: React.FC<ModelPositioningManagerProps> = ({
  selectingPosition,
  selectedPosition,
  pendingModel,
  onPositionSelected,
  onConfirm,
  onCancel,
}) => {
  const { engine } = useWorldStore();
  const viewMode = useSceneStore((s) => s.viewMode);
  const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
  const orbitControlsRef = useSceneStore((s) => s.orbitControlsRef);
  const scene = useSceneStore((s) => s.scene);

  useEffect(() => {
    if (!selectingPosition) return;
    if (viewMode === "firstPerson") return;

    // THREE.JS BRANCH (DOM listener on renderer canvas)
    if (engine === "three") {
      const canvas: HTMLCanvasElement =
        ((scene as any)?.renderer?.domElement as HTMLCanvasElement) ||
        (document.querySelector("canvas") as HTMLCanvasElement);

      if (!canvas || !orbitControlsRef || !scene) return;

      const handleClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mouse = new THREE.Vector2();
        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -(y / rect.height) * 2 + 1;

        const camera = (scene as any).camera;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Get all meshes in scene
        const meshes: THREE.Object3D[] = [];
        scene.traverse((obj) => {
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
    if (engine === "cesium" && cesiumViewer) {
      const Cesium = (window as any).Cesium;

      const cleanup = setupCesiumClickSelector(
        cesiumViewer,
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
            cartesian3 = cesiumViewer.scene.pickPosition(position);

            // If that fails, try to pick on the ellipsoid (globe surface)
            if (!Cesium.defined(cartesian3)) {
              const ray = cesiumViewer.camera.getPickRay(position);
              if (ray) {
                cartesian3 = cesiumViewer.scene.globe.pick(
                  ray,
                  cesiumViewer.scene
                );
              }
            }

            // If still no position, try the ellipsoid directly
            if (!Cesium.defined(cartesian3)) {
              cartesian3 = cesiumViewer.camera.pickEllipsoid(
                position,
                cesiumViewer.scene.globe.ellipsoid
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
  }, [
    selectingPosition,
    viewMode,
    engine,
    cesiumViewer,
    orbitControlsRef,
    scene,
    onPositionSelected,
  ]);

  if (!selectingPosition || !pendingModel) return null;

  return (
    <ModelPositioningOverlay
      modelName={pendingModel.name}
      selectedPosition={selectedPosition}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default ModelPositioningManager;
