import {
    Cartesian3,
    Color,
    DistanceDisplayCondition,
    Event,
    Geometry,
    GeometryInstance,
    JulianDate,
    Spherical,
    VertexFormat,
    Entity,
    EntityCollection,
    MaterialProperty,
    Property,
    Scene,
    ShadowMode
} from "@cesium/engine";

declare module "@cesiumgs/ion-sdk-geometry" {
/**
 * Describes a triangle fan around the origin.
 * @param options - An object with the following properties:
 * @param options.directions - The directions, pointing outward from the origin, that defined the fan.
 * @param [options.radius] - The radius at which to draw the fan.
 * @param [options.perDirectionRadius = false] - When set to true, the magnitude of each direction is used in place of a constant radius.
 * @param [options.vertexFormat = VertexFormat.DEFAULT] - The vertex attributes to be computed.
 */
export class FanGeometry {
    constructor(options: {
        directions: Spherical[];
        radius?: number;
        perDirectionRadius?: boolean;
        vertexFormat?: VertexFormat;
    });
    /**
     * Computes the geometric representation of a fan, including its vertices, indices, and a bounding sphere.
     * @param fanGeometry - A description of the fan.
     * @returns The computed vertices and indices.
     */
    static createGeometry(fanGeometry: FanGeometry): Geometry | undefined;
}

/**
 * Describes the outline of a {@link FanGeometry}.
 * @param options - An object with the following properties:
 * @param options.directions - The directions, pointing outward from the origin, that defined the fan.
 * @param [options.radius] - The radius at which to draw the fan.
 * @param [options.perDirectionRadius] - When set to true, the magnitude of each direction is used in place of a constant radius.
 * @param [options.numberOfRings = 6] - The number of outline rings to draw, starting from the outer edge and equidistantly spaced towards the center.
 * @param [options.vertexFormat = VertexFormat.DEFAULT] - The vertex attributes to be computed.
 */
export class FanOutlineGeometry {
    constructor(options: {
        directions: Spherical[];
        radius?: number;
        perDirectionRadius?: boolean;
        numberOfRings?: number;
        vertexFormat?: VertexFormat;
    });
    /**
     * Computes the geometric representation of a fan outline, including its vertices, indices, and a bounding sphere.
     * @param fanGeometry - A description of the fan.
     * @returns The computed vertices and indices.
     */
    static createGeometry(fanGeometry: FanOutlineGeometry): Geometry | undefined;
}

/**
 * A {@link GeometryUpdater} for {@link FanGeometry} and {@link FanOutlineGeometry}.
 * Clients do not normally create this class directly, but instead rely on {@link DataSourceDisplay}.
 * @param entity - The object containing the geometry to be visualized.
 * @param scene - The scene where visualization is taking place.
 */
export class FanGeometryUpdater {
    constructor(entity: Entity, scene: Scene);
    /**
     * Creates the geometry instance which represents the fill of the geometry.
     * @param time - The time to use when retrieving initial attribute values.
     * @returns The geometry instance representing the filled portion of the geometry.
     */
    createFillGeometryInstance(time: JulianDate): GeometryInstance;
    /**
     * Creates the geometry instance which represents the outline of the geometry.
     * @param time - The time to use when retrieving initial attribute values.
     * @returns The geometry instance representing the outline portion of the geometry.
     */
    createOutlineGeometryInstance(time: JulianDate): GeometryInstance;
}

export namespace FanGraphics {
    /**
     * Initialization options for the FanGraphics constructor
     * @property [show = true] - A boolean Property specifying the visibility of the box.
     * @property [directions] - The directions, pointing outward from the origin, that defined the fan.
     * @property [radius] - The radius at which to draw the fan.
     * @property [perDirectionRadius = false] - When set to true, the magnitude of each direction is used in place of a constant radius.
     * @property [fill = true] - A boolean Property specifying whether the cylinder is filled with the provided material.
     * @property [material = Color.WHITE] - A Property specifying the material used to fill the cylinder.
     * @property [outline = false] - A boolean Property specifying whether the cylinder is outlined.
     * @property [outlineColor = Color.BLACK] - A Property specifying the {@link Color} of the outline.
     * @property [outlineWidth = 1.0] - A numeric Property specifying the width of the outline.
     * @property [numberOfRings] - Gets or sets the numberic Property specifying the number of outline rings to draw for the outline, starting from the outer edge and equidistantly spaced towards the center.
     * @property [shadows = ShadowMode.DISABLED] - Get or sets the enum Property specifying whether the fan casts or receives shadows from each light source.
     * @property [distanceDisplayCondition] - Gets or sets the {@link DistanceDisplayCondition} Property specifying at what distance from the camera that this plane will be displayed.
     */
    type ConstructorOptions = {
        show?: Property | boolean;
        directions?: Property | Spherical[];
        radius?: Property | number;
        perDirectionRadius?: Property | boolean;
        fill?: Property | boolean;
        material?: MaterialProperty | Color;
        outline?: Property | boolean;
        outlineColor?: Property | Color;
        outlineWidth?: Property | number;
        numberOfRings?: Property | number;
        shadows?: Property | ShadowMode;
        distanceDisplayCondition?: Property | DistanceDisplayCondition;
    };
}

/**
 * An optionally time-dynamic fan.
 * @param [options] - Object describing initialization options
 */
export class FanGraphics {
    constructor(options?: FanGraphics.ConstructorOptions);
    /**
     * Gets the event that is raised whenever a new property is assigned.
     */
    readonly definitionChanged: Event;
    /**
     * Gets or sets the boolean Property specifying the fan's visibility.
     */
    show: Property | undefined;
    /**
     * Gets or sets the numeric Property specifying the radius of the fan.
     */
    radius: Property | undefined;
    /**
     * Gets or sets the boolean Property specifying whether or not to use the magnitude of each direction instead of a constant radius.
     */
    perDirectionRadius: Property | undefined;
    /**
     * Gets or sets the {@link Spherical} Property specifying the directions that define the fan.
     */
    directions: Property | undefined;
    /**
     * Gets or sets the {@link MaterialProperty} specifying the appearance of the fan.
     */
    material: MaterialProperty | undefined;
    /**
     * Gets or sets the Boolean Property specifying whether the fan should be filled.
     */
    fill: Property | undefined;
    /**
     * Gets or sets the Boolean Property specifying whether the fan should be outlined.
     */
    outline: Property | undefined;
    /**
     * Gets or sets the Color Property specifying whether the color of the outline.
     */
    outlineColor: Property | undefined;
    /**
     * Gets or sets the Number Property specifying the width of the outline.
     */
    outlineWidth: Property | undefined;
    /**
     * Gets or sets the numberic Property specifying the number of outline rings to draw for the outline, starting from the outer edge and equidistantly spaced towards the center.
     */
    numberOfRings: Property | undefined;
    /**
     * Get or sets the enum Property specifying whether the fan casts or receives shadows from each light source.
     */
    shadows: Property | undefined;
    /**
     * Gets or sets the {@link DistanceDisplayCondition} Property specifying at what distance from the camera that this plane will be displayed.
     */
    distanceDisplayCondition: Property | undefined;
    /**
     * Duplicates a FanGraphics instance.
     * @param [result] - The object onto which to store the result.
     * @returns The modified result parameter or a new instance if one was not provided.
     */
    clone(result?: FanGraphics): FanGraphics;
    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     * @param source - The object to be merged into this object.
     */
    merge(source: FanGraphics): void;
}

export namespace VectorGraphics {
    /**
     * Initialization options for the VectorGraphics constructor
     * @property [show = true] - Determines if the vector will be shown.
     * @property [position = Cartesian3.ZERO] - The position of the origin of the vector in WGS84 coordinates.
     * @property [direction = Cartesian3.UNIT_Y] - The direction of the vector in WGS84 coordinates.  This is assumed to be normalized.
     * @property [length = 1.0] - The length of the vector in meters.
     * @property [minimumLengthInPixels = 0.0] - The minimum length of the vector in pixels.
     * @property [color = Color.WHITE] - The color of the vector.  The alpha value is ignored; the vector is always opaque.
     */
    type ConstructorOptions = {
        show?: Property | boolean;
        position?: Property | Cartesian3;
        direction?: Property | Cartesian3;
        length?: Property | number;
        minimumLengthInPixels?: Property | number;
        color?: Property | Color;
    };
}

/**
 * An optionally time-dynamic vector.
 * @param [options] - Object describing initialization options
 */
export class VectorGraphics {
    constructor(options?: VectorGraphics.ConstructorOptions);
    /**
     * Gets the event that is raised whenever a new property is assigned.
     */
    readonly definitionChanged: Event;
    /**
     * Gets or sets the {@link Color} {@link Property} specifying the the vector's color.
     */
    color: Property | undefined;
    /**
     * Gets or sets the boolean {@link Property} specifying the vector's visibility.
     */
    show: Property | undefined;
    /**
     * Gets or sets the {@link Cartesian3} {@link Property} specifying the the vector's direction.
     */
    direction: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the the vector's graphical length in meters.
     */
    length: Property | undefined;
    /**
     * Gets or sets the numeric {@link Property} specifying the the vector's minimum length in pixel.
     */
    minimumLengthInPixels: Property | undefined;
    /**
     * Duplicates a VectorGraphics instance.
     * @param [result] - The object onto which to store the result.
     * @returns The modified result parameter or a new instance if one was not provided.
     */
    clone(result?: VectorGraphics): VectorGraphics;
    /**
     * Assigns each unassigned property on this object to the value
     * of the same property on the provided source object.
     * @param source - The object to be merged into this object.
     */
    merge(source: VectorGraphics): void;
}

/**
 * A {@link Visualizer} which maps {@link Entity#vector} to a {@link Vector}.
 * @param scene - The scene the primitives will be rendered in.
 * @param entityCollection - The entityCollection to visualize.
 */
export class VectorVisualizer {
    constructor(scene: Scene, entityCollection: EntityCollection);
    /**
     * Updates vectors to match their Entity counterpart at the given time.
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
 * A primitive for visualizing 3D vectors.
 * @param [options] - An object with the following properties:
 * @param [options.show = true] - Determines if the vector will be shown.
 * @param [options.position = Cartesian3.ZERO] - The position of the origin of the vector in WGS84 coordinates.
 * @param [options.direction = Cartesian3.UNIT_Y] - The direction of the vector in WGS84 coordinates.  This is assumed to be normalized.
 * @param [options.length = 1.0] - The length of the vector in meters.
 * @param [options.minimumLengthInPixels = 0.0] - The minimum length of the vector in pixels.
 * @param [options.color = Color.WHITE] - The color of the vector.  The alpha value is ignored; the vector is always opaque.
 * @param [options.id] - A user-defined object to return when the vector is picked with {@link Scene#pick}.
 * @param [options.allowPicking = true] - When <code>true</code>, the vector is pickable with {@link Scene#pick}.
 * @param [options.debugShowBoundingVolume = false] - For debugging only. Draws the bounding sphere for each {@link DrawCommand} in the vector.
 * @param [options.debugWireframe = false] - For debugging only. Draws the vector in wireframe.
 */
export class Vector {
    constructor(options?: {
        show?: boolean;
        position?: Cartesian3;
        direction?: Cartesian3;
        length?: number;
        minimumLengthInPixels?: number;
        color?: Color;
        id?: any;
        allowPicking?: boolean;
        debugShowBoundingVolume?: boolean;
        debugWireframe?: boolean;
    });
    /**
     * Determines if the vector will be shown.
     */
    show: boolean;
    /**
     * The length of the vector in meters.
     */
    length: number;
    /**
     * The minimum length of the vector in pixels.  This can be used so the vector
     * is still visible when the user is zoomed out.
     */
    minimumLengthInPixels: number;
    /**
     * The color of the vector.  The alpha value is ignored; the vector is always opaque.
     */
    color: Color;
    /**
     * User-defined object returned when the vector is picked.
     */
    id: any;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * Draws the bounding sphere for each {@link DrawCommand} in the primitive.
     * </p>
     */
    debugShowBoundingVolume: boolean;
    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * Draws the vector in wireframe.
     * </p>
     */
    debugWireframe: boolean;
    /**
     * The position of the origin of the vector in WGS84 coordinates.
     */
    position: Cartesian3;
    /**
     * The direction of the vector in WGS84 coordinates.  This is assumed to be normalized.
     */
    direction: Cartesian3;
    /**
     * When <code>true</code>, the vector is pickable with {@link Scene#pick}.  When <code>false</code>, GPU memory is saved.
     */
    readonly allowPicking: boolean;
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
     * p = p && p.destroy();
     */
    destroy(): undefined;
}


}
