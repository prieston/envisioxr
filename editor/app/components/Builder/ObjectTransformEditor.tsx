"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import CesiumIonSDK from "../../utils/CesiumIonSDK";

interface ObjectTransformEditorProps {
  selectedObject: any;
}

const ObjectTransformEditor: React.FC<ObjectTransformEditorProps> = ({
  selectedObject,
}) => {
  const { cesiumViewer } = useSceneStore();
  const ionSDKRef = useRef<CesiumIonSDK | null>(null);
  const transformEditorRef = useRef<any>(null);
  const gizmoEntityRef = useRef<Cesium.Entity | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Ion SDK
  useEffect(() => {
    if (!cesiumViewer || isInitialized) return;

    const initializeIonSDK = async () => {
      try {
        const ionSDK = new CesiumIonSDK(cesiumViewer);
        await ionSDK.initialize();
        ionSDKRef.current = ionSDK;
        setIsInitialized(true);
        console.log("✅ Ion SDK initialized for object transform editor");
      } catch (err) {
        console.error("❌ Failed to initialize Ion SDK:", err);
      }
    };

    initializeIonSDK();
  }, [cesiumViewer, isInitialized]);

  // Create transform editor when object is selected
  useEffect(() => {
    if (
      !isInitialized ||
      !ionSDKRef.current ||
      !selectedObject ||
      !cesiumViewer
    ) {
      return;
    }

    // Clean up existing transform editor and gizmo
    if (transformEditorRef.current) {
      transformEditorRef.current.destroy();
      transformEditorRef.current = null;
    }
    if (gizmoEntityRef.current) {
      cesiumViewer.entities.remove(gizmoEntityRef.current);
      gizmoEntityRef.current = null;
    }

    console.log(
      "🔧 Creating transform editor for selected object:",
      selectedObject.name
    );

    // Test if Ion SDK TransformEditor is available
    if (!(window as any).IonSdkMeasurements) {
      console.error("❌ IonSdkMeasurements not available on window");
      return;
    }

    console.log(
      "🔍 IonSdkMeasurements available:",
      (window as any).IonSdkMeasurements
    );
    console.log(
      "🔍 TransformEditor constructor:",
      (window as any).IonSdkMeasurements.TransformEditor
    );

    // Add global functions for testing transform modes
    (window as any).setTransformMode = (mode: string) => {
      if (transformEditorRef.current) {
        switch (mode) {
          case "translate":
            transformEditorRef.current.setModeTranslation();
            break;
          case "rotate":
            transformEditorRef.current.setModeRotation();
            break;
          case "scale":
            transformEditorRef.current.setModeScale();
            break;
          default:
            console.log("Available modes: translate, rotate, scale");
        }
      } else {
        console.log("No transform editor available");
      }
    };

    // Get object position and rotation
    const [longitude, latitude, height] = selectedObject.position || [0, 0, 0];
    const [heading, pitch, roll] = selectedObject.rotation || [0, 0, 0];

    // Convert to Cesium coordinates
    const objectPosition = Cesium.Cartesian3.fromDegrees(
      longitude,
      latitude,
      height
    );
    const objectOrientation = Cesium.Transforms.headingPitchRollQuaternion(
      objectPosition,
      new Cesium.HeadingPitchRoll(heading, pitch, roll),
      Cesium.Ellipsoid.WGS84
    );

    // Create a gizmo entity at the object position
    gizmoEntityRef.current = cesiumViewer.entities.add({
      position: objectPosition,
      orientation: objectOrientation,
      point: {
        pixelSize: 12,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
      },
      label: {
        text: `Transform ${selectedObject.name || "Object"}`,
        font: "12pt sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -40),
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
      },
      id: `transform-gizmo-${selectedObject.id}`,
    });

    // Create transform editor
    transformEditorRef.current = ionSDKRef.current.createTransformEditor(
      gizmoEntityRef.current,
      {
        axisLength: 20.0,
        gizmoPosition: "top",
        onChange: (trs: any) => {
          console.log("🔧 Object transform editor change:", trs);

          // Update the object position/rotation based on transform changes
          if (trs && trs.translation) {
            console.log("📍 Position updated:", trs.translation);

            // Convert to lat/lon/height
            const cartographic = Cesium.Cartographic.fromCartesian(
              trs.translation
            );
            const newLongitude = Cesium.Math.toDegrees(cartographic.longitude);
            const newLatitude = Cesium.Math.toDegrees(cartographic.latitude);
            const newHeight = cartographic.height;

            console.log(
              `📍 New position: [${newLongitude.toFixed(6)}, ${newLatitude.toFixed(6)}, ${newHeight.toFixed(2)}]`
            );

            // Update the object in the store
            useSceneStore
              .getState()
              .updateObjectProperty(selectedObject.id, "position", [
                newLongitude,
                newLatitude,
                newHeight,
              ]);
          }

          if (trs && trs.rotation) {
            console.log("🔄 Rotation updated:", trs.rotation);

            // Convert quaternion to heading/pitch/roll
            const newOrientation = new Cesium.Quaternion(
              trs.rotation[0],
              trs.rotation[1],
              trs.rotation[2],
              trs.rotation[3]
            );

            // Convert to heading/pitch/roll
            const hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(
              Cesium.Transforms.eastNorthUpToFixedFrame(objectPosition),
              newOrientation
            );

            const newHeading = Cesium.Math.toDegrees(hpr.heading);
            const newPitch = Cesium.Math.toDegrees(hpr.pitch);
            const newRoll = Cesium.Math.toDegrees(hpr.roll);

            console.log(
              `🔄 New rotation: [${newHeading.toFixed(1)}°, ${newPitch.toFixed(1)}°, ${newRoll.toFixed(1)}°]`
            );

            // Update the object in the store
            useSceneStore
              .getState()
              .updateObjectProperty(selectedObject.id, "rotation", [
                hpr.heading,
                hpr.pitch,
                hpr.roll,
              ]);
          }
        },
      }
    );

    if (transformEditorRef.current) {
      console.log("✅ Object transform editor created successfully");
    } else {
      console.warn("⚠️ Failed to create object transform editor");
    }

    // Cleanup function
    return () => {
      if (transformEditorRef.current && ionSDKRef.current) {
        ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
        transformEditorRef.current = null;
      }
      if (gizmoEntityRef.current) {
        cesiumViewer.entities.remove(gizmoEntityRef.current);
        gizmoEntityRef.current = null;
      }
    };
  }, [isInitialized, selectedObject, cesiumViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transformEditorRef.current && ionSDKRef.current) {
        ionSDKRef.current.destroyTransformEditor(transformEditorRef.current);
      }
      if (gizmoEntityRef.current && cesiumViewer) {
        cesiumViewer.entities.remove(gizmoEntityRef.current);
      }
      if (ionSDKRef.current) {
        ionSDKRef.current.destroy();
      }
    };
  }, [cesiumViewer]);

  // Don't render anything visible - this component only manages the transform editor
  return null;
};

export default ObjectTransformEditor;
