"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Cartesian3,
  HeadingPitchRoll,
  Transforms,
  Math as CesiumMath,
  JulianDate,
  Quaternion,
  Ellipsoid,
  BoundingSphere,
  Cartographic,
  ConstantPositionProperty,
  ConstantProperty,
} from "@cesium/engine";
// Note: Viewer is imported from @cesium/widgets but we use the viewer from the store
import { TransformEditor } from "@cesiumgs/ion-sdk-measurements";
import { useSceneStore } from "@envisio/core/state";

interface ObjectTransformEditorProps {
  selectedObject: {
    id: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    name?: string;
  };
}

const ObjectTransformEditor: React.FC<ObjectTransformEditorProps> = ({
  selectedObject,
}) => {
  const { cesiumViewer, transformMode } = useSceneStore();
  const transformEditorRef = useRef<TransformEditor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- helpers ---
  const applyTRStoEntity = useCallback(
    (
      entity: any, // Entity type from Cesium
      translation: Cartesian3,
      hpr: HeadingPitchRoll
    ) => {
      entity.position = new ConstantPositionProperty(translation);
      const quat = Transforms.headingPitchRollQuaternion(
        translation,
        hpr,
        Ellipsoid.WGS84
      );
      entity.orientation = new ConstantProperty(quat);
    },
    []
  );

  const updateStoreFromCartesian = useCallback(
    (id: string, pos: Cartesian3, hpr: HeadingPitchRoll) => {
      const carto = Cartographic.fromCartesian(pos);
      useSceneStore
        .getState()
        .updateObjectProperty(id, "position", [
          CesiumMath.toDegrees(carto.longitude),
          CesiumMath.toDegrees(carto.latitude),
          carto.height,
        ]);
      useSceneStore
        .getState()
        .updateObjectProperty(id, "rotation", [
          hpr.heading,
          hpr.pitch,
          hpr.roll,
        ]);
    },
    []
  );

  // --- init once per viewer ---
  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;
    setIsInitialized(true);
  }, [cesiumViewer, isInitialized]);

  // --- onChange from TransformEditor ---
  const handleTransformChange = useCallback(
    (trs: {
      translation?: Cartesian3;
      rotation?: [number, number, number];
      scale?: [number, number, number];
    }) => {
      if (!cesiumViewer) return;
      const modelEntityId = `model-${selectedObject.id}`;
      const modelEntity = cesiumViewer.entities.getById(modelEntityId) as
        | any
        | undefined;
      if (!modelEntity) {
        // Model entity not found
        return;
      }

      const now = JulianDate.now();
      const currentPos =
        (modelEntity.position &&
          (modelEntity.position as any).getValue?.(now)) ||
        Cartesian3.clone(Cartesian3.ZERO);
      const currentQuat =
        (modelEntity.orientation &&
          (modelEntity.orientation as any).getValue?.(now)) ||
        Quaternion.IDENTITY;
      const currentHPR = HeadingPitchRoll.fromQuaternion(currentQuat);

      const nextPos =
        trs?.translation instanceof Cartesian3 ? trs.translation : currentPos;
      const [
        h = currentHPR.heading,
        p = currentHPR.pitch,
        r = currentHPR.roll,
      ] = Array.isArray(trs?.rotation)
        ? trs.rotation
        : [currentHPR.heading, currentHPR.pitch, currentHPR.roll];

      const nextHPR = new HeadingPitchRoll(h, p, r);
      applyTRStoEntity(modelEntity, nextPos, nextHPR);

      // scale (uniform)
      if (trs?.scale && modelEntity.model) {
        const [sx = 1, sy = 1, sz = 1] = trs.scale;
        const uniform = Math.max(sx, sy, sz);
        const mg = modelEntity.model as any;
        // ModelGraphics expects a Property; accept number too if your typings differ
        (mg as any).scale = new ConstantProperty(uniform);
      }

      updateStoreFromCartesian(selectedObject.id, nextPos, nextHPR);
      cesiumViewer.scene.requestRender();
    },
    [
      cesiumViewer,
      selectedObject.id,
      applyTRStoEntity,
      updateStoreFromCartesian,
    ]
  );

  // --- create/destroy TransformEditor when object changes ---
  useEffect(() => {
    if (!isInitialized || !selectedObject || !cesiumViewer) return;

    // cleanup previous
    if (transformEditorRef.current) {
      try {
        transformEditorRef.current.destroy();
        if ((transformEditorRef.current as any)._container) {
          document.body.removeChild(
            (transformEditorRef.current as any)._container
          );
        }
      } catch {
        // Ignore cleanup errors
      }
      transformEditorRef.current = null;
    }

    // ensure target entity exists (created elsewhere in your app)
    const targetEntity = cesiumViewer.entities.getById(
      `model-${selectedObject.id}`
    );
    if (!targetEntity) {
      // Model entity not found for transform editor
      return;
    }

    // place target at selectedObject's initial pose (optional safety)
    const [lon = 0, lat = 0, hgt = 0] = selectedObject.position || [0, 0, 0];
    const [hd = 0, pt = 0, rl = 0] = selectedObject.rotation || [0, 0, 0];
    const pos = Cartesian3.fromDegrees(lon, lat, hgt);
    const hpr = new HeadingPitchRoll(hd, pt, rl);
    applyTRStoEntity(targetEntity as any, pos, hpr);

    // Create transform object from the entity's position
    const transform = Transforms.eastNorthUpToFixedFrame(pos, Ellipsoid.WGS84);

    // Create a minimal container (just for the editor, no UI)
    const container = document.createElement("div");
    container.style.display = "none"; // Hide it since we don't need UI

    // Create a bounding sphere for the transform editor
    const boundingSphere = new BoundingSphere(pos, 50.0);

    // Create the TransformEditor with proper options
    const transformEditor = new TransformEditor({
      container: container,
      scene: cesiumViewer.scene,
      transform: transform,
      boundingSphere: boundingSphere,
      pixelSize: 100,
      maximumSizeInMeters: 50.0,
    });

    // Set up the onChange callback
    transformEditor.viewModel.position = pos;
    transformEditor.viewModel.headingPitchRoll = hpr;

    // Set up efficient change detection
    let lastPosition = pos.clone();
    let lastHPR = hpr.clone();
    let lastScale = new Cartesian3(1, 1, 1);
    let animationId: number | null = null;

    const checkForChanges = () => {
      if (transformEditor.viewModel.active) {
        const newPosition = transformEditor.viewModel.position;
        const newHPR = transformEditor.viewModel.headingPitchRoll;
        const newScale = transformEditor.viewModel.scale;

        // Check for position changes
        if (newPosition && !Cartesian3.equals(newPosition, lastPosition)) {
          console.log("🎯 Position changed:", newPosition);
          handleTransformChange({
            translation: newPosition,
            rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
            scale: [newScale.x, newScale.y, newScale.z],
          });
          lastPosition = newPosition.clone();
        }

        // Check for rotation changes
        if (newHPR && !HeadingPitchRoll.equals(newHPR, lastHPR)) {
          console.log("🔄 Rotation changed:", newHPR);
          handleTransformChange({
            translation: newPosition || lastPosition,
            rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
            scale: [newScale.x, newScale.y, newScale.z],
          });
          lastHPR = newHPR.clone();
        }

        // Check for scale changes
        if (newScale && !Cartesian3.equals(newScale, lastScale)) {
          console.log("📏 Scale changed:", newScale);
          handleTransformChange({
            translation: newPosition || lastPosition,
            rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
            scale: [newScale.x, newScale.y, newScale.z],
          });
          lastScale = newScale.clone();
        }
      }

      // Continue checking for changes
      animationId = requestAnimationFrame(checkForChanges);
    };

    // Start checking for changes
    checkForChanges();

    // Configure the transform editor
    transformEditor.viewModel.setModeTranslation();
    transformEditor.viewModel.enableNonUniformScaling = true;
    transformEditor.viewModel.activate();

    // Force initial render to show the gizmo
    cesiumViewer.scene.requestRender();

    console.log("🎯 TransformEditor created for object:", selectedObject.id);

    // Store container reference for cleanup
    (transformEditor as any)._container = container;

    transformEditorRef.current = transformEditor;

    return () => {
      if (transformEditorRef.current) {
        try {
          // Cancel animation frame
          if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }

          // Destroy the transform editor
          transformEditorRef.current.destroy();
          if ((transformEditorRef.current as any)._container) {
            document.body.removeChild(
              (transformEditorRef.current as any)._container
            );
          }
        } catch {
          // Ignore cleanup errors
        }
        transformEditorRef.current = null;
      }
    };
  }, [
    isInitialized,
    cesiumViewer,
    selectedObject.id, // Only recreate when object ID changes
    applyTRStoEntity,
    handleTransformChange,
  ]);

  // --- update gizmo position when object position changes ---
  useEffect(() => {
    if (!transformEditorRef.current || !selectedObject) return;

    const [lon = 0, lat = 0, hgt = 0] = selectedObject.position || [0, 0, 0];
    const [hd = 0, pt = 0, rl = 0] = selectedObject.rotation || [0, 0, 0];
    const pos = Cartesian3.fromDegrees(lon, lat, hgt);
    const hpr = new HeadingPitchRoll(hd, pt, rl);

    // Update existing gizmo position
    transformEditorRef.current.viewModel.position = pos;
    transformEditorRef.current.viewModel.headingPitchRoll = hpr;
  }, [selectedObject.position, selectedObject.rotation]); // Only when position/rotation changes

  // --- update gizmo mode when transform mode changes ---
  useEffect(() => {
    if (!transformEditorRef.current || !cesiumViewer) return;

    console.log("🔄 Changing gizmo mode to:", transformMode);

    // Temporarily deactivate to ensure clean mode switch
    transformEditorRef.current.viewModel.deactivate();

    // Small delay to ensure deactivation takes effect
    setTimeout(() => {
      if (!transformEditorRef.current) return;

      switch (transformMode) {
        case "translate":
          transformEditorRef.current.viewModel.setModeTranslation();
          break;
        case "rotate":
          transformEditorRef.current.viewModel.setModeRotation();
          break;
        case "scale":
          transformEditorRef.current.viewModel.setModeScale();
          break;
      }

      // Reactivate with new mode
      transformEditorRef.current.viewModel.activate();

      // Force immediate re-render to show the mode change
      cesiumViewer.scene.requestRender();

      // Also force a re-render after a short delay to ensure it takes effect
      setTimeout(() => {
        cesiumViewer.scene.requestRender();
      }, 10);
    }, 5); // Very short delay to ensure deactivation completes
  }, [transformMode, cesiumViewer]); // Include cesiumViewer in dependencies

  // --- full cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (transformEditorRef.current) {
        try {
          transformEditorRef.current.destroy();
          if ((transformEditorRef.current as any)._container) {
            document.body.removeChild(
              (transformEditorRef.current as any)._container
            );
          }
        } catch {
          // Ignore cleanup errors
        }
        transformEditorRef.current = null;
      }
    };
  }, []);

  return null;
};

export default ObjectTransformEditor;
