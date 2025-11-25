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
// TransformEditor is now loaded dynamically via getIonSDKModules() to avoid SSR issues
import { useSceneStore } from "@klorad/core";

interface CesiumObjectTransformEditorProps {
  selectedObject: {
    id: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    name?: string;
  };
}

const CesiumObjectTransformEditor: React.FC<
  CesiumObjectTransformEditorProps
> = ({ selectedObject }) => {
  const { cesiumViewer, transformMode } = useSceneStore();
  const transformEditorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  // When we programmatically sync the gizmo from store, suppress one rAF cycle of change detection
  const suppressChangeRef = useRef(false);

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
    (
      id: string,
      pos: Cartesian3,
      hpr: HeadingPitchRoll,
      scale?: [number, number, number]
    ) => {
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
      if (scale) {
        useSceneStore.getState().updateObjectProperty(id, "scale", scale);
      }
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
      let scaleToStore: [number, number, number] | undefined;
      if (trs?.scale && modelEntity.model) {
        const [sx = 1, sy = 1, sz = 1] = trs.scale;
        const uniform = Math.max(sx, sy, sz);
        const mg = modelEntity.model as any;
        // ModelGraphics expects a Property; accept number too if your typings differ
        (mg as any).scale = new ConstantProperty(uniform);
        scaleToStore = [uniform, uniform, uniform];
      }

      updateStoreFromCartesian(
        selectedObject.id,
        nextPos,
        nextHPR,
        scaleToStore
      );
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

    let cancelled = false;
    let animationId: number | null = null;

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
    const posArray = Array.isArray(selectedObject.position)
      ? selectedObject.position
      : [0, 0, 0];
    const rotArray = Array.isArray(selectedObject.rotation)
      ? selectedObject.rotation
      : [0, 0, 0];
    const [lon = 0, lat = 0, hgt = 0] = posArray;
    const [hd = 0, pt = 0, rl = 0] = rotArray;
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

    // Load TransformEditor dynamically (client-only)
    // SDK is already loaded by CesiumViewer initialization
    (async () => {
      try {
        const { getIonSDKModules } = await import("@klorad/ion-sdk");
        const { TransformEditor: TransformEditorClass } =
          await getIonSDKModules();

        if (cancelled) return;

        // Create the TransformEditor with proper options
        const transformEditor: any = new (TransformEditorClass as any)({
          container: container,
          scene: cesiumViewer.scene,
          transform: transform,
          boundingSphere: boundingSphere,
          pixelSize: 100,
          maximumSizeInMeters: 50.0,
        });

        // Set up the onChange callback
        (transformEditor as any).viewModel.position = pos;
        (transformEditor as any).viewModel.headingPitchRoll = hpr;

        // Set up efficient change detection
        let lastPosition = pos.clone();
        let lastHPR = hpr.clone();
        let lastScale = new Cartesian3(1, 1, 1);

        const checkForChanges = () => {
          if (cancelled) return;

          // Skip one frame of change detection if we just updated the gizmo programmatically
          if (suppressChangeRef.current) {
            // Cancel previous RAF before scheduling new one
            if (animationId !== null) {
              cancelAnimationFrame(animationId);
            }
            animationId = requestAnimationFrame(checkForChanges);
            return;
          }
          if ((transformEditor as any).viewModel.active) {
            const newPosition = (transformEditor as any).viewModel.position;
            const newHPR = (transformEditor as any).viewModel.headingPitchRoll;
            const newScale = (transformEditor as any).viewModel.scale;

            // Check for position changes
            if (newPosition && !Cartesian3.equals(newPosition, lastPosition)) {
              handleTransformChange({
                translation: newPosition,
                rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
                scale: [newScale.x, newScale.y, newScale.z],
              });
              lastPosition = newPosition.clone();
            }

            // Check for rotation changes
            if (newHPR && !HeadingPitchRoll.equals(newHPR, lastHPR)) {
              handleTransformChange({
                translation: newPosition || lastPosition,
                rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
                scale: [newScale.x, newScale.y, newScale.z],
              });
              lastHPR = newHPR.clone();
            }

            // Check for scale changes
            if (newScale && !Cartesian3.equals(newScale, lastScale)) {
              handleTransformChange({
                translation: newPosition || lastPosition,
                rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
                scale: [newScale.x, newScale.y, newScale.z],
              });
              lastScale = newScale.clone();
            }
          }

          // Continue checking for changes - cancel previous RAF before scheduling new one
          if (!cancelled) {
            if (animationId !== null) {
              cancelAnimationFrame(animationId);
            }
            animationId = requestAnimationFrame(checkForChanges);
          }
        };

        // Start checking for changes
        checkForChanges();

        // Configure the transform editor
        (transformEditor as any).viewModel.setModeTranslation();
        (transformEditor as any).viewModel.enableNonUniformScaling = true;
        (transformEditor as any).viewModel.activate();

        // Force initial render to show the gizmo
        cesiumViewer.scene.requestRender();

        // Store container reference for cleanup
        (transformEditor as any)._container = container;

        transformEditorRef.current = transformEditor;
      } catch (error) {
        console.error(
          "[CesiumObjectTransformEditor] Failed to load TransformEditor:",
          error
        );
      }
    })();

    return () => {
      cancelled = true;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (transformEditorRef.current) {
        try {
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

    const posArray = Array.isArray(selectedObject.position)
      ? selectedObject.position
      : [0, 0, 0];
    const rotArray = Array.isArray(selectedObject.rotation)
      ? selectedObject.rotation
      : [0, 0, 0];
    const [lon = 0, lat = 0, hgt = 0] = posArray;
    const [hd = 0, pt = 0, rl = 0] = rotArray;
    const pos = Cartesian3.fromDegrees(lon, lat, hgt);
    const hpr = new HeadingPitchRoll(hd, pt, rl);

    // Update existing gizmo position (suppress echo back into polling loop)
    suppressChangeRef.current = true;
    (transformEditorRef.current as any).viewModel.position = pos;
    (transformEditorRef.current as any).viewModel.headingPitchRoll = hpr;

    // Allow polling again on next frame
    const suppressRafId = requestAnimationFrame(() => {
      suppressChangeRef.current = false;
    });

    return () => {
      cancelAnimationFrame(suppressRafId);
    };
  }, [selectedObject.position, selectedObject.rotation]); // Only when position/rotation changes

  // --- update gizmo mode when transform mode changes ---
  useEffect(() => {
    if (!transformEditorRef.current || !cesiumViewer) return;

    // Temporarily deactivate to ensure clean mode switch
    (transformEditorRef.current as any).viewModel.deactivate();

    // Small delay to ensure deactivation takes effect
    setTimeout(() => {
      if (!transformEditorRef.current) return;

      switch (transformMode) {
        case "translate":
          (transformEditorRef.current as any).viewModel.setModeTranslation();
          break;
        case "rotate":
          (transformEditorRef.current as any).viewModel.setModeRotation();
          break;
        case "scale":
          (transformEditorRef.current as any).viewModel.setModeScale();
          break;
      }

      // Reactivate with new mode
      (transformEditorRef.current as any).viewModel.activate();

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

export default CesiumObjectTransformEditor;
