/*
  Cesium Ion SDK Integration Module
  ================================

  This module provides full Ion SDK integration with professional sensor visualization,
  advanced measurement tools, and viewshed analysis using the actual Cesium Ion SDK.

  Usage:
  import { CesiumIonSDK } from './CesiumIonSDK';

  const ionSDK = new CesiumIonSDK(viewer);
  await ionSDK.initialize();

  // Use professional sensors
  const sensor = ionSDK.createRectangularSensor({...});

  // Use advanced measurements
  ionSDK.enableMeasurements();
*/

import * as Cesium from "cesium";

// Type definitions for Ion SDK
interface IonSDKWindow extends Window {
  IonSdkSensors?: any;
  IonSdkMeasurements?: any;
  IonSdkGeometry?: any;
}

// Type definitions for Ion SDK sensors
interface IonSensorOptions {
  position: Cesium.Cartesian3;
  orientation?: Cesium.Quaternion;
  radius: number;
  xHalfAngle?: number;
  yHalfAngle?: number;
  fov?: number;
  color?: Cesium.Color;
  showLateralSurfaces?: boolean;
  showDomeSurfaces?: boolean;
  showViewshed?: boolean;
  environmentConstraint?: boolean;
  include3DModels?: boolean; // New option to include 3D models in viewshed
}

interface ViewshedOptions {
  raysAzimuth?: number;
  raysElevation?: number;
  clearance?: number;
  stepCount?: number;
  material?: Cesium.Color;
  outline?: boolean;
  outlineColor?: Cesium.Color;
  clampToGround?: boolean;
}

export class CesiumIonSDK {
  private viewer: Cesium.Viewer;
  private isInitialized = false;
  private measurementEnabled = false;
  private ionSDKLoaded = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("🚀 Initializing Cesium Ion SDK...");

      // Try to load Ion SDK from local assets
      await this.loadIonSDKFromLocal();

      this.isInitialized = true;
      console.log("✅ Cesium Ion SDK initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Cesium Ion SDK:", error);
      throw error;
    }
  }

  private async loadIonSDKFromLocal(): Promise<void> {
    return new Promise((resolve, _reject) => {
      // Check if Ion SDK is already loaded
      if (
        (window as IonSDKWindow).IonSdkSensors &&
        (window as IonSDKWindow).IonSdkMeasurements &&
        (window as IonSDKWindow).IonSdkGeometry
      ) {
        this.ionSDKLoaded = true;
        console.log("✅ Ion SDK already loaded, skipping initialization");
        resolve();
        return;
      }

      // Ensure Cesium is available globally before loading Ion SDK
      if (typeof (window as any).Cesium === "undefined") {
        console.warn(
          "⚠️ Cesium not available globally, waiting for it to load..."
        );
        // Wait for Cesium to be available with timeout
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        const checkCesium = () => {
          attempts++;
          if (typeof (window as any).Cesium !== "undefined") {
            console.log("✅ Cesium found globally, loading Ion SDK...");
            this.loadIonSDKScripts(resolve, _reject);
          } else if (attempts >= maxAttempts) {
            console.error("❌ Timeout waiting for Cesium to load globally");
            _reject(new Error("Cesium not available globally after timeout"));
          } else {
            setTimeout(checkCesium, 100);
          }
        };
        checkCesium();
        return;
      }

      this.loadIonSDKScripts(resolve, _reject);
    });
  }

  private loadIonSDKScripts(
    resolve: () => void,
    reject: (reason?: any) => void
  ): void {
    // Load Ion SDK scripts from local files
    const scripts = [
      "/cesium-ion-sdk/ion-sdk-sensors/Build/IonSdkSensors/IonSdkSensors.js",
      "/cesium-ion-sdk/ion-sdk-measurements/Build/IonSdkMeasurements/IonSdkMeasurements.js",
      "/cesium-ion-sdk/ion-sdk-geometry/Build/IonSdkGeometry/IonSdkGeometry.js",
    ];

    let loadedCount = 0;
    let errorCount = 0;
    const totalScripts = scripts.length;

    scripts.forEach((src, _index) => {
      const script = document.createElement("script");
      script.src = src;

      // Add error handling for entity redefinition errors
      script.onload = () => {
        loadedCount++;
        console.log(`✅ Loaded Ion SDK script: ${src}`);

        // Check if all required SDK modules are available
        const hasSensors = !!(window as IonSDKWindow).IonSdkSensors;
        const hasMeasurements = !!(window as IonSDKWindow).IonSdkMeasurements;
        const hasGeometry = !!(window as IonSDKWindow).IonSdkGeometry;

        if (loadedCount + errorCount === totalScripts) {
          if (
            errorCount === 0 &&
            hasSensors &&
            hasMeasurements &&
            hasGeometry
          ) {
            this.ionSDKLoaded = true;
            console.log("✅ All Ion SDK scripts loaded successfully");
            resolve();
          } else if (hasSensors || hasMeasurements || hasGeometry) {
            console.warn(
              `⚠️ Some Ion SDK scripts failed to load (${errorCount}/${totalScripts}), but partial functionality available`
            );
            this.ionSDKLoaded = true; // Still mark as loaded for fallback
            resolve();
          } else {
            console.error("❌ No Ion SDK modules available after loading");
            reject(new Error("No Ion SDK modules available"));
          }
        }
      };

      script.onerror = (error) => {
        errorCount++;
        console.error(`❌ Failed to load Ion SDK script: ${src}`, error);
        if (loadedCount + errorCount === totalScripts) {
          if (errorCount === totalScripts) {
            reject(new Error(`All Ion SDK scripts failed to load`));
          } else {
            console.warn(
              `⚠️ Some Ion SDK scripts failed to load (${errorCount}/${totalScripts})`
            );
            this.ionSDKLoaded = true; // Still mark as loaded for fallback
            resolve();
          }
        }
      };

      // Add a global error handler to catch entity redefinition errors
      const originalError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        if (
          message &&
          message.toString().includes("Cannot redefine property")
        ) {
          console.warn(
            `⚠️ Entity redefinition warning (non-critical): ${message}`
          );
          return true; // Prevent the error from being logged
        }
        if (originalError) {
          return originalError(message, source, lineno, colno, error);
        }
        return false;
      };

      document.head.appendChild(script);
    });
  }

  // Professional Sensor Creation using Ion SDK
  createRectangularSensor(options: IonSensorOptions): any {
    console.log(
      "🔧 Creating rectangular sensor, Ion SDK loaded:",
      this.ionSDKLoaded
    );

    if (!this.ionSDKLoaded || !(window as IonSDKWindow).IonSdkSensors) {
      console.warn("⚠️ Ion SDK not loaded, using fallback implementation");
      return this.createFallbackRectangularSensor(options);
    }

    const {
      position,
      orientation = Cesium.Quaternion.IDENTITY,
      radius,
      xHalfAngle = Cesium.Math.toRadians(45),
      yHalfAngle = Cesium.Math.toRadians(45),
      color = Cesium.Color.CYAN,
      showLateralSurfaces = true,
      showDomeSurfaces = true,
      showViewshed = true,
      environmentConstraint = true,
    } = options;

    // Create professional materials for Ion SDK
    const lateralSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.3),
      }
    );
    const domeSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.2),
      }
    );
    const ellipsoidSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.1),
      }
    );

    // Create model matrix
    const modelMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      position,
      orientation,
      new Cesium.Cartesian3(1, 1, 1)
    );

    // Create rectangular sensor using Ion SDK
    const sensor = new (
      window as IonSDKWindow
    ).IonSdkSensors!.RectangularSensor({
      radius,
      xHalfAngle,
      yHalfAngle,
      modelMatrix,
      lateralSurfaceMaterial,
      domeSurfaceMaterial,
      ellipsoidSurfaceMaterial,
      showLateralSurfaces,
      showDomeSurfaces,
      showEllipsoidHorizonSurfaces: false,
      showEllipsoidSurfaces: false,
      environmentConstraint,
      showEnvironmentOcclusion: false,
      showViewshed,
      classificationType:
        options.include3DModels !== false
          ? Cesium.ClassificationType.BOTH
          : Cesium.ClassificationType.TERRAIN,
      showIntersection: false,
      showThroughEllipsoid: true,
    });

    // Add to scene and track visibility
    this.viewer.scene.primitives.add(sensor);
    sensor.show = true; // Track visibility state
    console.log("✅ Ion SDK Rectangular Sensor created");

    return sensor;
  }

  createConicSensor(options: IonSensorOptions): any {
    console.log("🔧 Creating conic sensor, Ion SDK loaded:", this.ionSDKLoaded);

    if (!this.ionSDKLoaded || !(window as IonSDKWindow).IonSdkSensors) {
      console.warn("⚠️ Ion SDK not loaded, using fallback implementation");
      return this.createFallbackConicSensor(options);
    }

    const {
      position,
      orientation = Cesium.Quaternion.IDENTITY,
      radius,
      fov = Cesium.Math.toRadians(60),
      color = Cesium.Color.LIME,
      showLateralSurfaces = true,
      showDomeSurfaces = true,
      showViewshed = true,
      environmentConstraint = true,
    } = options;

    // Create professional materials for Ion SDK
    const lateralSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.3),
      }
    );
    const domeSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.2),
      }
    );
    const ellipsoidSurfaceMaterial = Cesium.Material.fromType(
      Cesium.Material.ColorType,
      {
        color: color.withAlpha(0.1),
      }
    );

    // Create model matrix
    const modelMatrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      position,
      orientation,
      new Cesium.Cartesian3(1, 1, 1)
    );

    // Create conic sensor using Ion SDK
    const sensor = new (window as IonSDKWindow).IonSdkSensors!.ConicSensor({
      radius,
      outerHalfAngle: fov / 2,
      innerHalfAngle: 0.0,
      minimumClockAngle: 0.0,
      maximumClockAngle: Cesium.Math.TWO_PI,
      modelMatrix,
      lateralSurfaceMaterial,
      domeSurfaceMaterial,
      ellipsoidSurfaceMaterial,
      showLateralSurfaces,
      showDomeSurfaces,
      showEllipsoidHorizonSurfaces: false,
      showEllipsoidSurfaces: false,
      environmentConstraint,
      showEnvironmentOcclusion: false,
      showViewshed,
      classificationType:
        options.include3DModels !== false
          ? Cesium.ClassificationType.BOTH
          : Cesium.ClassificationType.TERRAIN,
      showIntersection: false,
      showThroughEllipsoid: true,
    });

    // Add to scene and track visibility
    this.viewer.scene.primitives.add(sensor);
    sensor.show = true; // Track visibility state
    console.log("✅ Ion SDK Conic Sensor created");

    return sensor;
  }

  // Fallback implementations for when Ion SDK is not available
  private createFallbackRectangularSensor(
    options: IonSensorOptions
  ): Cesium.Entity {
    const {
      position,
      orientation = Cesium.Quaternion.IDENTITY,
      radius,
      xHalfAngle = Cesium.Math.toRadians(45),
      yHalfAngle = Cesium.Math.toRadians(45),
      color = Cesium.Color.CYAN,
    } = options;

    const halfWidth = radius * Math.tan(xHalfAngle);
    const halfHeight = radius * Math.tan(yHalfAngle);

    // Create a more visible sensor with simple material
    const sensorEntity = this.viewer.entities.add({
      position,
      orientation,
      box: {
        dimensions: new Cesium.Cartesian3(
          radius * 2,
          halfWidth * 2,
          halfHeight * 2
        ),
        material: color.withAlpha(0.3),
        outline: true,
        outlineColor: color,
        outlineWidth: 3,
      },
    });

    // Add a dome surface for better visualization
    this.viewer.entities.add({
      position,
      orientation,
      ellipsoid: {
        radii: new Cesium.Cartesian3(radius, radius, radius),
        material: color.withAlpha(0.1),
        outline: true,
        outlineColor: color.withAlpha(0.5),
      },
    });

    console.log("✅ Fallback rectangular sensor created");
    return sensorEntity;
  }

  private createFallbackConicSensor(options: IonSensorOptions): Cesium.Entity {
    const {
      position,
      orientation = Cesium.Quaternion.IDENTITY,
      radius,
      fov = Cesium.Math.toRadians(60),
      color = Cesium.Color.LIME,
    } = options;

    const baseRadius = radius * Math.tan(fov / 2);

    // Create a more visible cone sensor with simple material
    const sensorEntity = this.viewer.entities.add({
      position,
      orientation,
      cylinder: {
        length: radius,
        topRadius: 0,
        bottomRadius: baseRadius,
        material: color.withAlpha(0.3),
        outline: true,
        outlineColor: color,
        outlineWidth: 3,
        numberOfVerticalLines: 24,
      },
    });

    // Add a dome surface for better visualization
    this.viewer.entities.add({
      position,
      orientation,
      ellipsoid: {
        radii: new Cesium.Cartesian3(radius, radius, radius),
        material: color.withAlpha(0.1),
        outline: true,
        outlineColor: color.withAlpha(0.5),
      },
    });

    console.log("✅ Fallback conic sensor created");
    return sensorEntity;
  }

  // Professional Viewshed Analysis
  async computeViewshed(
    sensor: any,
    options: ViewshedOptions = {}
  ): Promise<{
    polygonEntity: Cesium.Entity | null;
    boundary: Cesium.Cartesian3[];
  }> {
    console.log("🔧 Ion SDK handles viewshed analysis automatically");

    // Ion SDK sensors handle viewshed internally when showViewshed is enabled
    // No additional computation needed - the sensor primitive handles everything
    return {
      polygonEntity: null, // Ion SDK handles this internally
      boundary: [],
    };
  }

  // Professional Measurement Tools
  enableMeasurements(options?: {
    distanceUnits?: any;
    areaUnits?: any;
    volumeUnits?: any;
  }): void {
    if (!this.ionSDKLoaded || !(window as IonSDKWindow).IonSdkMeasurements) {
      console.warn("⚠️ Ion SDK Measurements not available");
      return;
    }

    if (this.measurementEnabled) return;

    try {
      const measurements = (window as IonSDKWindow).IonSdkMeasurements!;
      const units = new measurements.MeasureUnits({
        distanceUnits:
          options?.distanceUnits || measurements.DistanceUnits.METERS,
        areaUnits: options?.areaUnits || measurements.AreaUnits.SQUARE_METERS,
        volumeUnits:
          options?.volumeUnits || measurements.VolumeUnits.CUBIC_METERS,
      });

      this.viewer.extend(measurements.viewerMeasureMixin, { units });
      this.measurementEnabled = true;
      console.log("✅ Ion SDK Measurements enabled");
    } catch (error) {
      console.error("❌ Error enabling measurements:", error);
    }
  }

  disableMeasurements(): void {
    if (!this.measurementEnabled) return;

    console.log("⚠️ Measurements cannot be disabled without recreating viewer");
  }

  // Professional Transform Editor
  createTransformEditor(
    entity: Cesium.Entity,
    options?: {
      axisLength?: number;
      gizmoPosition?: "center" | "top";
      onChange?: (trs: any) => void;
    }
  ): any {
    if (!this.ionSDKLoaded || !(window as IonSDKWindow).IonSdkMeasurements) {
      console.warn("⚠️ Ion SDK Transform Editor not available");
      return null;
    }

    try {
      const measurements = (window as IonSDKWindow).IonSdkMeasurements!;

      // Get entity position
      let entityPosition = Cesium.Cartesian3.ZERO;
      if (entity.position) {
        if (typeof entity.position.getValue === "function") {
          entityPosition =
            entity.position.getValue(Cesium.JulianDate.now()) ||
            Cesium.Cartesian3.ZERO;
        } else if (entity.position instanceof Cesium.Cartesian3) {
          entityPosition = entity.position;
        }
      }

      // Create a transform object from the entity's position
      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(
        entityPosition,
        Cesium.Ellipsoid.WGS84
      );

      // Apply the entity's orientation to the transform
      if (entity.orientation) {
        let orientation = null;
        if (typeof entity.orientation.getValue === "function") {
          orientation = entity.orientation.getValue(Cesium.JulianDate.now());
        } else if (entity.orientation instanceof Cesium.Quaternion) {
          orientation = entity.orientation;
        }

        if (orientation) {
          const rotationMatrix = Cesium.Matrix3.fromQuaternion(orientation);
          Cesium.Matrix4.setRotation(transform, rotationMatrix, transform);
        }
      }

      // Create a container element for the transform editor
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none"; // Allow clicks to pass through
      document.body.appendChild(container);

      // Create a bounding sphere for the transform editor
      const boundingSphere = new Cesium.BoundingSphere(
        entityPosition,
        options?.axisLength || 20.0
      );

      // Create the TransformEditor with proper options
      const transformEditor = new measurements.TransformEditor({
        container: container,
        scene: this.viewer.scene,
        transform: transform,
        boundingSphere: boundingSphere,
        pixelSize: options?.axisLength || 100,
        maximumSizeInMeters: options?.axisLength || 20.0,
      });

      // Set up the onChange callback
      if (options?.onChange) {
        transformEditor.viewModel.position = entityPosition;
        transformEditor.viewModel.headingPitchRoll =
          new Cesium.HeadingPitchRoll(0, 0, 0);

        // Listen for changes
        const originalActivate = transformEditor.viewModel.activate.bind(
          transformEditor.viewModel
        );
        transformEditor.viewModel.activate = () => {
          originalActivate();
          // Set up change listeners
          const checkForChanges = () => {
            if (transformEditor.viewModel.active) {
              const newPosition = transformEditor.viewModel.position;
              const newHPR = transformEditor.viewModel.headingPitchRoll;

              if (
                newPosition &&
                !Cesium.Cartesian3.equals(newPosition, entityPosition)
              ) {
                options.onChange?.({
                  translation: newPosition,
                  rotation: [newHPR.heading, newHPR.pitch, newHPR.roll],
                });
                entityPosition = newPosition;
              }
            }
            requestAnimationFrame(checkForChanges);
          };
          checkForChanges();
        };
      }

      // Configure the transform editor
      console.log("🔧 Configuring transform editor...");

      // Set the editor mode to translation by default
      transformEditor.viewModel.setModeTranslation();

      // Enable non-uniform scaling
      transformEditor.viewModel.enableNonUniformScaling = true;

      // Activate the transform editor to show the gizmo controls
      console.log("🔧 Activating transform editor...");
      transformEditor.viewModel.activate();

      // Log the active state
      console.log(
        "🔍 Transform editor active:",
        transformEditor.viewModel.active
      );

      // Store container reference for cleanup
      (transformEditor as any)._container = container;

      // Add methods to the transform editor for easy mode switching
      (transformEditor as any).setModeTranslation = () => {
        transformEditor.viewModel.setModeTranslation();
        console.log("🔧 Transform mode: Translation");
      };

      (transformEditor as any).setModeRotation = () => {
        transformEditor.viewModel.setModeRotation();
        console.log("🔧 Transform mode: Rotation");
      };

      (transformEditor as any).setModeScale = () => {
        transformEditor.viewModel.setModeScale();
        console.log("🔧 Transform mode: Scale");
      };

      console.log("✅ TransformEditor created successfully");
      console.log(
        "🔧 Available modes: setModeTranslation(), setModeRotation(), setModeScale()"
      );

      return transformEditor;
    } catch (error) {
      console.error("❌ Error creating transform editor:", error);
      return null;
    }
  }

  // Utility Methods
  isAvailable(): boolean {
    return this.isInitialized && this.ionSDKLoaded;
  }

  getAvailablePackages(): string[] {
    const packages: string[] = [];
    if ((window as IonSDKWindow).IonSdkSensors) packages.push("sensors");
    if ((window as IonSDKWindow).IonSdkMeasurements)
      packages.push("measurements");
    if ((window as IonSDKWindow).IonSdkGeometry) packages.push("geometry");
    return packages;
  }

  // Cleanup
  destroy(): void {
    this.isInitialized = false;
    this.measurementEnabled = false;
    this.ionSDKLoaded = false;
  }

  // Cleanup transform editor
  destroyTransformEditor(transformEditor: any): void {
    if (transformEditor) {
      transformEditor.destroy();
      // Clean up the container element
      if (transformEditor._container) {
        document.body.removeChild(transformEditor._container);
      }
    }
  }
}

export default CesiumIonSDK;
