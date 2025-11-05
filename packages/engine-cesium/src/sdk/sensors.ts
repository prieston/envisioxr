import * as Cesium from "cesium";
import type { ConeSensor, RectSensor, DomeSensor } from "./types";
import { hprRotation, worldFromLocal } from "./helpers";

export const Sensors = {
  createCone(viewer: Cesium.Viewer, cfg: ConeSensor) {
    const id = cfg.id ?? `cone-${Date.now()}`;
    const baseRadius = cfg.range * Math.tan(cfg.fov * 0.5);

    // 1) Build HPR relative to the CONE position, not the camera
    const hpr = new Cesium.HeadingPitchRoll(cfg.heading, cfg.pitch, cfg.roll);
    const qHPR = Cesium.Transforms.headingPitchRollQuaternion(
      cfg.position,
      hpr
    );
    // Align cone's +Z axis to engine's +X forward (rotate -90° around +Y)
    const qAlign = Cesium.Quaternion.fromAxisAngle(
      Cesium.Cartesian3.UNIT_Y,
      -Math.PI / 2
    );
    const q = Cesium.Quaternion.multiply(qHPR, qAlign, new Cesium.Quaternion());

    // 2) Get a world rotation matrix from that quaternion
    const rot = Cesium.Matrix3.fromQuaternion(q);

    // 3) The cylinder's axis is +Z. Offset the CENTER so the apex (top) sits at cfg.position
    const forwardWorld = Cesium.Matrix3.multiplyByVector(
      rot,
      Cesium.Cartesian3.UNIT_Z,
      new Cesium.Cartesian3()
    );
    const conePos = Cesium.Cartesian3.add(
      cfg.position,
      Cesium.Cartesian3.multiplyByScalar(
        forwardWorld,
        -cfg.range * 0.5,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );

    // 4) Use the SAME quaternion for the entity's orientation
    // Make properties explicitly constant to prevent React re-renders from coercing them
    const orientation = new Cesium.ConstantProperty(q);
    const position = new Cesium.ConstantPositionProperty(conePos);

    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      position,
      orientation,
      cylinder: {
        length: cfg.range,
        topRadius: 0, // Tip at the top
        bottomRadius: baseRadius, // Base at the bottom
        material: cfg.color ?? Cesium.Color.LIME.withAlpha(0.25),
        outline: true,
        outlineColor: (cfg.color ?? Cesium.Color.LIME).withAlpha(0.9),
        numberOfVerticalLines: 24,
      },
    });

    return {
      id,
      entity,
      position: cfg.position,
      heading: cfg.heading,
      pitch: cfg.pitch,
      roll: cfg.roll,
      range: cfg.range,
      fov: cfg.fov,
    };
  },

  createRectangle(viewer: Cesium.Viewer, cfg: RectSensor) {
    const id = cfg.id ?? `rect-${Date.now()}`;
    // Visualize as a frustum-like box using a polyline outline
    const rot = hprRotation(cfg.heading, cfg.pitch, cfg.roll);
    const halfH = Math.tan(cfg.fovH * 0.5) * cfg.range;
    const halfV = Math.tan(cfg.fovV * 0.5) * cfg.range;
    const cornersLocal = [
      new Cesium.Cartesian3(cfg.range, -halfH, -halfV),
      new Cesium.Cartesian3(cfg.range, halfH, -halfV),
      new Cesium.Cartesian3(cfg.range, halfH, halfV),
      new Cesium.Cartesian3(cfg.range, -halfH, halfV),
    ];
    const cornersWorld = cornersLocal.map((c) =>
      worldFromLocal(cfg.position, c, rot)
    );
    const positions = [cfg.position, ...cornersWorld, cfg.position];

    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      polyline: {
        positions,
        width: 2,
        material: cfg.color ?? Cesium.Color.ORANGE,
      },
    });
    return { id, entity, ...cfg };
  },

  createDome(viewer: Cesium.Viewer, cfg: DomeSensor) {
    const id = cfg.id ?? `dome-${Date.now()}`;
    const rot = hprRotation(cfg.heading, cfg.pitch, cfg.roll);
    const steps = 36;
    const ring: Cesium.Cartesian3[] = [];
    const el = cfg.maxPolar; // polar from forward
    const r = Math.tan(el) * cfg.range;
    for (let i = 0; i < steps; i++) {
      const az = (i / steps) * Math.PI * 2;
      const local = new Cesium.Cartesian3(
        cfg.range,
        Math.cos(az) * r,
        Math.sin(az) * r
      );
      ring.push(worldFromLocal(cfg.position, local, rot));
    }
    const collection = cfg.collection ?? viewer.entities;
    const entity = collection.add({
      id,
      polyline: {
        positions: [...ring, ring[0]],
        width: 2,
        material: cfg.color ?? Cesium.Color.CYAN,
      },
    });
    return { id, entity, ...cfg };
  },
};

