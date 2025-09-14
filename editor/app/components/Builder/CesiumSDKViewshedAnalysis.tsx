"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import useSceneStore from "../../hooks/useSceneStore";
import {
  Sensors,
  VisibilityEngine,
  TransformEditor,
} from "../../utils/CesiumSDK";
import type { AnySensor } from "../../utils/CesiumSDK";

interface CesiumSDKViewshedAnalysisProps {
  position: [number, number, number]; // [longitude, latitude, height]
  rotation: [number, number, number]; // [heading, pitch, roll] in radians
  observationProperties: {
    sensorType: "cone" | "rectangle" | "dome" | "custom";
    fov: number;
    fovH?: number;
    fovV?: number;
    maxPolar?: number;
    visibilityRadius: number;
    showSensorGeometry: boolean;
    showViewshed: boolean;
    sensorColor?: string;
    viewshedColor?: string;
    analysisQuality: "low" | "medium" | "high";
    raysAzimuth?: number;
    raysElevation?: number;
    clearance?: number;
    stepCount?: number;
    enableTransformEditor: boolean;
    gizmoMode?: "translate" | "rotate" | "scale";
  };
  objectId: string;
}

const CesiumSDKViewshedAnalysis: React.FC<CesiumSDKViewshedAnalysisProps> = ({
  position,
  rotation,
  observationProperties,
  objectId,
}) => {
  const { cesiumViewer } = useSceneStore();
  const dataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // If you want to display metrics later, re-enable the state below.
  // const [analysisResults, setAnalysisResults] = useState<{
  //   visibleArea: number;
  //   totalArea: number;
  //   visibilityPercentage: number;
  // } | null>(null);

  // Refs for cleanup
  const sensorEntityRef = useRef<Cesium.Entity | null>(null);
  const viewshedEntityRef = useRef<Cesium.Entity | null>(null);
  const transformEditorRef = useRef<TransformEditor | null>(null);
  const visibilityEngineRef = useRef<VisibilityEngine | null>(null);

  // Quality settings
  const qualitySettings = {
    low: { raysAzimuth: 60, raysElevation: 4, stepCount: 32 },
    medium: { raysAzimuth: 120, raysElevation: 8, stepCount: 64 },
    high: { raysAzimuth: 240, raysElevation: 16, stepCount: 128 },
  };

  // Clean up entities
  const cleanup = useCallback(() => {
    if (cesiumViewer) {
      // remove our dedicated datasource entirely
      if (dataSourceRef.current) {
        cesiumViewer.dataSources.remove(dataSourceRef.current);
        dataSourceRef.current = null;
      }
      sensorEntityRef.current = null;
      viewshedEntityRef.current = null;
      if (transformEditorRef.current) {
        transformEditorRef.current.detach();
        transformEditorRef.current = null;
      }
    }
  }, [cesiumViewer]);

  const ensureDataSource = useCallback(async () => {
    if (!cesiumViewer) return null;
    if (!dataSourceRef.current) {
      const ds = new Cesium.CustomDataSource(`viewshed-ds-${objectId}`);
      await cesiumViewer.dataSources.add(ds);
      dataSourceRef.current = ds;
    }
    return dataSourceRef.current;
  }, [cesiumViewer, objectId]);

  // (removed) legacy convenience remover; superseded by purgeOldSensors

  const removeLegacyNearbyCones = useCallback(
    (targetPos: Cesium.Cartesian3, newId: string) => {
      if (!cesiumViewer) return;
      const now = Cesium.JulianDate.now();
      const threshold = 5.0; // meters
      const sweep = (entities: Cesium.EntityCollection) => {
        entities.values
          .filter((e) => e.id !== newId && (e as any).cylinder) // eslint-disable-line @typescript-eslint/no-explicit-any
          .forEach((e) => {
            try {
              const p = e.position?.getValue(now);
              if (!p) return;
              const d = Cesium.Cartesian3.distance(p, targetPos);
              if (d < threshold) entities.remove(e);
            } catch (_e) {
              /* noop */
            }
          });
      };
      sweep(cesiumViewer.entities);
      if (dataSourceRef.current) sweep(dataSourceRef.current.entities);
    },
    [cesiumViewer]
  );

  const purgeOldSensors = useCallback(
    (_newId: string) => {
      if (!cesiumViewer) return;
      const removeMatching = (entities: Cesium.EntityCollection) => {
        entities.values
          .filter(
            (e) =>
              (typeof e.id === "string" &&
                (e.id.startsWith("sensor-") || e.id.startsWith("cone-"))) ||
              (e as any).cylinder // eslint-disable-line @typescript-eslint/no-explicit-any
          )
          .forEach((e) => {
            entities.remove(e);
          });
      };
      removeMatching(cesiumViewer.entities);
      if (dataSourceRef.current) removeMatching(dataSourceRef.current.entities);
    },
    [cesiumViewer]
  );

  const removeExactId = useCallback(
    (id: string) => {
      if (!cesiumViewer) return;
      const root = cesiumViewer.entities.getById(id);
      if (root) cesiumViewer.entities.remove(root);
      const ds = dataSourceRef.current;
      if (ds) {
        const ent = ds.entities.getById(id);
        if (ent) ds.entities.remove(ent);
      }
    },
    [cesiumViewer]
  );

  // One-time aggressive purge to clear any legacy cones left from older components
  const didInitPurgeRef = useRef(false);
  useEffect(() => {
    if (!cesiumViewer || didInitPurgeRef.current) return;
    // eslint-disable-next-line no-console
    console.log(
      `[CesiumSDKViewshedAnalysis] Initial purge for object ${objectId}`
    );
    purgeOldSensors("_init");
    didInitPurgeRef.current = true;
  }, [cesiumViewer, purgeOldSensors]);

  // Track if we're already creating a sensor to prevent duplicates
  const isCreatingSensorRef = useRef(false);
  const isCalculatingViewshedRef = useRef(false);

  // Track current sensor position to preserve changes from transform editor
  const currentPositionRef = useRef<[number, number, number]>(position);
  const currentRotationRef = useRef<[number, number, number]>(rotation);

  // Update current position/rotation when props change (but preserve transform editor changes)
  useEffect(() => {
    currentPositionRef.current = position;
    currentRotationRef.current = rotation;
  }, [position, rotation]);

  // Create sensor visualization
  const createSensor = useCallback(async () => {
    if (!cesiumViewer) return;

    // Prevent duplicate sensor creation
    if (isCreatingSensorRef.current) {
      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Already creating sensor for object ${objectId}, skipping`
      );
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `[CesiumSDKViewshedAnalysis] Creating sensor for object ${objectId}, showSensorGeometry: ${observationProperties.showSensorGeometry}`
    );

    isCreatingSensorRef.current = true;

    try {
      const ds = await ensureDataSource();
      if (!ds) return;
      const collection = ds.entities;

      // If geometry is hidden, just remove existing sensor and editor, keep DS/viewshed
      if (!observationProperties.showSensorGeometry) {
        if (sensorEntityRef.current) {
          collection.remove(sensorEntityRef.current);
          sensorEntityRef.current = null;
        }
        if (transformEditorRef.current) {
          transformEditorRef.current.detach();
          transformEditorRef.current = null;
        }
        return;
      }

      // If gizmo is disabled but sensor should be shown, preserve current position
      if (
        !observationProperties.enableTransformEditor &&
        sensorEntityRef.current
      ) {
        // Just detach the gizmo but keep the sensor at its current position
        if (transformEditorRef.current) {
          transformEditorRef.current.detach();
          transformEditorRef.current = null;
        }
        // Don't recreate the sensor, just return
        return;
      }

      // Check if we already have a sensor for this object
      const existingSensor = collection.getById(`sensor-${objectId}`);
      if (existingSensor && sensorEntityRef.current === existingSensor) {
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] Sensor already exists for object ${objectId}, skipping creation`
        );
        return;
      }

      // Remove previous sensor entities (by id and any legacy leftovers)
      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Creating sensor for object ${objectId}`
      );
      removeExactId(`sensor-${objectId}`);
      purgeOldSensors(`sensor-${objectId}`);
      sensorEntityRef.current = null;
      if (transformEditorRef.current) {
        transformEditorRef.current.detach();
        transformEditorRef.current = null;
      }

      const [longitude, latitude, height] = currentPositionRef.current;
      let [heading, pitch, roll] = currentRotationRef.current;

      // If rotation is [0, 0, 0], set a default horizontal rotation so sensor points forward
      if (heading === 0 && pitch === 0 && roll === 0) {
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] Using default horizontal rotation (pitch = -90 degrees)`
        );
        heading = 0;
        pitch = -Math.PI / 2; // -90 degrees to point horizontally forward
        roll = 0;
      }
      const {
        sensorType,
        fov,
        fovH,
        fovV,
        maxPolar,
        visibilityRadius,
        sensorColor,
      } = observationProperties;

      // Parse color
      const color = sensorColor
        ? Cesium.Color.fromCssColorString(sensorColor)
        : Cesium.Color.LIME;

      let sensor: { entity: Cesium.Entity } | null = null;

      switch (sensorType) {
        case "cone":
          sensor = Sensors.createCone(cesiumViewer, {
            id: `sensor-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fov: Cesium.Math.toRadians(fov),
            range: visibilityRadius,
            color: color.withAlpha(0.3),
            collection,
          });
          break;

        case "rectangle":
          sensor = Sensors.createRectangle(cesiumViewer, {
            id: `sensor-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fovH: Cesium.Math.toRadians(fovH || fov),
            fovV: Cesium.Math.toRadians(fovV || fov * 0.6),
            range: visibilityRadius,
            color: color.withAlpha(0.3),
            collection,
          });
          break;

        case "dome":
          sensor = Sensors.createDome(cesiumViewer, {
            id: `sensor-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            maxPolar: Cesium.Math.toRadians(maxPolar || fov * 0.5),
            range: visibilityRadius,
            color: color.withAlpha(0.3),
            collection,
          });
          break;

        default:
          // Fallback to cone
          sensor = Sensors.createCone(cesiumViewer, {
            id: `sensor-${objectId}`,
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading: heading,
            pitch: pitch,
            roll: roll,
            fov: Cesium.Math.toRadians(fov),
            range: visibilityRadius,
            color: color.withAlpha(0.3),
            collection,
          });
      }

      if (sensor) {
        // Sweep any legacy cones near this position (old IDs like "cone-*")
        removeLegacyNearbyCones(
          sensor.entity.position!.getValue(Cesium.JulianDate.now())!,
          `sensor-${objectId}`
        );
        sensorEntityRef.current = sensor.entity;

        // Create transform editor if enabled
        if (observationProperties.enableTransformEditor) {
          if (!transformEditorRef.current) {
            transformEditorRef.current = new TransformEditor(cesiumViewer, {
              gizmoPosition: "top", // Position gizmo at the top of the cone
              axisLength: 20.0, // Make gizmo much larger for easier interaction
              onChange: (trs) => {
                // Update current position/rotation when transform editor changes
                if (trs.position) {
                  // Since gizmo is at the top of the cone, we need to convert back to cone center
                  let actualPosition = trs.position;

                  // If this is a cone sensor, convert from apex position to center position
                  if (sensorEntityRef.current?.cylinder) {
                    const cylinder = sensorEntityRef.current.cylinder;
                    const time = Cesium.JulianDate.now();
                    const length = cylinder.length?.getValue(time) || 0;
                    const orientation =
                      sensorEntityRef.current.orientation?.getValue(time);

                    if (orientation) {
                      // Calculate the forward direction (cone's +Z axis)
                      const forward = Cesium.Matrix3.multiplyByVector(
                        Cesium.Matrix3.fromQuaternion(orientation),
                        Cesium.Cartesian3.UNIT_Z,
                        new Cesium.Cartesian3()
                      );

                      // Move from apex to center (subtract half the length)
                      actualPosition = Cesium.Cartesian3.subtract(
                        trs.position,
                        Cesium.Cartesian3.multiplyByScalar(
                          forward,
                          length * 0.5,
                          new Cesium.Cartesian3()
                        ),
                        new Cesium.Cartesian3()
                      );
                    }
                  }

                  // Update the entity's position in Cesium
                  if (sensorEntityRef.current) {
                    sensorEntityRef.current.position =
                      new Cesium.ConstantPositionProperty(actualPosition);
                    // Force re-render to show the updated position
                    cesiumViewer.scene.requestRender();
                    // Also force a re-render after a short delay to ensure it takes effect
                    setTimeout(() => {
                      cesiumViewer.scene.requestRender();
                    }, 10);
                  }

                  const cartographic =
                    Cesium.Cartographic.fromCartesian(actualPosition);
                  const longitude = Cesium.Math.toDegrees(
                    cartographic.longitude
                  );
                  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
                  const height = cartographic.height;
                  currentPositionRef.current = [longitude, latitude, height];

                  // eslint-disable-next-line no-console
                  console.log(
                    `[CesiumSDKViewshedAnalysis] 📍 GIZMO MOVED - New position: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}, ${height.toFixed(2)}]`
                  );
                }

                if (trs.rotation) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `[CesiumSDKViewshedAnalysis] Gizmo rotation update received: ${trs.rotation}`
                  );

                  // Update the entity's orientation in Cesium
                  if (sensorEntityRef.current) {
                    sensorEntityRef.current.orientation =
                      new Cesium.ConstantProperty(trs.rotation);
                    // Force re-render to show the updated orientation
                    cesiumViewer.scene.requestRender();
                    // Also force a re-render after a short delay to ensure it takes effect
                    setTimeout(() => {
                      cesiumViewer.scene.requestRender();
                    }, 10);

                    // eslint-disable-next-line no-console
                    console.log(
                      `[CesiumSDKViewshedAnalysis] Updated sensor entity orientation`
                    );
                  } else {
                    // eslint-disable-next-line no-console
                    console.log(
                      `[CesiumSDKViewshedAnalysis] No sensor entity to update orientation`
                    );
                  }

                  const hpr = Cesium.HeadingPitchRoll.fromQuaternion(
                    trs.rotation
                  );
                  currentRotationRef.current = [
                    hpr.heading,
                    hpr.pitch,
                    hpr.roll,
                  ];

                  // eslint-disable-next-line no-console
                  console.log(
                    `[CesiumSDKViewshedAnalysis] 🔄 GIZMO ROTATED - New rotation: [${hpr.heading.toFixed(3)}, ${hpr.pitch.toFixed(3)}, ${hpr.roll.toFixed(3)}]`
                  );

                  // eslint-disable-next-line no-console
                  console.log(
                    `[CesiumSDKViewshedAnalysis] 🔄 GIZMO ROTATED - New rotation in degrees: heading=${Cesium.Math.toDegrees(hpr.heading).toFixed(1)}°, pitch=${Cesium.Math.toDegrees(hpr.pitch).toFixed(1)}°, roll=${Cesium.Math.toDegrees(hpr.roll).toFixed(1)}°`
                  );
                }
              },
              collection,
            });
          }
          transformEditorRef.current.attachToEntity(sensor.entity);

          // eslint-disable-next-line no-console
          console.log(
            `[CesiumSDKViewshedAnalysis] Transform editor attached to sensor entity`
          );

          // Debug: Check the current gizmo mode
          // eslint-disable-next-line no-console
          console.log(
            `[CesiumSDKViewshedAnalysis] Gizmo attached to sensor entity`
          );

          // Debug: Check the sensor entity's initial orientation
          const time = Cesium.JulianDate.now();
          const initialOrientation = sensor.entity.orientation?.getValue(time);
          if (initialOrientation) {
            const initialHPR =
              Cesium.HeadingPitchRoll.fromQuaternion(initialOrientation);
            // eslint-disable-next-line no-console
            console.log(
              `[CesiumSDKViewshedAnalysis] Sensor entity initial orientation: [${initialHPR.heading}, ${initialHPR.pitch}, ${initialHPR.roll}]`
            );
          } else {
            // eslint-disable-next-line no-console
            console.log(
              `[CesiumSDKViewshedAnalysis] Sensor entity has no initial orientation`
            );
          }
        }
      }
    } catch (err) {
      console.error("Error creating sensor:", err);
      setError("Failed to create sensor visualization");
    } finally {
      isCreatingSensorRef.current = false;
    }
  }, [
    cesiumViewer,
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.maxPolar,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    objectId,
    cleanup,
  ]);

  // Perform viewshed analysis
  const performViewshedAnalysis = useCallback(async () => {
    if (!cesiumViewer || !observationProperties.showViewshed) {
      // only remove viewshed polygon
      if (viewshedEntityRef.current && dataSourceRef.current) {
        dataSourceRef.current.entities.remove(viewshedEntityRef.current);
        viewshedEntityRef.current = null;
      }
      return;
    }

    // Prevent duplicate viewshed calculations
    if (isCalculatingViewshedRef.current) {
      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Already calculating viewshed for object ${objectId}, skipping`
      );
      return;
    }

    isCalculatingViewshedRef.current = true;
    setIsCalculating(true);
    setError(null);
    // no metrics state maintained currently

    try {
      const [longitude, latitude, height] = currentPositionRef.current;

      // Get rotation from the actual sensor entity if available, otherwise use ref
      let heading, pitch, roll;
      if (sensorEntityRef.current) {
        const time = Cesium.JulianDate.now();
        const actualOrientation =
          sensorEntityRef.current.orientation?.getValue(time);
        if (actualOrientation) {
          const actualHPR =
            Cesium.HeadingPitchRoll.fromQuaternion(actualOrientation);
          heading = actualHPR.heading;
          pitch = actualHPR.pitch;
          roll = actualHPR.roll;
        } else {
          [heading, pitch, roll] = currentRotationRef.current;
        }
      } else {
        [heading, pitch, roll] = currentRotationRef.current;
      }

      // If rotation is [0, 0, 0], set a default horizontal rotation so sensor points forward
      if (heading === 0 && pitch === 0 && roll === 0) {
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] Using default horizontal rotation for viewshed (pitch = -90 degrees)`
        );
        heading = 0;
        pitch = -Math.PI / 2; // -90 degrees to point horizontally forward
        roll = 0;
      }

      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Viewshed analysis using position: [${longitude}, ${latitude}, ${height}], rotation: [${heading}, ${pitch}, ${roll}]`
      );

      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Rotation in degrees: heading=${Cesium.Math.toDegrees(heading)}, pitch=${Cesium.Math.toDegrees(pitch)}, roll=${Cesium.Math.toDegrees(roll)}`
      );

      // Debug: Check if we have a sensor entity and get its actual rotation
      if (sensorEntityRef.current) {
        const time = Cesium.JulianDate.now();
        const actualOrientation =
          sensorEntityRef.current.orientation?.getValue(time);
        if (actualOrientation) {
          const actualHPR =
            Cesium.HeadingPitchRoll.fromQuaternion(actualOrientation);
          // eslint-disable-next-line no-console
          console.log(
            `[CesiumSDKViewshedAnalysis] Sensor entity actual rotation: [${actualHPR.heading}, ${actualHPR.pitch}, ${actualHPR.roll}]`
          );
          // eslint-disable-next-line no-console
          console.log(
            `[CesiumSDKViewshedAnalysis] Sensor entity rotation in degrees: heading=${Cesium.Math.toDegrees(actualHPR.heading)}, pitch=${Cesium.Math.toDegrees(actualHPR.pitch)}, roll=${Cesium.Math.toDegrees(actualHPR.roll)}`
          );
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[CesiumSDKViewshedAnalysis] Sensor entity has no orientation property`
          );
        }
      } else {
        // eslint-disable-next-line no-console
        console.log(`[CesiumSDKViewshedAnalysis] No sensor entity found`);
      }
      const {
        sensorType,
        fov,
        fovH,
        fovV,
        maxPolar,
        visibilityRadius,
        analysisQuality,
        raysAzimuth,
        raysElevation,
        clearance,
        stepCount,
        viewshedColor,
      } = observationProperties;

      // Initialize visibility engine
      if (!visibilityEngineRef.current) {
        visibilityEngineRef.current = new VisibilityEngine(cesiumViewer);
      }

      // Get quality settings
      const quality = qualitySettings[analysisQuality];

      // Create sensor configuration
      let sensorConfig: AnySensor;
      switch (sensorType) {
        case "cone":
          sensorConfig = {
            type: "cone",
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading,
            pitch,
            roll,
            range: visibilityRadius,
            fov: Cesium.Math.toRadians(fov),
          };
          break;
        case "rectangle":
          sensorConfig = {
            type: "rectangle",
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading,
            pitch,
            roll,
            range: visibilityRadius,
            fovH: Cesium.Math.toRadians(fovH || fov),
            fovV: Cesium.Math.toRadians(fovV || fov * 0.6),
          };
          break;
        case "dome":
          sensorConfig = {
            type: "dome",
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading,
            pitch,
            roll,
            range: visibilityRadius,
            maxPolar: Cesium.Math.toRadians(maxPolar || fov * 0.5),
          };
          break;
        default:
          sensorConfig = {
            type: "cone",
            position: Cesium.Cartesian3.fromDegrees(
              longitude,
              latitude,
              height
            ),
            heading,
            pitch,
            roll,
            range: visibilityRadius,
            fov: Cesium.Math.toRadians(fov),
          };
      }

      // Parse viewshed color
      const viewshedColorObj = viewshedColor
        ? Cesium.Color.fromCssColorString(viewshedColor)
        : Cesium.Color.DODGERBLUE;

      // Viewshed options
      const ds = await ensureDataSource();
      if (!ds) return;
      const viewshedOptions = {
        raysAzimuth: raysAzimuth || quality.raysAzimuth,
        raysElevation: raysElevation || quality.raysElevation,
        clearance: clearance || 2.0,
        stepCount: stepCount || quality.stepCount,
        material: viewshedColorObj.withAlpha(0.4),
        outline: true,
        outlineColor: Cesium.Color.YELLOW,
        clampToGround: true,
        collection: ds.entities,
      };

      // Compute viewshed
      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] Computing viewshed with sensor config:`,
        sensorConfig
      );

      // Debug: Log the sensor position and what it should be looking at
      const sensorPos = sensorConfig.position;
      const sensorCartographic = Cesium.Cartographic.fromCartesian(sensorPos);
      const sensorLon = Cesium.Math.toDegrees(sensorCartographic.longitude);
      const sensorLat = Cesium.Math.toDegrees(sensorCartographic.latitude);
      const sensorHeight = sensorCartographic.height;

      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] 🔍 DEBUG - Sensor at: [${sensorLon.toFixed(6)}, ${sensorLat.toFixed(6)}, ${sensorHeight.toFixed(2)}m]`
      );
      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] 🔍 DEBUG - Looking: heading=${Cesium.Math.toDegrees(sensorConfig.heading).toFixed(1)}°, pitch=${Cesium.Math.toDegrees(sensorConfig.pitch).toFixed(1)}°, range=${sensorConfig.range}m`
      );

      // Calculate where the sensor is looking
      const forward = Cesium.Cartesian3.fromDegrees(
        sensorLon +
          Math.cos(sensorConfig.heading) * Math.cos(sensorConfig.pitch) * 0.01, // Small offset to show direction
        sensorLat +
          Math.sin(sensorConfig.heading) * Math.cos(sensorConfig.pitch) * 0.01,
        sensorHeight + Math.sin(sensorConfig.pitch) * 100 // 100m forward
      );

      // eslint-disable-next-line no-console
      console.log(
        `[CesiumSDKViewshedAnalysis] 🔍 DEBUG - Sensor should be looking towards: [${Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(forward).longitude).toFixed(6)}, ${Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(forward).latitude).toFixed(6)}]`
      );

      const result = await visibilityEngineRef.current.computeViewshed(
        sensorConfig,
        viewshedOptions
      );

      // eslint-disable-next-line no-console
      console.log(`[CesiumSDKViewshedAnalysis] Viewshed result:`, result);

      if (result.polygonEntity) {
        viewshedEntityRef.current = result.polygonEntity;

        // eslint-disable-next-line no-console
        console.log(
          `Viewshed analysis complete: ${result.boundary.length} boundary points`
        );
      } else {
        console.warn("❌ No visible area found in viewshed analysis");
        // eslint-disable-next-line no-console
        console.log("💡 TROUBLESHOOTING SUGGESTIONS:");
        // eslint-disable-next-line no-console
        console.log("   1. Try increasing the range (currently 500m)");
        // eslint-disable-next-line no-console
        console.log(
          "   2. Try lowering the sensor height (currently " +
            height.toFixed(1) +
            "m)"
        );
        // eslint-disable-next-line no-console
        console.log(
          "   3. Try changing the pitch angle (currently " +
            Cesium.Math.toDegrees(sensorConfig.pitch).toFixed(1) +
            "°)"
        );
        // eslint-disable-next-line no-console
        console.log(
          "   4. Make sure there's terrain/objects within range to see"
        );
        setError("No visible area found - terrain may be blocking all views");
      }
    } catch (err) {
      console.error("Error performing viewshed analysis:", err);
      setError("Failed to perform viewshed analysis");
    } finally {
      setIsCalculating(false);
      isCalculatingViewshedRef.current = false;
    }
  }, [
    cesiumViewer,
    observationProperties.showViewshed,
    observationProperties.analysisQuality,
    observationProperties.raysAzimuth,
    observationProperties.raysElevation,
    observationProperties.clearance,
    observationProperties.stepCount,
    observationProperties.viewshedColor,
    cleanup,
  ]);

  // metrics helpers removed for now

  // Effect for sensor visualization
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      `[CesiumSDKViewshedAnalysis] Sensor effect triggered for object ${objectId}, showSensorGeometry: ${observationProperties.showSensorGeometry}`
    );
    createSensor();
    return cleanup;
  }, [
    observationProperties.showSensorGeometry,
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.maxPolar,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    // Removed enableTransformEditor from dependencies to prevent recreation
    objectId,
    createSensor,
  ]);

  // Effect for viewshed analysis
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      `[CesiumSDKViewshedAnalysis] Viewshed effect triggered for object ${objectId}, showViewshed: ${observationProperties.showViewshed}`
    );
    performViewshedAnalysis();
    return cleanup;
  }, [
    observationProperties.showViewshed,
    observationProperties.analysisQuality,
    observationProperties.raysAzimuth,
    observationProperties.raysElevation,
    observationProperties.clearance,
    observationProperties.stepCount,
    observationProperties.viewshedColor,
    objectId,
    performViewshedAnalysis,
  ]);

  // Update gizmo mode when it changes (without recreating sensor)
  useEffect(() => {
    if (transformEditorRef.current && observationProperties.gizmoMode) {
      transformEditorRef.current.setMode(observationProperties.gizmoMode);
    }
  }, [observationProperties.gizmoMode]);

  // Handle sensor property changes that require recreation (only when sensor doesn't exist)
  useEffect(() => {
    if (!sensorEntityRef.current) {
      createSensor();
    }
  }, [
    observationProperties.sensorType,
    observationProperties.fov,
    observationProperties.fovH,
    observationProperties.fovV,
    observationProperties.maxPolar,
    observationProperties.visibilityRadius,
    observationProperties.sensorColor,
    createSensor,
  ]);

  // Handle gizmo enable/disable without recreating sensor
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      `[CesiumSDKViewshedAnalysis] Gizmo effect triggered for object ${objectId}, enableTransformEditor: ${observationProperties.enableTransformEditor}`
    );
    if (!cesiumViewer || !sensorEntityRef.current) return;

    if (observationProperties.enableTransformEditor) {
      // Log current cone state when enabling gizmo
      const time = Cesium.JulianDate.now();
      const position = sensorEntityRef.current.position?.getValue(time);
      const orientation = sensorEntityRef.current.orientation?.getValue(time);

      if (position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 ENABLING GIZMO - Cone position: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}, ${height.toFixed(2)}]`
        );
      }

      if (orientation) {
        const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 ENABLING GIZMO - Cone rotation: [${hpr.heading.toFixed(3)}, ${hpr.pitch.toFixed(3)}, ${hpr.roll.toFixed(3)}]`
        );
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 ENABLING GIZMO - Cone rotation in degrees: heading=${Cesium.Math.toDegrees(hpr.heading).toFixed(1)}°, pitch=${Cesium.Math.toDegrees(hpr.pitch).toFixed(1)}°, roll=${Cesium.Math.toDegrees(hpr.roll).toFixed(1)}°`
        );
      }

      // Create gizmo if it doesn't exist
      if (!transformEditorRef.current) {
        const ds = dataSourceRef.current;
        if (ds) {
          transformEditorRef.current = new TransformEditor(cesiumViewer, {
            gizmoPosition: "top",
            onChange: (trs) => {
              // Update current position/rotation when transform editor changes
              if (trs.position) {
                // Since gizmo is at the top of the cone, we need to convert back to cone center
                let actualPosition = trs.position;

                // If this is a cone sensor, convert from apex position to center position
                if (sensorEntityRef.current?.cylinder) {
                  const cylinder = sensorEntityRef.current.cylinder;
                  const time = Cesium.JulianDate.now();
                  const length = cylinder.length?.getValue(time) || 0;
                  const orientation =
                    sensorEntityRef.current.orientation?.getValue(time);

                  if (orientation) {
                    // Calculate the forward direction (cone's +Z axis)
                    const forward = Cesium.Matrix3.multiplyByVector(
                      Cesium.Matrix3.fromQuaternion(orientation),
                      Cesium.Cartesian3.UNIT_Z,
                      new Cesium.Cartesian3()
                    );

                    // Move from apex to center (subtract half the length)
                    actualPosition = Cesium.Cartesian3.subtract(
                      trs.position,
                      Cesium.Cartesian3.multiplyByScalar(
                        forward,
                        length * 0.5,
                        new Cesium.Cartesian3()
                      ),
                      new Cesium.Cartesian3()
                    );
                  }
                }

                const cartographic =
                  Cesium.Cartographic.fromCartesian(actualPosition);
                const longitude = Cesium.Math.toDegrees(cartographic.longitude);
                const latitude = Cesium.Math.toDegrees(cartographic.latitude);
                const height = cartographic.height;
                currentPositionRef.current = [longitude, latitude, height];
              }

              if (trs.rotation) {
                const hpr = Cesium.HeadingPitchRoll.fromQuaternion(
                  trs.rotation
                );
                currentRotationRef.current = [hpr.heading, hpr.pitch, hpr.roll];

                // eslint-disable-next-line no-console
                console.log(
                  `[CesiumSDKViewshedAnalysis] Updated rotation: [${hpr.heading}, ${hpr.pitch}, ${hpr.roll}]`
                );
              }
            },
            collection: ds.entities,
          });
        }
      }
      transformEditorRef.current.attachToEntity(sensorEntityRef.current);
    } else {
      // Log current cone state when disabling gizmo
      const time = Cesium.JulianDate.now();
      const position = sensorEntityRef.current.position?.getValue(time);
      const orientation = sensorEntityRef.current.orientation?.getValue(time);

      if (position) {
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 DISABLING GIZMO - Cone position: [${longitude.toFixed(6)}, ${latitude.toFixed(6)}, ${height.toFixed(2)}]`
        );
      }

      if (orientation) {
        const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 DISABLING GIZMO - Cone rotation: [${hpr.heading.toFixed(3)}, ${hpr.pitch.toFixed(3)}, ${hpr.roll.toFixed(3)}]`
        );
        // eslint-disable-next-line no-console
        console.log(
          `[CesiumSDKViewshedAnalysis] 🔧 DISABLING GIZMO - Cone rotation in degrees: heading=${Cesium.Math.toDegrees(hpr.heading).toFixed(1)}°, pitch=${Cesium.Math.toDegrees(hpr.pitch).toFixed(1)}°, roll=${Cesium.Math.toDegrees(hpr.roll).toFixed(1)}°`
        );
      }

      // Just detach gizmo, keep sensor
      if (transformEditorRef.current) {
        transformEditorRef.current.detach();
        transformEditorRef.current = null;
      }
    }
  }, [cesiumViewer, observationProperties.enableTransformEditor]);

  // Disable Cesium controls when gizmo is enabled
  useEffect(() => {
    if (!cesiumViewer) return;

    if (observationProperties.enableTransformEditor) {
      // Disable Cesium controls when gizmo is active
      cesiumViewer.scene.screenSpaceCameraController.enableRotate = false;
      cesiumViewer.scene.screenSpaceCameraController.enableTranslate = false;
      cesiumViewer.scene.screenSpaceCameraController.enableZoom = false;
      cesiumViewer.scene.screenSpaceCameraController.enableTilt = false;
      cesiumViewer.scene.screenSpaceCameraController.enableLook = false;
    } else {
      // Re-enable Cesium controls when gizmo is disabled
      cesiumViewer.scene.screenSpaceCameraController.enableRotate = true;
      cesiumViewer.scene.screenSpaceCameraController.enableTranslate = true;
      cesiumViewer.scene.screenSpaceCameraController.enableZoom = true;
      cesiumViewer.scene.screenSpaceCameraController.enableTilt = true;
      cesiumViewer.scene.screenSpaceCameraController.enableLook = true;
    }
  }, [cesiumViewer, observationProperties.enableTransformEditor]);

  // Ensure GLB models are always visible (fix rendering conflicts)
  useEffect(() => {
    if (!cesiumViewer) return;

    // Force GLB models to be visible by adjusting scene settings
    const scene = cesiumViewer.scene;

    // Ensure proper depth testing for models
    scene.globe.depthTestAgainstTerrain = false;

    // Force a render to ensure models are visible
    scene.requestRender();

    // eslint-disable-next-line no-console
    console.log(
      "[CesiumSDKViewshedAnalysis] Applied GLB model visibility fixes"
    );
  }, [cesiumViewer, observationProperties.showViewshed]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Show loading state
  if (isCalculating) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        Calculating viewshed analysis...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(255, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "14px",
          zIndex: 1000,
        }}
      >
        {error}
      </div>
    );
  }

  return null; // This component doesn't render anything visible
};

export default CesiumSDKViewshedAnalysis;
