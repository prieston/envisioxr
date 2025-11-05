import * as Cesium from "cesium";
import type { GizmoMode, TransformEditorOptions } from "./types";
import { enuFrame } from "./helpers";

export class TransformEditor {
  private viewer: Cesium.Viewer;
  private opts: TransformEditorOptions;
  private mode: GizmoMode = "translate";
  private axesEntity: Cesium.Entity | null = null;
  private targetEntity: Cesium.Entity | null = null;
  private handler: Cesium.ScreenSpaceEventHandler | null = null;
  private scale = 1.0;
  private rotation = Cesium.Quaternion.IDENTITY;
  private collection: Cesium.EntityCollection;

  constructor(viewer: Cesium.Viewer, opts: TransformEditorOptions = {}) {
    this.viewer = viewer;
    this.opts = opts;
    this.collection = opts.collection ?? viewer.entities;
  }

  setMode(m: GizmoMode) {
    this.mode = m;
    this._refreshGizmo();
  }

  attachToEntity(entity: Cesium.Entity) {
    this.targetEntity = entity;
    if (!entity.position) throw new Error("Target entity must have position");
    this._refreshGizmo();
    this._bindEvents();
  }

  detach() {
    if (this.axesEntity) this.collection.remove(this.axesEntity);
    this.axesEntity = null;
    this.targetEntity = null;
    if (this.handler) this.handler.destroy();
    this.handler = null;
  }

  private _refreshGizmo() {
    if (!this.targetEntity) return;
    if (this.axesEntity) this.collection.remove(this.axesEntity);

    const pos = this._getTargetPosition();
    const len = this.opts.axisLength ?? 5.0;

    const xEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(len, 0, 0),
      new Cesium.Cartesian3()
    );
    const yEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(0, len, 0),
      new Cesium.Cartesian3()
    );
    const zEnd = Cesium.Cartesian3.add(
      pos,
      new Cesium.Cartesian3(0, 0, len),
      new Cesium.Cartesian3()
    );

    this.axesEntity = this.collection.add({
      polyline: {
        positions: [pos, xEnd, pos, yEnd, pos, zEnd],
        width: 20, // Even thicker for easier selection
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE),
        clampToGround: false,
      },
      point: {
        pixelSize: 24, // Much larger center point
        color: Cesium.Color.YELLOW, // More visible color
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 4,
        // Add depth testing to ensure visibility
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: this.mode.toUpperCase(),
        pixelOffset: new Cesium.Cartesian2(0, -30),
        scale: 0.8, // Larger text
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        // Add depth testing to ensure visibility
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }

  private _bindEvents() {
    if (this.handler) this.handler.destroy();
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    let dragging = false;
    let startWorld: Cesium.Cartesian3 | null = null;

    const pickPlane = () => {
      // Plane through target in ENU X-Y (Up = ellipsoid normal)
      const pos = this._getTargetPosition();
      const normal = Cesium.Cartesian3.normalize(
        this.ellipsoidSurfaceNormal(pos),
        new Cesium.Cartesian3()
      );
      return new Cesium.Plane(normal, -Cesium.Cartesian3.dot(normal, pos));
    };

    this.handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        dragging = true;
        const ray = this.viewer.camera.getPickRay(movement.position);
        if (!ray) return;
        startWorld = this.intersectRayWithPlane(ray, pickPlane());
      },
      Cesium.ScreenSpaceEventType.LEFT_DOWN
    );

    this.handler.setInputAction(
      (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
        if (!dragging || !this.targetEntity) return;
        const ray = this.viewer.camera.getPickRay(movement.endPosition);
        if (!ray) return;
        const now = this.intersectRayWithPlane(ray, pickPlane());
        if (!now || !startWorld) return;

        const delta = Cesium.Cartesian3.subtract(
          now,
          startWorld,
          new Cesium.Cartesian3()
        );

        if (this.mode === "translate") {
          // update position
          const curr = this._getTargetPosition();
          const next = Cesium.Cartesian3.add(
            curr,
            delta,
            new Cesium.Cartesian3()
          );
          this._setTargetPosition(next);
        } else if (this.mode === "rotate") {
          // yaw: angle around Up vector
          const enu = enuFrame(this._getTargetPosition());
          const localPrev = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              startWorld,
              new Cesium.Cartesian3()
            );
          })();
          const localNow = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              now,
              new Cesium.Cartesian3()
            );
          })();
          const a0 = Math.atan2(localPrev.y, localPrev.x);
          const a1 = Math.atan2(localNow.y, localNow.x);
          const dYaw = a1 - a0;
          const q = Cesium.Quaternion.fromAxisAngle(
            Cesium.Cartesian3.UNIT_Z,
            dYaw
          );
          // apply rotation to the entity orientation if present
          const currQ = this.targetEntity.orientation?.getValue(
            new Cesium.JulianDate()
          ) as Cesium.Quaternion | undefined;
          const nextQ = currQ
            ? Cesium.Quaternion.multiply(q, currQ, new Cesium.Quaternion())
            : q;
          this.targetEntity.orientation = new Cesium.ConstantProperty(nextQ);
        } else if (this.mode === "scale") {
          // uniform scale based on radial distance change
          const enu = enuFrame(this._getTargetPosition());
          const localPrev = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              startWorld,
              new Cesium.Cartesian3()
            );
          })();
          const localNow = (() => {
            const __inv = Cesium.Matrix4.inverseTransformation(
              enu,
              new Cesium.Matrix4()
            );
            return Cesium.Matrix4.multiplyByPoint(
              __inv,
              now,
              new Cesium.Cartesian3()
            );
          })();
          const s0 = Math.hypot(localPrev.x, localPrev.y);
          const s1 = Math.hypot(localNow.x, localNow.y);
          const k = s1 / Math.max(1e-3, s0);
          this.scale *= k;
          // If target is a Model entity with a model.scale property
          if (this.targetEntity.model && "scale" in this.targetEntity.model) {
            (this.targetEntity.model as any).scale = this.scale; // eslint-disable-line @typescript-eslint/no-explicit-any
          }
        }

        startWorld = now;
        this._refreshGizmo();
        this._emitChange();
        // Force re-render to show changes immediately
        this.viewer.scene.requestRender();
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    this.handler.setInputAction(() => {
      dragging = false;
      startWorld = null;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  private _getTargetPosition(): Cesium.Cartesian3 {
    if (!this.targetEntity) throw new Error("No target");
    const time = Cesium.JulianDate.now();
    const p = this.targetEntity.position?.getValue(time);
    if (!p) throw new Error("Target must have position");

    // If gizmo should be positioned at the top of the cone
    if (this.opts.gizmoPosition === "top" && this.targetEntity.cylinder) {
      const cylinder = this.targetEntity.cylinder;
      const length = cylinder.length?.getValue(time) || 0;
      const orientation = this.targetEntity.orientation?.getValue(time);

      if (orientation) {
        // Calculate the forward direction (cone's +Z axis)
        const forward = Cesium.Matrix3.multiplyByVector(
          Cesium.Matrix3.fromQuaternion(orientation),
          Cesium.Cartesian3.UNIT_Z,
          new Cesium.Cartesian3()
        );

        // Move from center to top (apex) of the cone
        const topPosition = Cesium.Cartesian3.add(
          p,
          Cesium.Cartesian3.multiplyByScalar(
            forward,
            length * 0.5, // Half the length to reach the top
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        return topPosition;
      }
    }

    return p.clone();
  }

  private _setTargetPosition(p: Cesium.Cartesian3) {
    if (!this.targetEntity) return;

    // If gizmo is at the top of the cone, convert the position back to cone center
    if (this.opts.gizmoPosition === "top" && this.targetEntity.cylinder) {
      const time = Cesium.JulianDate.now();
      const cylinder = this.targetEntity.cylinder;
      const length = cylinder.length?.getValue(time) || 0;
      const orientation = this.targetEntity.orientation?.getValue(time);

      if (orientation) {
        // Calculate the forward direction (cone's +Z axis)
        const forward = Cesium.Matrix3.multiplyByVector(
          Cesium.Matrix3.fromQuaternion(orientation),
          Cesium.Cartesian3.UNIT_Z,
          new Cesium.Cartesian3()
        );

        // Move from apex to center (subtract half the length)
        const centerPosition = Cesium.Cartesian3.subtract(
          p,
          Cesium.Cartesian3.multiplyByScalar(
            forward,
            length * 0.5,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );

        this.targetEntity.position = new Cesium.ConstantPositionProperty(
          centerPosition
        );
        return;
      }
    }

    this.targetEntity.position = new Cesium.ConstantPositionProperty(p);
  }

  private _emitChange() {
    if (!this.opts.onChange || !this.targetEntity) return;
    const pos = this._getTargetPosition();
    const rot =
      (this.targetEntity.orientation?.getValue(
        Cesium.JulianDate.now()
      ) as Cesium.Quaternion) || Cesium.Quaternion.IDENTITY;
    const k = this.scale;
    const m = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
      pos,
      rot,
      new Cesium.Cartesian3(k, k, k)
    );

    this.opts.onChange({
      position: pos,
      rotation: rot,
      scale: k,
      modelMatrix: m,
    });
  }

  private ellipsoidSurfaceNormal(p: Cesium.Cartesian3): Cesium.Cartesian3 {
    return this.viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(
      p,
      new Cesium.Cartesian3()
    );
  }

  private intersectRayWithPlane(
    ray: Cesium.Ray,
    plane: Cesium.Plane
  ): Cesium.Cartesian3 | null {
    return Cesium.IntersectionTests.rayPlane(ray, plane);
  }
}

