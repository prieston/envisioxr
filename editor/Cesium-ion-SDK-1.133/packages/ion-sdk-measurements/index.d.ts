import {
    BoundingSphere,
    Cartesian2,
    Cartesian3,
    Color,
    HeadingPitchRoll,
    Matrix4,
    ClippingPlaneCollection,
    LabelCollection,
    PointPrimitiveCollection,
    PrimitiveCollection,
    Scene
} from "@cesium/engine";

import {
    Viewer
} from "@cesium/widgets";

declare module "@cesiumgs/ion-sdk-measurements" {
/**
 * Creates visual clipping planes and mouse handlers for adjusting the clipping planes added to a {@link Cesium3DTileset}, {@link Model} or {@link Globe}.
 * @example
 * // Attach 4 clipping planes to a tileset
 * tileset.clippingPlanes = new IonSdkMeasurements.ClippingPlaneCollection({
 *  planes : [
 *    new IonSdkMeasurements.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), 100),
 *    new IonSdkMeasurements.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), 100),
 *    new IonSdkMeasurements.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), 100),
 *    new IonSdkMeasurements.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), 100),
 *  ],
 *  unionClippingRegions: true,
 *  edgeWidth : 1.0
 * });
 * // Create and activate the editor to visualize and move the planes.
 * var clippingPlanesEditor = new IonSdkMeasurements.ClippingPlanesEditor({
 *  scene: viewer.scene,
 *  clippingPlanes: tileset.clippingPlanes,
 *  movePlanesToOrigin: false
 * });
 * clippingPlanesEditor.activate();
 * @param options - An object with the following properties:
 * @param options.scene - The scene.
 * @param options.clippingPlanes - A clipping plane collection that has been set for a Cesium3DTileset, Model or Globe.
 * @param [options.origin] - The position the visual clipping planes are relative to.  If not provided, a position will be computed from the modelMatrix or the primitive bounding sphere.
 * @param [options.planeSizeInMeters] - The width and height of the clipping planes in meters. If not provided, size will be computed based on the primitive bounding sphere radius, or 200.0 for terrain clipping.
 * @param [options.movePlanesToOrigin = true] - If true, ClippingPlanesEditor recomputes the plane distance to move the clipping planes to the origin.  Otherwise the original plane distance is unaltered.
 * @param [options.pixelSize = Cesium.Cartesian2(100, 100)] - The size of the clipping planes in pixels of screen space in each direction. This overrides options.planeSizeInMeters. To disable fixed screen-space size for either the x- or y-direction, set the corresponding component(s) to 0
 * @param [options.maximumSizeInMeters = Cesium.Cartesian2(Infinity, Infinity)] - The maximum size of the clipping planes in meters when fixed screen-space size is enabled. To disable this size limit for either the x- or y-direction, set the corresponding component(s) to Infinity
 */
export class ClippingPlanesEditor {
    constructor(options: {
        scene: Scene;
        clippingPlanes: ClippingPlaneCollection;
        origin?: Cartesian3;
        planeSizeInMeters?: Cartesian2;
        movePlanesToOrigin?: boolean;
        pixelSize?: Cartesian2;
        maximumSizeInMeters?: Cartesian2;
    });
    /**
     * Gets whether the clipping plane tool is active.
     */
    readonly active: boolean;
    /**
     * Gets the scene.
     */
    readonly scene: Scene;
    /**
     * Gets the clipping plane collection.
     */
    readonly clippingPlanes: ClippingPlaneCollection;
    /**
     * Activates mouse handlers.
     */
    activate(): void;
    /**
     * Deactivates the mouse handlers.
     */
    deactivate(): void;
    /**
     * Resets the clipping planes to their start position.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the clipping planes tool.
     */
    destroy(): void;
}

/**
 * Angle units used for the measure widget.
 */
export enum AngleUnits {
    DEGREES = "DEGREES",
    RADIANS = "RADIANS",
    DEGREES_MINUTES_SECONDS = "DEGREES_MINUTES_SECONDS",
    GRADE = "GRADE",
    RATIO = "RATIO"
}

/**
 * Creates a polygonal area measurement.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.primitives - A collection in which to store the measurement primitives
 * @param options.labels - A collection in which to add the labels
 * @param options.points - A collection in which to add points
 */
export class AreaMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        primitives: PrimitiveCollection;
        labels: LabelCollection;
        points: PointPrimitiveCollection;
    });
    /**
     * Gets the area value in meters squared
     */
    readonly area: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Ends drawing on double click.
     */
    handleDoubleClick(): void;
    /**
     * Handles click events while drawing a polygon.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse move events while drawing a polygon.
     * @param mousePosition - The mouse position
     */
    handleMouseMove(mousePosition: Cartesian2): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget.
     */
    destroy(): void;
}

/**
 * Area units used for the measure widget.
 */
export enum AreaUnits {
    SQUARE_METERS = "SQUARE_METERS",
    SQUARE_CENTIMETERS = "SQUARE_CENTIMETERS",
    SQUARE_KILOMETERS = "SQUARE_KILOMETERS",
    SQUARE_FEET = "SQUARE_FEET",
    SQUARE_INCHES = "SQUARE_INCHES",
    SQUARE_YARDS = "SQUARE_YARDS",
    SQUARE_MILES = "SQUARE_MILES",
    ACRES = "ACRES",
    HECTARES = "HECTARES"
}

/**
 * Draws a measurement between two points.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.points - A collection for adding the point primitives
 * @param options.labels - A collection for adding the labels
 * @param options.primitives - A collection for adding primitives
 * @param [options.showComponentLines = false] - Whether or not to show the x and y component lines
 */
export class DistanceMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        points: PointPrimitiveCollection;
        labels: LabelCollection;
        primitives: PrimitiveCollection;
        showComponentLines?: boolean;
    });
    /**
     * Gets the distance of the measurement in meters
     */
    readonly distance: number;
    /**
     * Gets the horizontal component of distance of the measurement in meters
     */
    readonly horizontalDistance: number;
    /**
     * Gets the vertical component of the distance of the measurement in meters
     */
    readonly verticalDistance: number;
    /**
     * Gets the angle between horizontal and the distance line in radians
     */
    readonly angleFromHorizontal: number;
    /**
     * Gets the angle between vertical and the distance line in radians
     */
    readonly angleFromVertical: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Gets and sets whether or not to show the x and y component lines of the measurement.
     */
    showComponentLines: boolean;
    /**
     * Handles click events while drawing a distance measurement.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse move events while drawing a distance measurement.
     * @param mousePosition - The mouse position
     */
    handleMouseMove(mousePosition: Cartesian2): void;
    /**
     * Resets the measurement.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the measurement.
     */
    destroy(): void;
}

/**
 * Distance units used for the measure widget.
 */
export enum DistanceUnits {
    METERS = "METERS",
    CENTIMETERS = "CENTIMETERS",
    KILOMETERS = "KILOMETERS",
    FEET = "FEET",
    US_SURVEY_FEET = "US_SURVEY_FEET",
    INCHES = "INCHES",
    YARDS = "YARDS",
    MILES = "MILES"
}

/**
 * Draws a measurement between a selected point and the ground beneath that point.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.points - A collection for adding the point primitives
 * @param options.labels - A collection for adding the labels
 * @param options.primitives - A collection for adding primitives
 */
export class HeightMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        points: PointPrimitiveCollection;
        labels: LabelCollection;
        primitives: PrimitiveCollection;
    });
    /**
     * Gets the distance in meters
     */
    readonly distance: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Handles click events while drawing a height measurement.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the measurement.
     */
    destroy(): void;
}

/**
 * Draws a measurement between two points with the same height.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.points - A collection for adding the point primitives
 * @param options.labels - A collection for adding the labels
 * @param options.primitives - A collection for adding primitives
 */
export class HorizontalMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        points: PointPrimitiveCollection;
        labels: LabelCollection;
        primitives: PrimitiveCollection;
    });
    /**
     * Gets the distance in meters
     */
    readonly distance: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Ends drawing on double click.
     */
    handleDoubleClick(): void;
    /**
     * Handles click events while drawing a horizontal measurement.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse movements while drawing a horizontal measurement.
     * @param mousePosition - The mouse position
     * @param shift - True if the shift key was pressed
     */
    handleMouseMove(mousePosition: Cartesian2, shift: boolean): void;
    /**
     * Resets the measurement.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the measurement.
     */
    destroy(): void;
}

/**
 * <span style="display: block; text-align: center;">
 * <img src="Images/Measure.png" width="348" height="44" alt="" />
 * <br />Measure toolbar expanded.
 * </span>
 * <br /><br />
 * Measure is a widget that allows users to make ephemeral measurements by clicking on the globe surface and on Cesium3DTiles and glTF models.
 *
 * <p>
 * Measurement types include:
 * <ul>
 * <li>
 * Area: Computes the area of an arbitrary polygon.  Note that the polygon area does not take into account the contours of terrain.
 * </li><li>
 * Distance: Computes a linear distance between two points.  Note that measurements on the earth do not conform to terrain.
 * </li><li>
 * Component Distance: Computes a linear distance between two points, with horizontal and vertical components and the angle of the line.  Note that measurements on the earth do not conform to terrain.
 * </li><li>
 * Height: Computes a linear distance between a point in space and the terrain below that point.  This value will always be 0 if activated in 2D mode.
 * </li><li>
 * Horizontal: Computes a linear distance between two points at the same height relative to the the WGS84 Ellipsoid.
 * </li><li>
 * Point: Displays the longitude and latitude coordinates and the height above terrain at a specified point in space.
 * </li><li>
 * Vertical: Computes a linear distance between two points with the same longitude/latitude but different heights.  This value will always be 0 if activated in 2D mode.
 * </li>
 * </ul>
 * </p>
 *
 * Note that drawing measurements on 3D tiles and models may not be supported by all browsers.  Check the tilesetMeasurementSupported to see
 * if it is supported.
 * @example
 * // In HTML head, include a link to the Measure.css stylesheet,
 * // and in the body, include: <div id="measureContainer"></div>
 * // Note: This code assumes you already have a Scene instance.
 *
 * var measureWidget = new IonSdkMeasurements.Measure({
 *      container : 'measureContainer',
 *      scene : scene,
 *      units : new IonSdkMeasurements.MeasureUnits({
 *          distanceUnits : IonSdkMeasurements.DistanceUnits.METERS,
 *          areaUnits : IonSdkMeasurements.AreaUnits.SQUARE_METERS,
 *          volumeUnits : IonSdkMeasurements.VolumeUnits.CUBIC_FEET,
 *          angleUnits : IonSdkMeasurements.AngleUnits.DEGREES,
 *          slopeUnits : IonSdkMeasurements.AngleUnits.GRADE
 *      })
 * });
 * @param options - An object with the following properties
 * @param options.container - The container for the widget
 * @param options.scene - The scene
 * @param [options.units] - The default unit of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param [options.primitives] - A collection in which to store the measurement primitives
 */
export class Measure {
    constructor(options: {
        container: string | Element;
        scene: Scene;
        units?: MeasureUnits;
        locale?: string;
        primitives?: PrimitiveCollection;
    });
    /**
     * Gets the parent container.
     */
    readonly container: Element;
    /**
     * Gets the view model.
     */
    readonly viewModel: MeasureViewModel;
    /**
     * Gets whether drawing a measurement on a Cesium3DTileset or Model is supported
     */
    readonly tilesetMeasurementSupported: boolean;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget.  Should be called if permanently
     * removing the widget from layout.
     */
    destroy(): void;
}

/**
 * Units of measure used for the measure widget.
 * @param options - Object with the following properties:
 * @param [options.distanceUnits = DistanceUnits.METERS] - Distance units.
 * @param [options.areaUnits = AreaUnits.SQUARE_METERS] - The base unit for area.
 * @param [options.volumeUnits = VolumeUnits.CUBIC_METERS] - The base unit for volume.
 * @param [options.angleUnits = AngleUnits.DEGREES] - Angle units.
 * @param [options.slopeUnits = AngleUnits.DEGREES] - Slope units.
 */
export class MeasureUnits {
    constructor(options: {
        distanceUnits?: DistanceUnits;
        areaUnits?: AreaUnits;
        volumeUnits?: VolumeUnits;
        angleUnits?: AngleUnits;
        slopeUnits?: AngleUnits;
    });
}

/**
 * @param number - Value after unit conversion
 * @param locale - Locale to use for formatting
 */
export type formatOptionsFunction = (number: number, locale: string) => any;

/**
 * A widget for making ephemeral measurements.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param [options.units] - The units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param [options.primitives] - A collection in which to store the measurement primitives
 */
export class MeasureViewModel {
    constructor(options: {
        scene: Scene;
        units?: MeasureUnits;
        locale?: string;
        primitives?: PrimitiveCollection;
    });
    /**
     * Gets and sets whether the measurement toolbar is expanded.
     */
    expanded: boolean;
    /**
     * Gets and sets whether the instructions are visible.
     */
    instructionsVisible: boolean;
    /**
     * Gets or sets the currently selected measurement.  This property is observable.
     */
    selectedMeasurement: Measurement;
    /**
     * Gets the scene.
     */
    readonly scene: Scene;
    /**
     * Gets the array of available measurement types.
     */
    readonly measurements: Measurement[];
    /**
     * Gets the selected unit of measurement.
     */
    units: MeasureUnits;
    /**
     * Toggles the state of the toolbar.
     */
    toggleActive(): void;
    /**
     * Toggles the visibility of the instructions panel.
     */
    toggleInstructions(): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget view model.
     */
    destroy(): void;
}

/**
 * An abstract class defining a measurement.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.primitives - A collection in which to store the measurement primitives
 * @param options.labels - A collection in which to add the labels
 * @param options.points - A collection in which to add points
 */
export class Measurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        primitives: PrimitiveCollection;
        labels: LabelCollection;
        points: PointPrimitiveCollection;
    });
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Gets selected units.
     */
    selectedUnits: string;
    /**
     * Handles double click events while performing a measurement.
     */
    handleDoubleClick(): void;
    /**
     * Handles click events while performing a measurement.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse move events while performing a measurement.
     * @param mousePosition - The mouse position
     */
    handleMouseMove(mousePosition: Cartesian2): void;
    /**
     * Handles left down mouse events while performing a measurement.
     * @param mousePosition - The mouse position
     */
    handleLeftDown(mousePosition: Cartesian2): void;
    /**
     * Handles left up mouse events while performing a measurement.
     * @param mousePosition - The mouse position
     */
    handleLeftUp(mousePosition: Cartesian2): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget.
     */
    destroy(): void;
}

/**
 * A helper class for activating and handling mouse interactions for the measurement widget.
 * @param scene - The scene
 */
export class MeasurementMouseHandler {
    constructor(scene: Scene);
    /**
     * Gets the scene.
     */
    readonly scene: Scene;
    /**
     * Activates the mouse handler.
     */
    activate(): void;
    /**
     * Deactivates the mouse handler.
     */
    deactivate(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the mouse handler.
     */
    destroy(): void;
}

/**
 * Contains options for configuring the style of the measurement widget primitives.
 */
export namespace MeasurementSettings {
    /**
     * Gets and sets the color used for the measurement primitives.
     */
    var color: Color;
    /**
     * Gets and sets the font used for the measurement labels.
     */
    var labelFont: string;
    /**
     * Gets and sets the color used for the measurement labels.
     */
    var textColor: Color;
    /**
     * Gets and sets the background color used for the measurement labels.
     */
    var backgroundColor: Color;
    /**
     * Gets and sets the background the horizontal and vertical background padding in pixels.
     */
    var backgroundPadding: Cartesian2;
}

/**
 * Draws a point and the longitude, latitude, height, and slope of that point.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.points - A collection for adding the point primitives
 * @param options.labels - A collection for adding the labels
 * @param options.primitives - A collection for adding primitives
 */
export class PointMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        points: PointPrimitiveCollection;
        labels: LabelCollection;
        primitives: PrimitiveCollection;
    });
    /**
     * Gets the position.
     */
    readonly position: Cartesian3;
    /**
     * Gets the height.
     */
    readonly height: number;
    /**
     * Gets the slope in radians.
     */
    readonly slope: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Handles drawing on mouse move.
     */
    handleMouseMove(): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the measurement.
     */
    destroy(): void;
}

/**
 * Creates an multi-line distance measurement.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.primitives - A collection in which to store the measurement primitives
 * @param options.labels - A collection in which to add the labels
 * @param options.points - A collection in which to add points
 */
export class PolylineMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        primitives: PrimitiveCollection;
        labels: LabelCollection;
        points: PointPrimitiveCollection;
    });
    /**
     * Gets the distance in meters.
     */
    readonly distance: number;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Ends drawing on double click.
     */
    handleDoubleClick(): void;
    /**
     * Handles click events while drawing a polyline.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse move events while drawing a polyline.
     * @param mousePosition - The mouse position
     */
    handleMouseMove(mousePosition: Cartesian2): void;
    /**
     * Resets the widget.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget.
     */
    destroy(): void;
}

/**
 * Draws a measurement between two points that only differ in height.
 * @param options - An object with the following properties:
 * @param options.scene - The scene
 * @param options.units - The selected units of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 * @param options.points - A collection for adding the point primitives
 * @param options.labels - A collection for adding the labels
 * @param options.primitives - A collection for adding primitives
 */
export class VerticalMeasurement {
    constructor(options: {
        scene: Scene;
        units: MeasureUnits;
        locale?: string;
        points: PointPrimitiveCollection;
        labels: LabelCollection;
        primitives: PrimitiveCollection;
    });
    /**
     * Gets the distance.
     */
    readonly distance: number;
    /**
     * Gets the type.
     */
    readonly type: string;
    /**
     * Gets the icon.
     */
    readonly icon: string;
    /**
     * Gets the thumbnail.
     */
    readonly thumbnail: string;
    /**
     * Gets the instruction text.
     */
    readonly instructions: string[];
    /**
     * Gets the id.
     */
    readonly id: string;
    /**
     * Handles click events while drawing a vertical measurement.
     * @param clickPosition - The click position
     */
    handleClick(clickPosition: Cartesian2): void;
    /**
     * Handles mouse movement while drawing a vertical measurement.
     * @param mousePosition - The mouse position
     */
    handleMouseMove(mousePosition: Cartesian2): void;
    /**
     * Resets the measurement.
     */
    reset(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the measurement.
     */
    destroy(): void;
}

/**
 * Volume units used for the measure widget.
 */
export enum VolumeUnits {
    CUBIC_METERS = "CUBIC_METERS",
    CUBIC_CENTIMETERS = "CUBIC_CENTIMETERS",
    CUBIC_KILOMETERS = "CUBIC_KILOMETERS",
    CUBIC_FEET = "CUBIC_FEET",
    CUBIC_INCHES = "CUBIC_INCHES",
    CUBIC_YARDS = "CUBIC_YARDS",
    CUBIC_MILES = "CUBIC_MILES"
}

/**
 * Filters for certain types when taking measurements using mouse picking.
 * @param object - Can be a primitive object that gets added to scene such as Cesium3DTileset or Model
 * or it can be the an object that gets returned from scene.pick which will have a primitive member.
 * @returns Whether or not the object passes callback's type filtering check.
 */
export function filterPickForMeasurement(object: any): boolean;

/**
 * Computes the slope at a point defined by window coordinates.
 * @param scene - The scene
 * @param windowCoordinates - The window coordinates
 * @returns The slope at the point relative to the ground between [0, PI/2].
 */
export function getSlope(scene: Scene, windowCoordinates: Cartesian2): number;

/**
 * A Knockout binding handler that creates a DOM element for a single SVG path.
 * This binding handler will be registered as cesiumSvgPath.
 *
 * <p>
 * The parameter to this binding is an object with the following properties:
 * </p>
 *
 * <ul>
 * <li>path: The SVG path as a string.</li>
 * <li>width: The width of the SVG path with no transformations applied.</li>
 * <li>height: The height of the SVG path with no transformations applied.</li>
 * <li>css: Optional. A string containing additional CSS classes to apply to the SVG. 'cesium-svgPath-svg' is always applied.</li>
 * </ul>
 * @example
 * // Create an SVG as a child of a div
 * <div data-bind="cesiumSvgPath: { path: 'M 100 100 L 300 100 L 200 300 z', width: 28, height: 28 }"></div>
 *
 * // parameters can be observable from the view model
 * <div data-bind="cesiumSvgPath: { path: currentPath, width: currentWidth, height: currentHeight }"></div>
 *
 * // or the whole object can be observable from the view model
 * <div data-bind="cesiumSvgPath: svgPathOptions"></div>
 */
export namespace SvgPathBindingHandler {
    function register(): void;
}

/**
 * An enum describing the x, y, and z axes and helper conversion functions.
 */
export enum EditorMode {
    /**
     * Translation mode.
     */
    TRANSLATION = "translation",
    /**
     * Rotation mode.
     */
    ROTATION = "rotation",
    /**
     * Scale mode.
     */
    SCALE = "scale"
}

/**
 * A tool for editing the transform of an object
 * @param options - An object with the following properties
 * @param options.scene - The scene
 * @param options.transform - The initial transform of the primitive that needs positioning
 * @param options.boundingSphere - The bounding sphere of the primitive that needs positioning
 * @param [options.pixelSize = 100] - The desired size of the transformation widget in pixels. Set this to zero to disable screen space scaling.
 * @param [options.maximumSizeInMeters = Infinity] - The maximum size of the transformation widget in meters. Set this to Infinity for no limit.
 */
export class TransformEditor {
    constructor(options: {
        container: Element;
        scene: Scene;
        transform: Matrix4;
        boundingSphere: BoundingSphere;
        pixelSize?: number;
        maximumSizeInMeters?: number;
    });
    /**
     * Gets the parent container.
     */
    readonly container: Element;
    /**
     * Gets the view model.
     */
    readonly viewModel: TransformEditorViewModel;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the widget.  Should be called if permanently
     * removing the widget from layout.
     */
    destroy(): void;
}

/**
 * Creates an interactive transform editor
 * @param options - An object with the following properties
 * @param options.scene - The scene
 * @param options.transform - The transform of the primitive that needs positioning
 * @param options.boundingSphere - The bounding sphere of the primitive that needs positioning
 * @param [options.originOffset] - A offset vector (in local coordinates) from the origin as defined by the transform translation.
 * @param [options.pixelSize = 100] - The desired size of the transformation widget in pixels. Set this to zero to disable screen space scaling.
 * @param [options.maximumSizeInMeters = Infinity] - The maximum size of the transformation widget in meters. Set this to Infinity for no limit.
 */
export class TransformEditorViewModel {
    constructor(options: {
        scene: Scene;
        transform: Matrix4;
        boundingSphere: BoundingSphere;
        originOffset?: Cartesian3;
        pixelSize?: number;
        maximumSizeInMeters?: number;
    });
    /**
     * Gets and sets the selected interactive mode.
     */
    editorMode: EditorMode;
    /**
     * Gets and sets whether non-uniform scaling is enabled
     */
    enableNonUniformScaling: boolean;
    /**
     * Gets and sets the position
     */
    position: Cartesian3;
    /**
     * Gets and sets the heading pitch roll
     */
    headingPitchRoll: HeadingPitchRoll;
    /**
     * Gets and sets the scale
     */
    scale: Cartesian3;
    /**
     * Gets and sets whether the menu is expanded
     */
    menuExpanded: boolean;
    /**
     * Gets the x screen coordinate of the widget menu
     */
    readonly left: string;
    /**
     * Gets the y screen coordinate of the widget menu
     */
    readonly top: string;
    /**
     * Gets whether the widget is active.  Use the activate and deactivate functions to set this value.
     */
    readonly active: boolean;
    /**
     * Gets and sets the offset of the transform editor UI components from the origin as defined by the transform
     */
    static originOffset: Cartesian3;
    /**
     * Sets the originOffset based on the Cartesian3 position in world coordinates
     */
    setOriginPosition(position: Cartesian3): void;
    /**
     * Activates the widget by showing the primitives and enabling mouse handlers
     */
    activate(): void;
    /**
     * Deactivates the widget by disabling mouse handlers and hiding the primitives
     */
    deactivate(): void;
    /**
     * Expands the widget menu
     */
    expandMenu(): void;
    /**
     * Activates the translation interactive mode
     */
    setModeTranslation(): void;
    /**
     * Activates the rotation interactive mode
     */
    setModeRotation(): void;
    /**
     * Activates the scale interactive mode
     */
    setModeScale(): void;
    /**
     * Toggles whether non-uniform scaling is enabled
     */
    toggleNonUniformScaling(): void;
    /**
     * @returns true if the object has been destroyed, false otherwise.
     */
    isDestroyed(): boolean;
    /**
     * Destroys the view model.
     */
    destroy(): void;
}

/**
 * A mixin which adds the Measure widget to the Viewer widget.
 * Rather than being called directly, this function is normally passed as
 * a parameter to {@link Viewer#extend}, as shown in the example below.
 * @example
 * var viewer = new Cesium.Viewer('cesiumContainer');
 * viewer.extend(IonSdkMeasurements.viewerMeasureMixin);
 * @param viewer - The viewer instance.
 * @param [options] - An object with the following properties:
 * @param [options.units = MeasureUnits.METERS] - The default unit of measurement
 * @param [options.locale] - The {@link https://tools.ietf.org/html/rfc5646|BCP 47 language tag} string customizing language-sensitive number formatting. If <code>undefined</code>, the runtime's default locale is used. See the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation|Intl page on MDN}
 */
export function viewerMeasureMixin(viewer: Viewer, options?: {
    units?: MeasureUnits;
    locale?: string;
}): void;

/**
 * @param object - Can be a primitive object that gets added to scene such as Cesium3DTileset or Model
 * or it can be the an object that gets returned from scene.pick which will have a primitive member.
 */
export type isPickableCallback = (object: any) => boolean;


}
