import {
    Color,
    Ellipsoid,
    Event,
    JulianDate,
    Matrix4,
    EntityCollection,
    MaterialProperty,
    Property,
    ClassificationType,
    Material,
    Scene,
    SensorVolumePortionToDisplay
} from "@cesium/engine";

declare module "@cesiumgs/ion-sdk-sensors" {
export namespace ConicSensorGraphics {
    /**
     * Initialization options for the ConicSensorGraphics constructor
     * @property [show = true] - Determines if the sensor will be shown.
     * @property [portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
     * @property [radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
     * @property [innerHalfAngle = 0.0] - The half angle of the inner conical surface.
     * @property [outerHalfAngle = Math.PI_OVER_TWO] - The half angle of the outer conical surface.
     * @property [minimumClockAngle = 0.0] - The minimum clock angle of the cone wedge.
     * @property [maximumClockAngle = Math.TWO_PI] - The maximum clock angle of the cone wedge.
     * @property [lateralSurfaceMaterial = Color.WHITE] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
     * @property [showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * @property [ellipsoidHorizonSurfaceMaterial = Color.WHITE] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
     * @property [showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * @property [ellipsoidSurfaceMaterial = Color.WHITE] - The appearance of the ellipsoid surface where the sensor intersects.
     * @property [showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
     * @property [domeSurfaceMaterial = Color.WHITE] - The appearance of the sensor dome surfaces.
     * @property [showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
     * @property [showIntersection = true] - Determines if a polyline is shown where the sensor intersections the ellipsoid.
     * @property [intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
     * @property [intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     * @property [showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     * @property [environmentConstraint = false] - Determines if the sensor will be occluded by the environment, e.g. terrain or models.
     * @property [showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
     * @property [environmentOcclusionMaterial = Color.WHITE] - The appearance of the surface that is occluded by the environment.
     * @property [showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
     * @property [environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
     * @property [environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
     * @property [showViewshed = false] - The visibility of the viewshed.
     * @property [viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
     * @property [viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
     * @property [viewshedResolution = 2048] - The resolution in pixels of the viewshed.
     * @property [classificationType = ClassificationType.BOTH] - Whether this sensor will classify terrain, 3D Tiles, or both.
     */
    type ConstructorOptions = {
        show?: Property | boolean;
        portionToDisplay?: Property | SensorVolumePortionToDisplay;
        radius?: Property | number;
        innerHalfAngle?: Property | number;
        outerHalfAngle?: Property | number;
        minimumClockAngle?: Property | number;
        maximumClockAngle?: Property | number;
        lateralSurfaceMaterial?: MaterialProperty | Color;
        showLateralSurfaces?: Property | boolean;
        ellipsoidHorizonSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidHorizonSurfaces?: Property | boolean;
        ellipsoidSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidSurfaces?: Property | boolean;
        domeSurfaceMaterial?: MaterialProperty | Color;
        showDomeSurfaces?: Property | boolean;
        showIntersection?: Property | boolean;
        intersectionColor?: Property | Color;
        intersectionWidth?: Property | number;
        showThroughEllipsoid?: Property | boolean;
        environmentConstraint?: Property | boolean;
        showEnvironmentOcclusion?: Property | boolean;
        environmentOcclusionMaterial?: MaterialProperty | Color;
        showEnvironmentIntersection?: Property | boolean;
        environmentIntersectionColor?: Property | Color;
        environmentIntersectionWidth?: Property | number;
        showViewshed?: Property | boolean;
        viewshedVisibleColor?: Property | Color;
        viewshedOccludedColor?: Property | Color;
        viewshedResolution?: Property | number;
        classificationType?: Property | ClassificationType;
    };
}

/**
 * An optionally time-dynamic cone.
 * @param [options] - Object describing initialization options
 */
export class ConicSensorGraphics {
    constructor(options?: ConicSensorGraphics.ConstructorOptions);
    /**
     * Gets the event that is raised whenever a new property is assigned.
     */
    readonly definitionChanged: Event;
    /**
     * Gets or sets the numeric {@link Property} specifying the the cone's minimum clock angle.
     */
    minimumClockAngle: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the the cone's maximum clock angle.
     */
    maximumClockAngle: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the the cone's inner half-angle.
     */
    innerHalfAngle: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the the cone's outer half-angle.
     */
    outerHalfAngle: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the cone's appearance.
     */
    lateralSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the lateral surfaces defining the sensor volume.
     */
    showLateralSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the cone's ellipsoid horizon surface appearance.
     */
    ellipsoidHorizonSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid horizon surfaces defining the sensor volume.
     */
    showEllipsoidHorizonSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the surface appearance of the sensor's dome.
     */
    domeSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the dome surfaces defining the sensor volume.
     */
    showDomeSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the cone's ellipsoid surface appearance.
     */
    ellipsoidSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid surfaces defining the sensor volume.
     */
    showEllipsoidSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link SensorVolumePortionToDisplay} specifying the portion of the sensor to display.
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * Gets or sets the {@link Color} {@link Property} specifying the color of the line formed by the intersection of the cone and other central bodies.
     */
    intersectionColor: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the width of the line formed by the intersection of the cone and other central bodies.
     */
    intersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the line formed by the intersection of the cone and other central bodies.
     */
    showIntersection: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying whether a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     */
    showThroughEllipsoid: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the radius of the cone's projection.
     */
    radius: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the cone.
     */
    show: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if a sensor will intersect the environment, e.g. terrain or models,
     * and discard the portion of the sensor that is occluded.
     */
    environmentConstraint: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if the portion of the sensor occluded by the environment will be
     * drawn with {@link ConicSensorGraphics#environmentOcclusionMaterial}.
     */
    showEnvironmentOcclusion: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} that determines if a line is shown where the sensor intersects the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the line intersecting the environment.
     */
    environmentIntersectionColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the viewshed.
     */
    showViewshed: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that controls the resolution in pixels of the viewshed.
     */
    viewshedResolution: Property | undefined;
    /**
     * Gets or sets the {@link ClassificationType} Property specifying whether this sensor will classify terrain, 3D Tiles, or both.
     */
    classificationType: Property | undefined;
    /**
     * Duplicates a ConicSensorGraphics instance.
     * @param [result] - The object onto which to store the result.
     * @returns The modified result parameter or a new instance if one was not provided.
     */
    clone(result?: ConicSensorGraphics): ConicSensorGraphics;
    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     * @param source - The object to be merged into this object.
     */
    merge(source: ConicSensorGraphics): void;
}

/**
 * A {@link Visualizer} which maps {@link Entity#conicSensor} to a {@link ConicSensor} or {@link CustomPatternSensor}.
 * @param scene - The scene the primitives will be rendered in.
 * @param entityCollection - The entityCollection to visualize.
 */
export class ConicSensorVisualizer {
    constructor(scene: Scene, entityCollection: EntityCollection);
    /**
     * Updates the primitives created by this visualizer to match their
     * Entity counterpart at the given time.
     * @param time - The time to update to.
     * @returns This function always returns true.
     */
    update(time: JulianDate): boolean;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * @returns True if this object was destroyed; otherwise, false.
     */
    isDestroyed(): boolean;
    /**
     * Removes and destroys all primitives created by this instance.
     */
    destroy(): void;
}

export namespace CustomPatternSensorGraphics {
    /**
     * Initialization options for the CustomPatternSensorGraphics constructor
     * @property [show = true] - Determines if the sensor will be shown.
     * @property [portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
     * @property [modelMatrix = Matrix4.IDENTITY] - The 4x4 transformation matrix that transforms the sensor from model to world coordinates.
     * @property [radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
     * @property [directions] - An array of objects with clock and cone angles, in radians, defining the sensor volume.
     * @property [lateralSurfaceMaterial = Color.WHITE] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
     * @property [showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * @property [ellipsoidHorizonSurfaceMaterial = Color.WHITE] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
     * @property [showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * @property [ellipsoidSurfaceMaterial = Color.WHITE] - The appearance of the ellipsoid surface where the sensor intersects.
     * @property [showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
     * @property [domeSurfaceMaterial = Color.WHITE] - The appearance of the sensor dome surfaces.
     * @property [showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
     * @property [showIntersection = true] - Determines if a polyline is shown where the sensor intersections the ellipsoid.
     * @property [intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
     * @property [intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     * @property [showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     * @property [environmentConstraint = false] - Determines if the sensor will be occluded by the environment, e.g. terrain or models.
     * @property [showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
     * @property [environmentOcclusionMaterial = Color.WHITE] - The appearance of the surface that is occluded by the environment.
     * @property [showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
     * @property [environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
     * @property [environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
     * @property [showViewshed = false] - The visibility of the viewshed.
     * @property [viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
     * @property [viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
     * @property [viewshedResolution = 2048] - The resolution in pixels of the viewshed.
     * @property [classificationType = ClassificationType.BOTH] - Whether this sensor will classify terrain, 3D Tiles, or both.
     */
    type ConstructorOptions = {
        show?: Property | boolean;
        portionToDisplay?: Property | SensorVolumePortionToDisplay;
        modelMatrix?: Property | Matrix4;
        radius?: Property | number;
        directions?: Property | number;
        lateralSurfaceMaterial?: MaterialProperty | Color;
        showLateralSurfaces?: Property | boolean;
        ellipsoidHorizonSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidHorizonSurfaces?: Property | boolean;
        ellipsoidSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidSurfaces?: Property | boolean;
        domeSurfaceMaterial?: MaterialProperty | Color;
        showDomeSurfaces?: Property | boolean;
        showIntersection?: Property | boolean;
        intersectionColor?: Property | Color;
        intersectionWidth?: Property | number;
        showThroughEllipsoid?: Property | boolean;
        environmentConstraint?: Property | boolean;
        showEnvironmentOcclusion?: Property | boolean;
        environmentOcclusionMaterial?: MaterialProperty | Color;
        showEnvironmentIntersection?: Property | boolean;
        environmentIntersectionColor?: Property | Color;
        environmentIntersectionWidth?: Property | number;
        showViewshed?: Property | boolean;
        viewshedVisibleColor?: Property | Color;
        viewshedOccludedColor?: Property | Color;
        viewshedResolution?: Property | number;
        classificationType?: Property | ClassificationType;
    };
}

/**
 * An optionally time-dynamic custom patterned sensor.
 * @param [options] - Object describing initialization options
 */
export class CustomPatternSensorGraphics {
    constructor(options?: CustomPatternSensorGraphics.ConstructorOptions);
    /**
     * Gets the event that is raised whenever a new property is assigned.
     */
    readonly definitionChanged: Event;
    /**
     * A {@link Property} which returns an array of {@link Spherical} instances representing the sensor's projection.
     */
    directions: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the sensor's appearance.
     */
    lateralSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the lateral surfaces defining the sensor volume.
     */
    showLateralSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the cone's ellipsoid horizon surface appearance.
     */
    ellipsoidHorizonSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid horizon surfaces defining the sensor volume.
     */
    showEllipsoidHorizonSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the surface appearance of the sensor's dome.
     */
    domeSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the dome surfaces defining the sensor volume.
     */
    showDomeSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the cone's ellipsoid surface appearance.
     */
    ellipsoidSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid surfaces defining the sensor volume.
     */
    showEllipsoidSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link SensorVolumePortionToDisplay} specifying the portion of the sensor to display.
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * Gets or sets the {@link Color} {@link Property} specifying the color of the line formed by the intersection of the sensor and other central bodies.
     */
    intersectionColor: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the width of the line formed by the intersection of the sensor and other central bodies.
     */
    intersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the line formed by the intersection of the sensor and other central bodies.
     */
    showIntersection: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying whether a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     */
    showThroughEllipsoid: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the radius of the sensor's projection.
     */
    radius: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the sensor.
     */
    show: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if a sensor will intersect the environment, e.g. terrain or models,
     * and discard the portion of the sensor that is occluded.
     */
    environmentConstraint: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if the portion of the sensor occluded by the environment will be
     * drawn with {@link CustomPatternSensorGraphics#environmentOcclusionMaterial}.
     */
    showEnvironmentOcclusion: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} that determines if a line is shown where the sensor intersects the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the line intersecting the environment.
     */
    environmentIntersectionColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the viewshed.
     */
    showViewshed: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that controls the resolution in pixels of the viewshed.
     */
    viewshedResolution: Property | undefined;
    /**
     * Gets or sets the {@link ClassificationType} Property specifying whether this sensor will classify terrain, 3D Tiles, or both.
     */
    classificationType: Property | undefined;
    /**
     * Duplicates a CustomPatternSensorGraphics instance.
     * @param [result] - The object onto which to store the result.
     * @returns The modified result parameter or a new instance if one was not provided.
     */
    clone(result?: CustomPatternSensorGraphics): CustomPatternSensorGraphics;
    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     * @param source - The object to be merged into this object.
     */
    merge(source: CustomPatternSensorGraphics): void;
}

/**
 * A {@link Visualizer} which maps {@link Entity#customPatternSensor} to a {@link CustomPatternSensor}.
 * @param scene - The scene the primitives will be rendered in.
 * @param entityCollection - The entityCollection to visualize.
 */
export class CustomPatternSensorVisualizer {
    constructor(scene: Scene, entityCollection: EntityCollection);
    /**
     * Updates the primitives created by this visualizer to match their
     * Entity counterpart at the given time.
     * @param time - The time to update to.
     * @returns This function always returns true.
     */
    update(time: JulianDate): boolean;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * @returns True if this object was destroyed; otherwise, false.
     */
    isDestroyed(): boolean;
    /**
     * Removes and destroys all primitives created by this instance.
     */
    destroy(): void;
}

export namespace RectangularSensorGraphics {
    /**
     * Initialization options for the RectangularSensorGraphics constructor
     * @property [show = true] - Determines if the sensor will be shown.
     * @property [portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
     * @property [radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
     * @property [xHalfAngle = Math.PI_OVER_TWO] - The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the x-axis.
     * @property [yHalfAngle = Math.PI_OVER_TWO] - The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the y-axis.
     * @property [lateralSurfaceMaterial = Color.WHITE] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
     * @property [showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * @property [ellipsoidHorizonSurfaceMaterial = Color.WHITE] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
     * @property [showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * @property [ellipsoidSurfaceMaterial = Color.WHITE] - The appearance of the ellipsoid surface where the sensor intersects.
     * @property [showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
     * @property [domeSurfaceMaterial = Color.WHITE] - The appearance of the sensor dome surfaces.
     * @property [showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
     * @property [showIntersection = true] - Determines if a polyline is shown where the sensor intersections the ellipsoid.
     * @property [intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
     * @property [intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     * @property [showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     * @property [environmentConstraint = false] - Determines if the sensor will be occluded by the environment, e.g. terrain or models.
     * @property [showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
     * @property [environmentOcclusionMaterial = Color.WHITE] - The appearance of the surface that is occluded by the environment.
     * @property [showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
     * @property [environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
     * @property [environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
     * @property [showViewshed = false] - The visibility of the viewshed.
     * @property [viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
     * @property [viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
     * @property [viewshedResolution = 2048] - The resolution in pixels of the viewshed.
     * @property [classificationType = ClassificationType.BOTH] - Whether this sensor will classify terrain, 3D Tiles, or both.
     */
    type ConstructorOptions = {
        show?: Property | boolean;
        portionToDisplay?: Property | SensorVolumePortionToDisplay;
        radius?: Property | number;
        xHalfAngle?: Property | number;
        yHalfAngle?: Property | number;
        lateralSurfaceMaterial?: MaterialProperty | Color;
        showLateralSurfaces?: Property | boolean;
        ellipsoidHorizonSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidHorizonSurfaces?: Property | boolean;
        ellipsoidSurfaceMaterial?: MaterialProperty | Color;
        showEllipsoidSurfaces?: Property | boolean;
        domeSurfaceMaterial?: MaterialProperty | Color;
        showDomeSurfaces?: Property | boolean;
        showIntersection?: Property | boolean;
        intersectionColor?: Property | Color;
        intersectionWidth?: Property | number;
        showThroughEllipsoid?: Property | boolean;
        environmentConstraint?: Property | boolean;
        showEnvironmentOcclusion?: Property | boolean;
        environmentOcclusionMaterial?: MaterialProperty | Color;
        showEnvironmentIntersection?: Property | boolean;
        environmentIntersectionColor?: Property | Color;
        environmentIntersectionWidth?: Property | number;
        showViewshed?: Property | boolean;
        viewshedVisibleColor?: Property | Color;
        viewshedOccludedColor?: Property | Color;
        viewshedResolution?: Property | number;
        classificationType?: Property | ClassificationType;
    };
}

/**
 * An optionally time-dynamic pyramid.
 * @param [options] - Object describing initialization options
 */
export class RectangularSensorGraphics {
    constructor(options?: RectangularSensorGraphics.ConstructorOptions);
    /**
     * Gets the event that is raised whenever a new property is assigned.
     */
    readonly definitionChanged: Event;
    /**
     * A {@link Property} which returns an array of {@link Spherical} instances representing the pyramid's projection.
     */
    xHalfAngle: Property | undefined;
    /**
     * A {@link Property} which returns an array of {@link Spherical} instances representing the pyramid's projection.
     */
    yHalfAngle: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the pyramid's appearance.
     */
    lateralSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the lateral surfaces defining the sensor volume.
     */
    showLateralSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the sensor's ellipsoid horizon surface appearance.
     */
    ellipsoidHorizonSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid horizon surfaces defining the sensor volume.
     */
    showEllipsoidHorizonSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the surface appearance of the sensor's dome.
     */
    domeSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the dome surfaces defining the sensor volume.
     */
    showDomeSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the the sensor's ellipsoid surface appearance.
     */
    ellipsoidSurfaceMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the ellipsoid surfaces defining the sensor volume.
     */
    showEllipsoidSurfaces: Property | undefined;
    /**
     * Gets or sets the {@link SensorVolumePortionToDisplay} specifying the portion of the sensor to display.
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * Gets or sets the {@link Color} {@link Property} specifying the color of the line formed by the intersection of the pyramid and other central bodies.
     */
    intersectionColor: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the width of the line formed by the intersection of the pyramid and other central bodies.
     */
    intersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the line formed by the intersection of the pyramid and other central bodies.
     */
    showIntersection: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying whether a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
     */
    showThroughEllipsoid: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the radius of the pyramid's projection.
     */
    radius: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the pyramid.
     */
    show: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if a sensor will intersect the environment, e.g. terrain or models,
     * and discard the portion of the sensor that is occluded.
     */
    environmentConstraint: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} determining if the portion of the sensor occluded by the environment will be
     * drawn with {@link RectangularSensorGraphics#environmentOcclusionMaterial}.
     */
    showEnvironmentOcclusion: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: MaterialProperty;
    /**
     * Gets or sets the boolean {@link Property} that determines if a line is shown where the sensor intersects the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the line intersecting the environment.
     */
    environmentIntersectionColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the visibility of the viewshed.
     */
    showViewshed: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Property | undefined;
    /**
     * Gets or sets the {@link Color} {@link Property} of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Property | undefined;
    /**
     * Gets or sets the {@link Property} that controls the resolution in pixels of the viewshed.
     */
    viewshedResolution: Property | undefined;
    /**
     * Gets or sets the {@link ClassificationType} Property specifying whether this sensor will classify terrain, 3D Tiles, or both.
     */
    classificationType: Property | undefined;
    /**
     * Duplicates a RectangularSensorGraphics instance.
     * @param [result] - The object onto which to store the result.
     * @returns The modified result parameter or a new instance if one was not provided.
     */
    clone(result?: RectangularSensorGraphics): RectangularSensorGraphics;
    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     * @param source - The object to be merged into this object.
     */
    merge(source: RectangularSensorGraphics): void;
}

/**
 * A {@link Visualizer} which maps {@link Entity#rectangularSensor} to a {@link RectangularSensor}.
 * @param scene - The scene the primitives will be rendered in.
 * @param entityCollection - The entityCollection to visualize.
 */
export class RectangularSensorVisualizer {
    constructor(scene: Scene, entityCollection: EntityCollection);
    /**
     * Updates the primitives created by this visualizer to match their
     * Entity counterpart at the given time.
     * @param time - The time to update to.
     * @returns This function always returns true.
     */
    update(time: JulianDate): boolean;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * @returns True if this object was destroyed; otherwise, false.
     */
    isDestroyed(): boolean;
    /**
     * Removes and destroys all primitives created by this instance.
     */
    destroy(): void;
}

/**
 * Visualizes a conical sensor volume taking into account occlusion of an ellipsoid, i.e., the globe, or the environment, i.e., terrain and models.  The sensor's
 * shape is defined by inner {@link ConicSensor#innerHalfAngle} and outer {@link ConicSensor#outerHalfAngle} cone angles,
 * minimum {@link ConicSensor#minimumClockAngle} and maximum {@link ConicSensor#maximumClockAngle} clock angles, and a radius
 * ({@link ConicSensor#radius}).  The sensor's principal direction is along the positive z-axis.  Clock
 * angles are angles around the z-axis, rotating x into y.  Cone angles are angles from the z-axis towards the xy plane.
 * The shape also depends on if the sensor intersects the ellipsoid, as shown in examples 3 and 4 below, and what
 * surfaces are shown using properties such as {@link ConicSensor#showDomeSurfaces}.
 *
 * <div align='center'>
 * <table border='0' cellpadding='5'>
 * <tr>
 * <td align='center'>Code Example 1 below<br/><img src='Images/ConicSensor.example1.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 2 below<br/><img src='Images/ConicSensor.example2.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 3 below<br/><img src='Images/ConicSensor.example3.png' width='250' height='188' /></td>
 * </tr>
 * </table>
 * </div>
 *
 * <p>
 * A sensor points along the local positive z-axis and is positioned and oriented using
 * {@link ConicSensor#modelMatrix}.
 * </p>
 * <p>
 * <div align='center'>
 * <img src='Images/ConicSensor.modelMatrix.png' /><br />
 * </div>
 * </p>
 * @example
 * // Example 1. Sensor on the ground pointing straight up
 * var sensor = scene.primitives.add(new IonSdkSensors.ConicSensor({
 *   modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706)),
 *   radius : 1000000.0,
 *   innerHalfAngle : Cesium.Math.toRadians(5.0),
 *   outerHalfAngle : Cesium.Math.toRadians(85.0)
 * }));
 * @example
 * // Example 2. Sensor pointing straight down with its dome intersecting the ellipsoid
 * var sensor = scene.primitives.add(new IonSdkSensors.ConicSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 900000.0)),
 *   radius : 1000000.0,
 *   innerHalfAngle : Cesium.Math.toRadians(0.0),
 *   outerHalfAngle : Cesium.Math.toRadians(40.0),
 *   minimumClockAngle : Cesium.Math.toRadians(-30.0),
 *   maximumClockAngle : Cesium.Math.toRadians(30.0),
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.StripeType),
 *   intersectionColor :  Cesium.Color.YELLOW
 * }));
 * @example
 * // Example 3. Sensor with custom materials for each surface.  Switch to 2D to see the ellipsoid surface material.
 * var sensor = scene.primitives.add(new IonSdkSensors.ConicSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 9000000.0)),
 *   radius : 20000000.0,
 *   innerHalfAngle : Cesium.Math.toRadians(15.0),
 *   outerHalfAngle : Cesium.Math.toRadians(40.0),
 *   minimumClockAngle : Cesium.Math.toRadians(-60.0),
 *   maximumClockAngle : Cesium.Math.toRadians(60.0),
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 0.0, 0.0, 0.5) }),
 *   ellipsoidHorizonSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 1.0, 0.0, 0.5) }),
 *   ellipsoidSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 0.0, 1.0, 0.5) }),
 *   domeSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 1.0, 1.0, 0.5) })
 * }));
 * @param [options] - Object with the following properties:
 * @param [options.ellipsoid = Ellipsoid.WGS84] - The ellipsoid that the sensor potentially intersects.
 * @param [options.show = true] - Determines if the sensor will be shown.
 * @param [options.portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
 * @param [options.modelMatrix = Matrix4.IDENTITY] - The 4x4 transformation matrix that transforms the sensor from model to world coordinates.
 * @param [options.radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
 * @param [options.innerHalfAngle = 0.0] - The half angle of the inner conical surface.
 * @param [options.outerHalfAngle = Math.PI_OVER_TWO] - The half angle of the outer conical surface.
 * @param [options.minimumClockAngle = 0.0] - The minimum clock angle of the cone wedge.
 * @param [options.maximumClockAngle = Math.TWO_PI] - The maximum clock angle of the cone wedge.
 * @param [options.lateralSurfaceMaterial = Material.ColorType] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
 * @param [options.showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
 * @param [options.ellipsoidHorizonSurfaceMaterial = Material.ColorType] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
 * @param [options.showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
 * @param [options.ellipsoidSurfaceMaterial = Material.ColorType] - The appearance of the ellipsoid surface where the sensor intersects.
 * @param [options.showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
 * @param [options.domeSurfaceMaterial = Material.ColorType] - The appearance of the sensor dome surfaces.
 * @param [options.showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
 * @param [options.showIntersection = true] - Determines if a polyline is shown where the sensor intersects the ellipsoid.
 * @param [options.intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
 * @param [options.intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
 * @param [options.showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
 * @param [options.environmentConstraint = false] - Determines if the sensor will be occluded by objects in the current view of the environment, e.g. visible terrain or models.
 * @param [options.showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
 * @param [options.environmentOcclusionMaterial = Material.ColorType] - The appearance of the surface that is occluded by the environment.
 * @param [options.showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
 * @param [options.environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
 * @param [options.environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
 * @param [options.showViewshed = false] - Determine if a viewshed is shown. The viewshed is only shown in 3D (see {@link Scene#mode}) and only accounts for visible objects in the current camera view.
 * @param [options.viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
 * @param [options.viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
 * @param [options.viewshedResolution = 2048] - The resolution in pixels of the viewshed.
 * @param [options.classificationType = ClassificationType.BOTH] - Determines whether terrain, 3D Tiles or both will be classified.
 * @param [options.id] - User-defined object returned when the sensors is picked.
 * @param [options.debugShowCrossingPoints = false] - For debugging only.  Determines if the points where the sensor boundary crosses off of and onto the ellipsoid are shown.
 * @param [options.debugShowProxyGeometry = false] - For debugging only.  Determines if the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary are shown.
 * @param [options.debugShowBoundingVolume = false] - For debugging only. Determines if this primitive's commands' bounding spheres are shown.
 * @param [options.debugShowShadowMap = false] - For debugging only. Determines if this primitive's shadow map's bounding volume and contents are shown.
 */
export class ConicSensor {
    constructor(options?: {
        ellipsoid?: Ellipsoid;
        show?: boolean;
        portionToDisplay?: SensorVolumePortionToDisplay;
        modelMatrix?: Matrix4;
        radius?: number;
        innerHalfAngle?: number;
        outerHalfAngle?: number;
        minimumClockAngle?: number;
        maximumClockAngle?: number;
        lateralSurfaceMaterial?: Material;
        showLateralSurfaces?: boolean;
        ellipsoidHorizonSurfaceMaterial?: Material;
        showEllipsoidHorizonSurfaces?: boolean;
        ellipsoidSurfaceMaterial?: Material;
        showEllipsoidSurfaces?: boolean;
        domeSurfaceMaterial?: Material;
        showDomeSurfaces?: boolean;
        showIntersection?: boolean;
        intersectionColor?: Color;
        intersectionWidth?: number;
        showThroughEllipsoid?: boolean;
        environmentConstraint?: boolean;
        showEnvironmentOcclusion?: boolean;
        environmentOcclusionMaterial?: Material;
        showEnvironmentIntersection?: boolean;
        environmentIntersectionColor?: Color;
        environmentIntersectionWidth?: number;
        showViewshed?: boolean;
        viewshedVisibleColor?: Material;
        viewshedOccludedColor?: Material;
        viewshedResolution?: number;
        classificationType?: ClassificationType;
        id?: any;
        debugShowCrossingPoints?: boolean;
        debugShowProxyGeometry?: boolean;
        debugShowBoundingVolume?: boolean;
        debugShowShadowMap?: boolean;
    });
    /**
     * When <code>true</code>, the sensor is shown.
     */
    show: boolean;
    /**
     * Indicates what portion of the sensor is shown.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>COMPLETE</code><br/><img src='Images/SensorVolumePortionToDisplay.COMPLETE.png' width='250' height='188' /></td>
     * <td align='center'><code>BELOW_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.BELOW_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * <td align='center'><code>ABOVE_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.ABOVE_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * The 4x4 transformation matrix that transforms the sensor from model to world coordinates.  In its model
     * coordinates, the sensor's principal direction is along the positive z-axis.  Clock angles are angles around
     * the z-axis, rotating x into y.  Cone angles are angles from the z-axis towards the xy plane.
     * <p>
     * <div align='center'>
     * <img src='Images/ConicSensor.modelMatrix.png' /><br />
     * </div>
     * </p>
     * @example
     * // The sensor's origin is located on the surface at -75.59777 degrees longitude and 40.03883 degrees latitude.
     * // The sensor opens upward, along the surface normal.
     * var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
     * sensor.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
     */
    modelMatrix: Matrix4;
    /**
     * The surface appearance of the lateral surfaces, i.e., the outer sides of the sensor.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * @example
     * // Change the color of the default material to yellow
     * sensor.lateralSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.lateralSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    lateralSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor's lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showLateralSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Lateral surfaces only<br/><img src='Images/RectangularSensor.showLateralSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showLateralSurfaces: boolean;
    /**
     * The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link ConicSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid horizon surface material to yellow
     * sensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    ellipsoidHorizonSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Ellipsoid horizon surfaces only<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showEllipsoidHorizonSurfaces: boolean;
    /**
     * The appearance of the ellipsoid surface where the sensor intersects.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * <a href='https://github.com/CesiumGS/cesium/wiki/Fabric'>Fabric</a>.
     * <p>
     * When <code>undefined</code>, {@link ConicSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid surface material to yellow
     * sensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    ellipsoidSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid/sensor intersection surfaces are shown.
     * <p>
     * These surfaces are only shown in 2D and Columbus View (see {@link Scene#mode}).
     * </p>
     */
    showEllipsoidSurfaces: boolean;
    /**
     * The surface appearance of the sensor dome.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link ConicSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the dome surface material to yellow
     * sensor.domeSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.domeSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    domeSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor dome surfaces are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showDomeSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Dome only<br/><img src='Images/RectangularSensor.showDomeSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showDomeSurfaces: boolean;
    /**
     * When <code>true</code>, a polyline is shown where the sensor intersects the ellipsoid.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showIntersection : false</code><br/><img src='Images/RectangularSensor.showIntersection.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showIntersection : true</code><br/><img src='Images/RectangularSensor.showIntersection.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showIntersection: boolean;
    /**
     * The color of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionColor: Color;
    /**
     * The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionWidth: number;
    /**
     * <p>
     * When <code>true</code>, a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out
     * to the other side.
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showThroughEllipsoid : false</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showThroughEllipsoid : true</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showThroughEllipsoid: boolean;
    /**
     * When <code>true</code>, a sensor intersecting the environment, e.g. terrain or models, will discard the portion of the sensor that is occluded.
     */
    environmentConstraint: boolean;
    /**
     * When <code>true</code>, the portion of the sensor occluded by the environment will be drawn with {@link ConicSensor#environmentOcclusionMaterial}.
     * {@link ConicSensor#environmentConstraint} must also be <code>true</code>.
     */
    showEnvironmentOcclusion: boolean;
    /**
     * The surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: Material;
    /**
     * When <code>true</code>, a line is shown where the sensor intersects the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: boolean;
    /**
     * The color of the line intersecting the environment.
     */
    environmentIntersectionColor: Color;
    /**
     * The approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: number;
    /**
     * Determine if a viewshed is shown. Viewsheds only take into account objects
     * in the scene that are currently visible and are only show in 3D
     * (see {@link Scene#mode}.)
     */
    showViewshed: boolean;
    /**
     * The color of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Color;
    /**
     * The color of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Color;
    /**
     * The resolution in pixels of the viewshed.
     */
    viewshedResolution: number;
    /**
     * Determines whether terrain, 3D Tiles or both will be classified.
     */
    classificationType: ClassificationType;
    /**
     * User-defined object returned when the sensors is picked.
     */
    id: any;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the points where the sensor boundary crosses off of and onto the ellipsoid.
     * </p>
     */
    debugShowCrossingPoints: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary.
     * </p>
     */
    debugShowProxyGeometry: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the bounding sphere for each {@link DrawCommand} in the sensor.
     * </p>
     */
    debugShowBoundingVolume: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws a bounding volume around the light source for the shadow map used for environment intersections.
     * Also, the contents of the shadow map are drawn to a viewport quad.
     * </p>
     */
    debugShowShadowMap: boolean;
    /**
     * The distance from the sensor origin to any point on the sensor dome.  Informally, this is the length of the sensor.
     */
    radius: number;
    /**
     * Gets the ellipsoid that the sensor potentially intersects.
     */
    readonly ellipsoid: Ellipsoid;
    /**
     * Gets or sets the semi-aperture of the outer cone in radians.
     * This half angle is measured from the positive z-axis of the sensor.
     */
    outerHalfAngle: number;
    /**
     * Gets or sets the semi-aperture of the inner cone in radians.
     * This half angle is measured from the positive z-axis of the sensor.
     */
    innerHalfAngle: number;
    /**
     * Gets or sets the final clock angle of the cone wedge in radians.
     * This angle is measured in the xy-plane from the positive x-axis toward the positive y-axis.
     */
    maximumClockAngle: number;
    /**
     * Gets or sets the initial clock angle of the cone wedge in radians.
     * This angle is measured in the xy-plane from the positive x-axis toward the positive y-axis.
     */
    minimumClockAngle: number;
    /**
     * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
     * get the draw commands needed to render this primitive.
     * <p>
     * Do not call this function directly.  This is documented just to
     * list the exceptions that may be propagated when the scene is rendered:
     * </p>
     */
    update(): void;
    /**
     * Determines if ellipsoid surface shading is supported in 3D mode.
     * @param scene - The scene.
     * @returns <code>true</code> if ellipsoid surface shading is supported in 3D mode; otherwise, returns <code>false</code>
     */
    static ellipsoidSurfaceIn3DSupported(scene: Scene): boolean;
    /**
     * Determines if viewshed shading is supported.
     * @param scene - The scene.
     * @returns <code>true</code> if viewshed shading is supported; otherwise, returns <code>false</code>
     */
    static viewshedSupported(scene: Scene): boolean;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     * @returns <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     * @example
     * sensor = sensor && sensor.destroy();
     */
    destroy(): undefined;
}

/**
 * Visualizes a custom sensor volume taking into account occlusion of an ellipsoid, i.e., the globe, or the environment, i.e., terrain and models.  The sensor's
 * shape is defined by {@link CustomPatternSensor#directions}, which is an array of clock and cone angles, and a radius
 * ({@link CustomPatternSensor#radius}).  The sensor's principal direction is along the positive z-axis.  Clock
 * angles are angles around the z-axis, rotating x into y.  Cone angles are angles from the z-axis towards the xy plane.
 * <p>
 * Directions must conform to the following restrictions:
 * <ul>
 *    <li>Duplicate vertices are not allowed.</li>
 *    <li>Consecutive vertices should be less than 180 degrees apart.</li>
 * </ul>
 * </p>
 * The shape also depends on if the sensor intersects the ellipsoid, as shown in examples 3 and 4 below, and what
 * surfaces are shown using properties such as {@link CustomPatternSensor#showDomeSurfaces}.
 *
 * <div align='center'>
 * <table border='0' cellpadding='5'>
 * <tr>
 * <td align='center'>Code Example 1 below<br/><img src='Images/CustomPatternSensor.example1.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 2 below<br/><img src='Images/CustomPatternSensor.example2.png' width='250' height='188' /></td>
 * </tr>
 * <tr>
 * <td align='center'>Code Example 3 below<br/><img src='Images/CustomPatternSensor.example3.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 4 below<br/><img src='Images/CustomPatternSensor.example4.png' width='250' height='188' /></td>
 * </tr>
 * </table>
 * </div>
 *
 * <p>
 * A sensor points along the local positive z-axis and is positioned and oriented using
 * {@link CustomPatternSensor#modelMatrix}.
 * </p>
 * <p>
 * <div align='center'>
 * <img src='Images/CustomPatternSensor.modelMatrix.png' /><br />
 * </div>
 * </p>
 * @example
 * // Example 1. Sensor on the ground pointing straight up
 * var sensor = scene.primitives.add(new IonSdkSensors.CustomPatternSensor({
 *   modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706)),
 *   radius : 1000000.0,
 *   directions : [{
 *     clock : Cesium.Math.toRadians(0.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(90.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(180.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }]
 * }));
 * @example
 * // Example 2. Star-pattern sensor pointing straight down with its lateral surface intersecting the ellipsoid.
 * var sensor = scene.primitives.add(new IonSdkSensors.CustomPatternSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 700000.0)),
 *   radius : 1000000.0,
 *   directions : [{
 *     clock : Cesium.Math.toRadians(0.0),
 *     cone : Cesium.Math.toRadians(40.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(45.0),
 *     cone : Cesium.Math.toRadians(20.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(90.0),
 *     cone : Cesium.Math.toRadians(40.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(135.0),
 *     cone : Cesium.Math.toRadians(20.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(180.0),
 *     cone : Cesium.Math.toRadians(40.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(225.0),
 *     cone : Cesium.Math.toRadians(20.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(270.0),
 *     cone : Cesium.Math.toRadians(40.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(315.0),
 *     cone : Cesium.Math.toRadians(20.0)
 *   }],
 * }));
 * @example
 * // Example 3. Sensor pointing straight down with its dome intersecting the ellipsoid
 * var sensor = scene.primitives.add(new IonSdkSensors.CustomPatternSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 900000.0)),
 *   radius : 1000000.0,
 *   directions : [{
 *     clock : Cesium.Math.toRadians(270.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(0.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(90.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }],
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.StripeType),
 *   intersectionColor :  Cesium.Color.YELLOW
 * }));
 * @example
 * // Example 4. Sensor with custom materials for each surface.  Switch to 2D to see the ellipsoid surface material.
 * var sensor = scene.primitives.add(new IonSdkSensors.CustomPatternSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 9000000.0)),
 *   radius : 20000000.0,
 *   directions : [{
 *     clock : Cesium.Math.toRadians(270.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(0.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }, {
 *     clock : Cesium.Math.toRadians(90.0),
 *     cone : Cesium.Math.toRadians(30.0)
 *   }],
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 0.0, 0.0, 0.5) }),
 *   ellipsoidHorizonSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 1.0, 0.0, 0.5) }),
 *   ellipsoidSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 0.0, 1.0, 0.5) }),
 *   domeSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 1.0, 1.0, 0.5) })
 * }));
 * @param [options] - Object with the following properties:
 * @param [options.ellipsoid = Ellipsoid.WGS84] - The ellipsoid that the sensor potentially intersects.
 * @param [options.show = true] - Determines if the sensor will be shown.
 * @param [options.portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
 * @param [options.modelMatrix = Matrix4.IDENTITY] - The 4x4 transformation matrix that transforms the sensor from model to world coordinates.
 * @param [options.radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
 * @param [options.directions] - An array of objects with clock and cone angles, in radians, defining the sensor volume.
 * @param [options.lateralSurfaceMaterial = Material.ColorType] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
 * @param [options.showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
 * @param [options.ellipsoidHorizonSurfaceMaterial = Material.ColorType] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
 * @param [options.showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
 * @param [options.ellipsoidSurfaceMaterial = Material.ColorType] - The appearance of the ellipsoid surface where the sensor intersects.
 * @param [options.showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
 * @param [options.domeSurfaceMaterial = Material.ColorType] - The appearance of the sensor dome surfaces.
 * @param [options.showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
 * @param [options.showIntersection = true] - Determines if a polyline is shown where the sensor intersects the ellipsoid.
 * @param [options.intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
 * @param [options.intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
 * @param [options.showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
 * @param [options.environmentConstraint = false] - Determines if the sensor will be occluded by objects in the current view of the environment, e.g. visible terrain or models.
 * @param [options.showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
 * @param [options.environmentOcclusionMaterial = Material.ColorType] - The appearance of the surface that is occluded by the environment.
 * @param [options.showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
 * @param [options.environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
 * @param [options.environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
 * @param [options.showViewshed = false] - Determine if a viewshed is shown. The viewshed is only shown in 3D (see {@link Scene#mode}) and only accounts for visible objects in the current camera view.
 * @param [options.viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
 * @param [options.viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
 * @param [options.viewshedResolution = 2048] - The resolution in pixels of the viewshed.
 * @param [options.classificationType = ClassificationType.BOTH] - Determines whether terrain, 3D Tiles or both will be classified.
 * @param [options.id] - User-defined object returned when the sensors is picked.
 * @param [options.debugShowCrossingPoints = false] - For debugging only.  Determines if the points where the sensor boundary crosses off of and onto the ellipsoid are shown.
 * @param [options.debugShowProxyGeometry = false] - For debugging only.  Determines if the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary are shown.
 * @param [options.debugShowBoundingVolume = false] - For debugging only. Determines if this primitive's commands' bounding spheres are shown.
 * @param [options.debugShowShadowMap = false] - For debugging only. Determines if this primitive's shadow map's bounding volume and contents are shown.
 */
export class CustomPatternSensor {
    constructor(options?: {
        ellipsoid?: Ellipsoid;
        show?: boolean;
        portionToDisplay?: SensorVolumePortionToDisplay;
        modelMatrix?: Matrix4;
        radius?: number;
        directions?: number;
        lateralSurfaceMaterial?: Material;
        showLateralSurfaces?: boolean;
        ellipsoidHorizonSurfaceMaterial?: Material;
        showEllipsoidHorizonSurfaces?: boolean;
        ellipsoidSurfaceMaterial?: Material;
        showEllipsoidSurfaces?: boolean;
        domeSurfaceMaterial?: Material;
        showDomeSurfaces?: boolean;
        showIntersection?: boolean;
        intersectionColor?: Color;
        intersectionWidth?: number;
        showThroughEllipsoid?: boolean;
        environmentConstraint?: boolean;
        showEnvironmentOcclusion?: boolean;
        environmentOcclusionMaterial?: Material;
        showEnvironmentIntersection?: boolean;
        environmentIntersectionColor?: Color;
        environmentIntersectionWidth?: number;
        showViewshed?: boolean;
        viewshedVisibleColor?: Material;
        viewshedOccludedColor?: Material;
        viewshedResolution?: number;
        classificationType?: ClassificationType;
        id?: any;
        debugShowCrossingPoints?: boolean;
        debugShowProxyGeometry?: boolean;
        debugShowBoundingVolume?: boolean;
        debugShowShadowMap?: boolean;
    });
    /**
     * When <code>true</code>, the sensor is shown.
     */
    show: boolean;
    /**
     * Indicates what portion of the sensor is shown.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>COMPLETE</code><br/><img src='Images/SensorVolumePortionToDisplay.COMPLETE.png' width='250' height='188' /></td>
     * <td align='center'><code>BELOW_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.BELOW_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * <td align='center'><code>ABOVE_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.ABOVE_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * The 4x4 transformation matrix that transforms the sensor from model to world coordinates.  In its model
     * coordinates, the sensor's principal direction is along the positive z-axis.  Clock angles are angles around
     * the z-axis, rotating x into y.  Cone angles are angles from the z-axis towards the xy plane.
     * <p>
     * <div align='center'>
     * <img src='Images/CustomPatternSensor.modelMatrix.png' /><br />
     * </div>
     * </p>
     * @example
     * // The sensor's origin is located on the surface at -75.59777 degrees longitude and 40.03883 degrees latitude.
     * // The sensor opens upward, along the surface normal.
     * var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
     * sensor.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
     */
    modelMatrix: Matrix4;
    /**
     * The surface appearance of the lateral surfaces, i.e., the outer sides of the sensor.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * @example
     * // Change the color of the default material to yellow
     * sensor.lateralSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.lateralSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    lateralSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor's lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showLateralSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Lateral surfaces only<br/><img src='Images/RectangularSensor.showLateralSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showLateralSurfaces: boolean;
    /**
     * The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link CustomPatternSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid horizon surface material to yellow
     * sensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    ellipsoidHorizonSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Ellipsoid horizon surfaces only<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showEllipsoidHorizonSurfaces: boolean;
    /**
     * The appearance of the ellipsoid surface where the sensor intersects.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * <a href='https://github.com/CesiumGS/cesium/wiki/Fabric'>Fabric</a>.
     * <p>
     * When <code>undefined</code>, {@link CustomPatternSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid surface material to yellow
     * sensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    ellipsoidSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid/sensor intersection surfaces are shown.
     * <p>
     * These surfaces are only shown in 2D and Columbus View (see {@link Scene#mode}).
     * </p>
     */
    showEllipsoidSurfaces: boolean;
    /**
     * The surface appearance of the sensor dome.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link CustomPatternSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the dome surface material to yellow
     * sensor.domeSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.domeSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    domeSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor dome surfaces are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showDomeSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Dome only<br/><img src='Images/RectangularSensor.showDomeSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showDomeSurfaces: boolean;
    /**
     * When <code>true</code>, a polyline is shown where the sensor intersects the ellipsoid.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showIntersection : false</code><br/><img src='Images/RectangularSensor.showIntersection.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showIntersection : true</code><br/><img src='Images/RectangularSensor.showIntersection.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showIntersection: boolean;
    /**
     * The color of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionColor: Color;
    /**
     * The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionWidth: number;
    /**
     * <p>
     * When <code>true</code>, a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out
     * to the other side.
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showThroughEllipsoid : false</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showThroughEllipsoid : true</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showThroughEllipsoid: boolean;
    /**
     * When <code>true</code>, a sensor intersecting the environment, e.g. terrain or models, will discard the portion of the sensor that is occluded.
     */
    environmentConstraint: boolean;
    /**
     * When <code>true</code>, the portion of the sensor occluded by the environment will be drawn with {@link CustomPatternSensor#environmentOcclusionMaterial}.
     * {@link CustomPatternSensor#environmentConstraint} must also be <code>true</code>.
     */
    showEnvironmentOcclusion: boolean;
    /**
     * The surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: Material;
    /**
     * When <code>true</code>, a line is shown where the sensor intersects the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: boolean;
    /**
     * The color of the line intersecting the environment.
     */
    environmentIntersectionColor: Color;
    /**
     * The approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: number;
    /**
     * Determine if a viewshed is shown. Viewsheds only take into account objects
     * in the scene that are currently visible and are only show in 3D
     * (see {@link Scene#mode}.)
     */
    showViewshed: boolean;
    /**
     * The color of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Color;
    /**
     * The color of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Color;
    /**
     * The resolution in pixels of the viewshed.
     */
    viewshedResolution: number;
    /**
     * Determines whether terrain, 3D Tiles or both will be classified.
     */
    classificationType: ClassificationType;
    /**
     * User-defined object returned when the sensors is picked.
     */
    id: any;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the points where the sensor boundary crosses off of and onto the ellipsoid.
     * </p>
     */
    debugShowCrossingPoints: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary.
     * </p>
     */
    debugShowProxyGeometry: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the bounding sphere for each {@link DrawCommand} in the sensor.
     * </p>
     */
    debugShowBoundingVolume: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws a bounding volume around the light source for the shadow map used for environment intersections.
     * Also, the contents of the shadow map are drawn to a viewport quad.
     * </p>
     */
    debugShowShadowMap: boolean;
    /**
     * The distance from the sensor origin to any point on the sensor dome.  Informally, this is the length of the sensor.
     */
    radius: number;
    /**
     * Gets the ellipsoid that the sensor potentially intersects.
     */
    readonly ellipsoid: Ellipsoid;
    /**
     * Gets or sets the directions which define the sensor volume.  As shown in the example, each
     * direction is defined by a clock and cone angle in radians.  The resulting volume may be convex or concave.
     * <p>
     * The sensor's principal direction is along the positive z-axis.  Clock angles are angles around
     * the z-axis, rotating x into y.  Cone angles are angles from the z-axis towards the xy plane.
     * </p>
     * <p>
     * Directions must conform to the following restrictions:
     * <ul>
     *    <li>Duplicate vertices are not allowed.</li>
     *    <li>Consecutive vertices should be less than 180 degrees apart.</li>
     * </ul>
     * </p>
     * @example
     * // Create a triangular sensor projection
     * sensor.directions = [{
     *     clock : Cesium.Math.toRadians(0.0),
     *     cone : Cesium.Math.toRadians(30.0)
     *   }, {
     *     clock : Cesium.Math.toRadians(90.0),
     *     cone : Cesium.Math.toRadians(30.0)
     *   }, {
     *     clock : Cesium.Math.toRadians(180.0),
     *     cone : Cesium.Math.toRadians(30.0)
     * }]
     */
    directions: any;
    /**
     * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
     * get the draw commands needed to render this primitive.
     * <p>
     * Do not call this function directly.  This is documented just to
     * list the exceptions that may be propagated when the scene is rendered:
     * </p>
     */
    update(): void;
    /**
     * Determines if ellipsoid surface shading is supported in 3D mode.
     * @param scene - The scene.
     * @returns <code>true</code> if ellipsoid surface shading is supported in 3D mode; otherwise, returns <code>false</code>
     */
    static ellipsoidSurfaceIn3DSupported(scene: Scene): boolean;
    /**
     * Determines if viewshed shading is supported.
     * @param scene - The scene.
     * @returns <code>true</code> if viewshed shading is supported; otherwise, returns <code>false</code>
     */
    static viewshedSupported(scene: Scene): boolean;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     * @returns <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     * @example
     * sensor = sensor && sensor.destroy();
     */
    destroy(): undefined;
}

/**
 * Visualizes a rectangular pyramid sensor volume taking into account occlusion of an ellipsoid, i.e., the globe.  A
 * rectangular sensor may represent what is visible to a camera attached to a satellite or aircraft.  The sensor's
 * shape is defined by two half angles ({@link RectangularSensor#xHalfAngle} and
 * {@link RectangularSensor#yHalfAngle}) and a radius ({@link RectangularSensor#radius}).
 * The shape also depends on if the sensor intersects the ellipsoid, as shown in examples 2 and 3 below, and what
 * surfaces are shown using properties such as {@link RectangularSensor#showDomeSurfaces}.
 *
 * <div align='center'>
 * <table border='0' cellpadding='5'><tr>
 * <td align='center'>Code Example 1 below<br/><img src='Images/RectangularSensor.example1.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 2 below<br/><img src='Images/RectangularSensor.example2.png' width='250' height='188' /></td>
 * <td align='center'>Code Example 3 below<br/><img src='Images/RectangularSensor.example3.png' width='250' height='188' /></td>
 * </tr></table>
 * </div>
 *
 * <p>
 * A sensor points along the local positive z-axis and is positioned and oriented using
 * {@link RectangularSensor#modelMatrix}.
 * </p>
 * <p>
 * <div align='center'>
 * <img src='Images/RectangularSensor.modelMatrix.png' /><br />
 * </div>
 * </p>
 * @example
 * // Example 1. Sensor on the ground pointing straight up
 * var sensor = scene.primitives.add(new IonSdkSensors.RectangularSensor({
 *   modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706)),
 *   radius : 1000000.0,
 *   xHalfAngle : Cesium.Math.toRadians(25.0),
 *   yHalfAngle : Cesium.Math.toRadians(40.0)
 * }));
 * @example
 * // Example 2. Sensor pointing straight down with its dome intersecting the ellipsoid
 * var sensor = scene.primitives.add(new IonSdkSensors.RectangularSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 900000.0)),
 *   radius : 1000000.0,
 *   xHalfAngle : Cesium.Math.toRadians(25.0),
 *   yHalfAngle : Cesium.Math.toRadians(40.0),
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.StripeType),
 *   intersectionColor :  Cesium.Color.YELLOW
 * }));
 * @example
 * // Example 3. Sensor with custom materials for each surface.  Switch to 2D to see the ellipsoid surface material.
 * var sensor = scene.primitives.add(new IonSdkSensors.RectangularSensor({
 *   modelMatrix : Cesium.Transforms.northEastDownToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 9000000.0)),
 *   radius : 20000000.0,
 *   xHalfAngle : Cesium.Math.toRadians(25.0),
 *   yHalfAngle : Cesium.Math.toRadians(40.0),
 *   lateralSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 0.0, 0.0, 0.5) }),
 *   ellipsoidHorizonSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 1.0, 0.0, 0.5) }),
 *   ellipsoidSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(0.0, 0.0, 1.0, 0.5) }),
 *   domeSurfaceMaterial : Cesium.Material.fromType(Cesium.Material.ColorType, { color : new Cesium.Color(1.0, 1.0, 1.0, 0.5) })
 * }));
 * @param [options] - Object with the following properties:
 * @param [options.ellipsoid = Ellipsoid.WGS84] - The ellipsoid that the sensor potentially intersects.
 * @param [options.show = true] - Determines if the sensor will be shown.
 * @param [options.portionToDisplay = SensorVolumePortionToDisplay.COMPLETE] - Indicates what portion of the sensor is shown.
 * @param [options.modelMatrix = Matrix4.IDENTITY] - The 4x4 transformation matrix that transforms the sensor from model to world coordinates.
 * @param [options.radius = Number.POSITIVE_INFINITY] - The distance from the sensor origin to any point on the sensor dome.
 * @param [options.xHalfAngle = Math.PI_OVER_TWO] - The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the x-axis.
 * @param [options.yHalfAngle = Math.PI_OVER_TWO] - The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the y-axis.
 * @param [options.lateralSurfaceMaterial = Material.ColorType] - The surface appearance of the sensor lateral surface, i.e., the outer sides of the sensor.
 * @param [options.showLateralSurfaces = true] - Determines if the lateral surfaces, i.e., the outer sides of the sensor, are shown.
 * @param [options.ellipsoidHorizonSurfaceMaterial = Material.ColorType] - The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.
 * @param [options.showEllipsoidHorizonSurfaces = true] - Determines if the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
 * @param [options.ellipsoidSurfaceMaterial = Material.ColorType] - The appearance of the ellipsoid surface where the sensor intersects.
 * @param [options.showEllipsoidSurfaces = true] - Determines if the ellipsoid/sensor intersection surfaces are shown.
 * @param [options.domeSurfaceMaterial = Material.ColorType] - The appearance of the sensor dome surfaces.
 * @param [options.showDomeSurfaces = true] - Determines if the sensor dome surfaces are shown.
 * @param [options.showIntersection = true] - Determines if a polyline is shown where the sensor intersects the ellipsoid.
 * @param [options.intersectionColor = Color.WHITE] - The color of the polyline where the sensor intersects the ellipsoid.
 * @param [options.intersectionWidth = 5.0] - The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
 * @param [options.showThroughEllipsoid = false] - Determines if a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out to the other side.
 * @param [options.environmentConstraint = false] - Determines if the sensor will be occluded by objects in the current view of the environment, e.g. visible terrain or models.
 * @param [options.showEnvironmentOcclusion = false] - Determines if the portion of the sensor occluded by the environment is shown.
 * @param [options.environmentOcclusionMaterial = Material.ColorType] - The appearance of the surface that is occluded by the environment.
 * @param [options.showEnvironmentIntersection = false] - Determines if the line intersecting the sensor and the environment is shown.
 * @param [options.environmentIntersectionColor = Color.WHITE] - The color of the line intersecting the sensor and the environment.
 * @param [options.environmentIntersectionWidth = 5.0] - The width of the line intersecting the sensor and the environment in meters.
 * @param [options.showViewshed = false] - Determine if a viewshed is shown. The viewshed is only shown in 3D (see {@link Scene#mode}) and only accounts for visible objects in the current camera view.
 * @param [options.viewshedVisibleColor = Color.LIME] - The color of the scene geometry that is visible to the sensor.
 * @param [options.viewshedOccludedColor = Color.RED] - The color of the scene geometry that is not visible to the sensor.
 * @param [options.viewshedResolution = 2048] - The resolution in pixels of the viewshed.
 * @param [options.classificationType = ClassificationType.BOTH] - Determines whether terrain, 3D Tiles or both will be classified.
 * @param [options.id] - User-defined object returned when the sensors is picked.
 * @param [options.debugShowCrossingPoints = false] - For debugging only.  Determines if the points where the sensor boundary crosses off of and onto the ellipsoid are shown.
 * @param [options.debugShowProxyGeometry = false] - For debugging only.  Determines if the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary are shown.
 * @param [options.debugShowBoundingVolume = false] - For debugging only. Determines if this primitive's commands' bounding spheres are shown.
 * @param [options.debugShowShadowMap = false] - For debugging only. Determines if this primitive's shadow map's bounding volume and contents are shown.
 */
export class RectangularSensor {
    constructor(options?: {
        ellipsoid?: Ellipsoid;
        show?: boolean;
        portionToDisplay?: SensorVolumePortionToDisplay;
        modelMatrix?: Matrix4;
        radius?: number;
        xHalfAngle?: number;
        yHalfAngle?: number;
        lateralSurfaceMaterial?: Material;
        showLateralSurfaces?: boolean;
        ellipsoidHorizonSurfaceMaterial?: Material;
        showEllipsoidHorizonSurfaces?: boolean;
        ellipsoidSurfaceMaterial?: Material;
        showEllipsoidSurfaces?: boolean;
        domeSurfaceMaterial?: Material;
        showDomeSurfaces?: boolean;
        showIntersection?: boolean;
        intersectionColor?: Color;
        intersectionWidth?: number;
        showThroughEllipsoid?: boolean;
        environmentConstraint?: boolean;
        showEnvironmentOcclusion?: boolean;
        environmentOcclusionMaterial?: Material;
        showEnvironmentIntersection?: boolean;
        environmentIntersectionColor?: Color;
        environmentIntersectionWidth?: number;
        showViewshed?: boolean;
        viewshedVisibleColor?: Material;
        viewshedOccludedColor?: Material;
        viewshedResolution?: number;
        classificationType?: ClassificationType;
        id?: any;
        debugShowCrossingPoints?: boolean;
        debugShowProxyGeometry?: boolean;
        debugShowBoundingVolume?: boolean;
        debugShowShadowMap?: boolean;
    });
    /**
     * When <code>true</code>, the sensor is shown.
     */
    show: boolean;
    /**
     * Indicates what portion of the sensor is shown.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>COMPLETE</code><br/><img src='Images/SensorVolumePortionToDisplay.COMPLETE.png' width='250' height='188' /></td>
     * <td align='center'><code>BELOW_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.BELOW_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * <td align='center'><code>ABOVE_ELLIPSOID_HORIZON</code><br/><img src='Images/SensorVolumePortionToDisplay.ABOVE_ELLIPSOID_HORIZON.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    portionToDisplay: SensorVolumePortionToDisplay;
    /**
     * The 4x4 transformation matrix that transforms the sensor from model to world coordinates.  In its model
     * coordinates, the sensor's principal direction is along the positive z-axis.  Half angles measured from the
     * principal direction in the direction of the x-axis and y-axis define the rectangle of the rectangular
     * cross section.
     * <p>
     * <div align='center'>
     * <img src='Images/RectangularSensor.modelMatrix.png' /><br />
     * </div>
     * </p>
     * @example
     * // The sensor's origin is located on the surface at -75.59777 degrees longitude and 40.03883 degrees latitude.
     * // The sensor opens upward, along the surface normal.
     * var center = Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883);
     * sensor.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
     */
    modelMatrix: Matrix4;
    /**
     * The distance from the sensor origin to any point on the sensor dome.  Informally, this is the length of the sensor.
     */
    radius: number;
    /**
     * The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the x-axis.
     */
    xHalfAngle: number;
    /**
     * The half-angle, in radians, of the sensor measured from the positive z-axis (principal direction) along the y-axis.
     */
    yHalfAngle: number;
    /**
     * The surface appearance of the lateral surfaces, i.e., the outer sides of the sensor.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * @example
     * // Change the color of the default material to yellow
     * sensor.lateralSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.lateralSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    lateralSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor's lateral surfaces, i.e., the outer sides of the sensor, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showLateralSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Lateral surfaces only<br/><img src='Images/RectangularSensor.showLateralSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showLateralSurfaces: boolean;
    /**
     * The surface appearance of the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link RectangularSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid horizon surface material to yellow
     * sensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(Cesium.Material.StripeType);
     */
    ellipsoidHorizonSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid horizon surfaces, i.e., the sides formed from occlusion due to the ellipsoid horizon, are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Ellipsoid horizon surfaces only<br/><img src='Images/RectangularSensor.showEllipsoidHorizonSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showEllipsoidHorizonSurfaces: boolean;
    /**
     * The appearance of the ellipsoid surface where the sensor intersects.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * <a href='https://github.com/CesiumGS/cesium/wiki/Fabric'>Fabric</a>.
     * <p>
     * When <code>undefined</code>, {@link RectangularSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the ellipsoid surface material to yellow
     * sensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.ellipsoidSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    ellipsoidSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the ellipsoid/sensor intersection surfaces are shown.
     * <p>
     * These surfaces are only shown in 2D and Columbus View (see {@link Scene#mode}).
     * </p>
     */
    showEllipsoidSurfaces: boolean;
    /**
     * The surface appearance of the sensor dome.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/CesiumGS/cesium/wiki/Fabric|Fabric}.
     * <p>
     * When <code>undefined</code>, {@link RectangularSensor#lateralSurfaceMaterial} is used.
     * </p>
     * @example
     * // Change the color of the dome surface material to yellow
     * sensor.domeSurfaceMaterial.uniforms.color = Cesium.Color.YELLOW;
     * @example
     * // Change material to horizontal stripes
     * sensor.domeSurfaceMaterial = Material.fromType(Material.StripeType);
     */
    domeSurfaceMaterial: Material;
    /**
     * When <code>true</code>, the sensor dome surfaces are shown.
     * <p>
     * These surfaces are only shown in 3D (see {@link Scene#mode}).
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'>Full sensor<br/><img src='Images/RectangularSensor.showDomeSurfaces.png' width='250' height='188' /></td>
     * <td align='center'>Dome only<br/><img src='Images/RectangularSensor.showDomeSurfaces.only.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showDomeSurfaces: boolean;
    /**
     * When <code>true</code>, a polyline is shown where the sensor intersections the ellipsoid.
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showIntersection : false</code><br/><img src='Images/RectangularSensor.showIntersection.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showIntersection : true</code><br/><img src='Images/RectangularSensor.showIntersection.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showIntersection: boolean;
    /**
     * The color of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionColor: Color;
    /**
     * The approximate pixel width of the polyline where the sensor intersects the ellipsoid.
     */
    intersectionWidth: number;
    /**
     * <p>
     * When <code>true</code>, a sensor intersecting the ellipsoid is drawn through the ellipsoid and potentially out
     * to the other side.
     * </p>
     * <div align='center'>
     * <table border='0' cellpadding='5'><tr>
     * <td align='center'><code>showThroughEllipsoid : false</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.false.png' width='250' height='188' /></td>
     * <td align='center'><code>showThroughEllipsoid : true</code><br/><img src='Images/RectangularSensor.showThroughEllipsoid.true.png' width='250' height='188' /></td>
     * </tr></table>
     * </div>
     */
    showThroughEllipsoid: boolean;
    /**
     * When <code>true</code>, a sensor intersecting the environment, e.g. terrain or models, will discard the portion of the sensor that is occluded.
     */
    environmentConstraint: boolean;
    /**
     * When <code>true</code>, the portion of the sensor occluded by the environment will be drawn with {@link RectangularSensor#environmentOcclusionMaterial}.
     * {@link RectangularSensor#environmentConstraint} must also be <code>true</code>.
     */
    showEnvironmentOcclusion: boolean;
    /**
     * The surface appearance of the portion of the sensor occluded by the environment.
     */
    environmentOcclusionMaterial: Material;
    /**
     * When <code>true</code>, a line is shown where the sensor intersections the environment, e.g. terrain or models.
     */
    showEnvironmentIntersection: boolean;
    /**
     * The color of the line intersecting the environment.
     */
    environmentIntersectionColor: Color;
    /**
     * The approximate width in meters of the line intersecting the environment.
     */
    environmentIntersectionWidth: number;
    /**
     * Determine if a viewshed is shown. Viewsheds only take into account objects
     * in the scene that are currently visible and are only show in 3D
     * (see {@link Scene#mode}.)
     */
    showViewshed: boolean;
    /**
     * The color of the scene geometry that is visible to the sensor.
     */
    viewshedVisibleColor: Color;
    /**
     * The color of the scene geometry that is not visible to the sensor.
     */
    viewshedOccludedColor: Color;
    /**
     * The resolution in pixels of the viewshed.
     */
    viewshedResolution: number;
    /**
     * Determines whether terrain, 3D Tiles or both will be classified.
     */
    classificationType: ClassificationType;
    /**
     * User-defined object returned when the sensors is picked.
     */
    id: any;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the points where the sensor boundary crosses off of and onto the ellipsoid.
     * </p>
     */
    debugShowCrossingPoints: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the proxy geometry used for shading the dome and ellipsoid horizon surfaces of the sensor boundary.
     * </p>
     */
    debugShowProxyGeometry: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws the bounding sphere for each {@link DrawCommand} in the sensor.
     * </p>
     */
    debugShowBoundingVolume: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * When <code>true</code>, draws a bounding volume around the light source for the shadow map used for environment intersections.
     * Also, the contents of the shadow map are drawn to a viewport quad.
     * </p>
     */
    debugShowShadowMap: boolean;
    /**
     * Gets the ellipsoid that the sensor potentially intersects.
     */
    readonly ellipsoid: Ellipsoid;
    /**
     * Called when {@link Viewer} or {@link CesiumWidget} render the scene to
     * get the draw commands needed to render this primitive.
     * <p>
     * Do not call this function directly.  This is documented just to
     * list the exceptions that may be propagated when the scene is rendered:
     * </p>
     */
    update(): void;
    /**
     * Determines if ellipsoid surface shading is supported in 3D mode.
     */
    static ellipsoidSurfaceIn3DSupported: any;
    /**
     * Determines if viewshed shading is supported.
     */
    static viewshedSupported: any;
    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     * @returns <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     * @example
     * sensor = sensor && sensor.destroy();
     */
    destroy(): undefined;
}


}
