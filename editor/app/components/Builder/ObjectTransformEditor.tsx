"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import CesiumIonSDK from "../../utils/CesiumIonSDK";

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
  const ionSDKRef = useRef<CesiumIonSDK | null>(null);
  const transformEditorRef = useRef<{
    setModeTranslation: () => void;
    setModeRotation: () => void;
    setModeScale: () => void;
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- helpers ---
  const applyTRStoEntity = useCallback(
    (
      entity: Cesium.Entity,
      translation: Cesium.Cartesian3,
      hpr: Cesium.HeadingPitchRoll
    ) => {
      entity.position = new Cesium.ConstantPositionProperty(translation);
      const quat = Cesium.Transforms.headingPitchRollQuaternion(
        translation,
        hpr,
        Cesium.Ellipsoid.WGS84
      );
      entity.orientation = new Cesium.ConstantProperty(quat);
    },
    []
  );

  const updateStoreFromCartesian = useCallback(
    (id: string, pos: Cesium.Cartesian3, hpr: Cesium.HeadingPitchRoll) => {
      const carto = Cesium.Cartographic.fromCartesian(pos);
      useSceneStore
        .getState()
        .updateObjectProperty(id, "position", [
          Cesium.Math.toDegrees(carto.longitude),
          Cesium.Math.toDegrees(carto.latitude),
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

  // --- init Ion SDK once per viewer ---
  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;
    (async () => {
      try {
        const ionSDK = new CesiumIonSDK(cesiumViewer);
        await ionSDK.initialize();
        ionSDKRef.current = ionSDK;
        setIsInitialized(true);
        // eslint-disable-next-line no-console
        // Ion SDK initialized for object transform editor
      } catch (err) {
        // eslint-disable-next-line no-console
        // Failed to initialize Ion SDK
      }
    })();
  }, [cesiumViewer, isInitialized]);

  // --- onChange from TransformEditor ---
  const handleTransformChange = useCallback(
    (trs: {
      translation?: Cesium.Cartesian3;
      rotation?: [number, number, number];
      scale?: [number, number, number];
    }) => {
      if (!cesiumViewer) return;
      const modelEntityId = `model-${selectedObject.id}`;
      const modelEntity = cesiumViewer.entities.getById(modelEntityId) as
        | Cesium.Entity
        | undefined;
      if (!modelEntity) {
        // Model entity not found
        return;
      }

      const now = Cesium.JulianDate.now();
      const currentPos =
        (modelEntity.position &&
          (modelEntity.position as Cesium.PositionProperty).getValue?.(now)) ||
        Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO);
      const currentQuat =
        (modelEntity.orientation &&
          (modelEntity.orientation as Cesium.Property).getValue?.(now)) ||
        Cesium.Quaternion.IDENTITY;
      const currentHPR = Cesium.HeadingPitchRoll.fromQuaternion(currentQuat);

      const nextPos =
        trs?.translation instanceof Cesium.Cartesian3
          ? trs.translation
          : currentPos;
      const [
        h = currentHPR.heading,
        p = currentHPR.pitch,
        r = currentHPR.roll,
      ] = Array.isArray(trs?.rotation)
        ? trs.rotation
        : [currentHPR.heading, currentHPR.pitch, currentHPR.roll];

      const nextHPR = new Cesium.HeadingPitchRoll(h, p, r);
      applyTRStoEntity(modelEntity, nextPos, nextHPR);

      // scale (uniform)
      if (trs?.scale && modelEntity.model) {
        const [sx = 1, sy = 1, sz = 1] = trs.scale;
        const uniform = Math.max(sx, sy, sz);
        const mg = modelEntity.model as Cesium.ModelGraphics;
        // ModelGraphics expects a Property; accept number too if your typings differ
        (mg as Cesium.ModelGraphics & { scale: Cesium.Property }).scale =
          new Cesium.ConstantProperty(uniform);
      }

      updateStoreFromCartesian(selectedObject.id, nextPos, nextHPR);
      cesiumViewer.scene.requestRender();
    },
    [
      applyTRStoEntity,
      cesiumViewer,
      selectedObject.id,
      updateStoreFromCartesian,
    ]
  );

  // --- create/destroy TransformEditor when selection changes ---
  useEffect(() => {
    if (
      !isInitialized ||
      !ionSDKRef.current ||
      !selectedObject ||
      !cesiumViewer
    )
      return;

    // cleanup previous
    if (transformEditorRef.current) {
      try {
        ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
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
    const pos = Cesium.Cartesian3.fromDegrees(lon, lat, hgt);
    const hpr = new Cesium.HeadingPitchRoll(hd, pt, rl);
    applyTRStoEntity(targetEntity as Cesium.Entity, pos, hpr);

    // create editor attached to the model entity (not a separate gizmo)
    transformEditorRef.current = ionSDKRef.current.createTransformEditor(
      targetEntity,
      {
        axisLength: 20,
        gizmoPosition: "top",
        onChange: handleTransformChange,
      }
    );

    if (!transformEditorRef.current) {
      // eslint-disable-next-line no-console
      // Failed to create object transform editor
      return;
    }
    // eslint-disable-next-line no-console
    // Object transform editor created

    return () => {
      if (transformEditorRef.current && ionSDKRef.current) {
        try {
          ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
        } catch {
          // Ignore cleanup errors
        }
        transformEditorRef.current = null;
      }
    };
  }, [
    isInitialized,
    cesiumViewer,
    selectedObject.id,
    applyTRStoEntity,
    handleTransformChange,
  ]);

  // --- sync editor mode with store ---
  useEffect(() => {
    if (!transformEditorRef.current) return;
    switch (transformMode) {
      case "translate":
        transformEditorRef.current.setModeTranslation();
        break;
      case "rotate":
        transformEditorRef.current.setModeRotation();
        break;
      case "scale":
        transformEditorRef.current.setModeScale();
        break;
    }
  }, [transformMode]);

  // --- full cleanup on unmount ---
  useEffect(() => {
    return () => {
      if (transformEditorRef.current && ionSDKRef.current) {
        try {
          ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
        } catch {
          // Ignore cleanup errors
        }
        transformEditorRef.current = null;
      }
      if (ionSDKRef.current) {
        try {
          ionSDKRef.current.destroy();
        } catch {
          // Ignore cleanup errors
        }
        ionSDKRef.current = null;
      }
    };
  }, []);

  return null;
};

export default ObjectTransformEditor;
