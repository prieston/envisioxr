# Change Log

## 1.133 - 2025-09-05

- Update Cesium ion SDK to CesiumJS 1.133

## 1.132 - 2025-08-01

- Update Cesium ion SDK to CesiumJS 1.132

## 1.131 - 2025-07-01

- Update Cesium ion SDK to CesiumJS 1.131

## 1.130.1 - 2025-06-03

- Update minimum node version and npm packages

## 1.130 - 2025-06-02

- Update Cesium ion SDK to CesiumJS 1.130

## 1.129 - 2025-05-01

- Update Cesium ion SDK to CesiumJS 1.129

## 1.128 - 2025-04-01

- Update Cesium ion SDK to CesiumJS 1.128

## 1.127 - 2025-03-03

- Fix Fan Geometry worker path when using the IIFE version of `ion-sdk-geometry`
- Update Cesium ion SDK to CesiumJS 1.127

## 1.126 - 2025-02-03

- Update Cesium ion SDK to CesiumJS 1.126

## 1.125 - 2025-01-02

- Update Cesium ion SDK to CesiumJS 1.125

## 1.124 - 2024-12-02

- Update Cesium ion SDK to CesiumJS 1.124

## 1.123.1 - 2024-11-13

- Update Cesium ion SDK to CesiumJS 1.123.1

## 1.123 - 2024-11-01

- Update Cesium ion SDK to CesiumJS 1.123

## 1.122 - 2024-10-01

- Update Cesium ion SDK to CesiumJS 1.122

## 1.121 - 2024-09-03

- Update Cesium ion SDK to CesiumJS 1.121
- Fixed broken links in documentation when OSS CesiumJS and ion SDK versions don't match

## 1.120.1 - 2024-08-01

- Corrected package version numbers

## 1.120 - 2024-08-01

- Update Cesium ion SDK to CesiumJS 1.120

## 1.119 - 2024-07-01

- Update Cesium ion SDK to CesiumJS 1.119

## 1.118 - 2024-06-03

- Update Cesium ion SDK to CesiumJS 1.118

## 1.117 - 2024-05-01

This pre-built zip and npm packages have been restructured. The Cesium ion SDK now contains 3 separate packages that depend on the open source version of [CesiumJS](https://github.com/CesiumGS/cesium). Previously the project was a fork of CesiumJS and used as a "drop in" replacement for the whole library. Now it is designed to be installed _alongside_ CesiumJS. This makes it easier to consume for developers moving from an existing project using CesiumJS.

### Breaking changes

- Removed top level package export. You will no longer be able to install and use `@cesiumgs/cesium-analytics` directly. Instead, use CesiumJS then import any of the additional packages below:
  - `@cesiumgs/ion-sdk-measurements` - Renamed the `ion-sdk-widgets` package. It contains measurement related functionality and widgets.
  - `@cesiumgs/ion-sdk-sensors` - This package contains all the classes and functionality for line-of-sight analytics and rendering sensors or viewsheds in CesiumJS.
  - `@cesiumgs/ion-sdk-geometry` - This package contains the additional `Fan` and `Vector` geometry classes and rendering components.
- All packages now have a peer dependency on `@cesium/engine` and `@cesium/widgets`.
- The `SelectionIndicator` icon has been reverted to the icon from CesiumJS.

#### IIFE

If before your app had a single script import, and the `Cesium` global variable was used:

```html
<script src="<PATH_TO_CESIUM_ION_SDK>/Build/Cesium/Cesium.js"></script>
<link
  href="<PATH_TO_CESIUM_ION_SDK>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
```

you will need to update the path to use [CesiumJS](https://github.com/CesiumGS/cesium), then add script tags for each additional Cesium ion SDK package. For example, to use sensor functionality:

```html
<script src="<PATH_TO_CESIUMJS>/Build/Cesium/Cesium.js"></script>
<script src="<PATH_TO_CESIUM_ION_SDK>/packages/IonSdkSensors/Build/IonSdkSensors/IonSdkSensors.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
<script>
  // Use the classes from the global variables that match the name of the file imported
  const viewer = new Cesium.Viewer("cesiumContainer");

  // ...

  const sensor = new IonSdkSensors.RectangularSensor({ ...options });
</script>
```

#### ESM

1. Install the [cesium](https://www.npmjs.com/package/cesium) package
   ```sh
   npm install --save cesium
   ```
2. Download the npm package from the [Cesium Downloads page](https://cesium.com/downloads), then install
   ```sh
   npm install --save <PATH_TO_DOWNLOAD>
   ```
3. Import classes from the relevant package.

   For example:

   ```js
   import {
     Viewer,
     Math as CesiumMath,
     RectangularSensor,
     Vector,
     AreaUnits,
   } from "cesium";
   ```

   becomes:

   ```js
   import { Viewer, Math as CesiumMath } from "cesium";
   import { RectangularSensor } from "@cesiumgs/ion-sdk-sensors";
   import { Vector } from "@cesiumgs/ion-sdk-geometry";
   import { AreaUnits } from "@cesiumgs/ion-sdk-measurements";
   ```

For detailed instructions on installing or using each package, refer to that package's `README.md`.

## 1.116 - 2024-04-01

- Update Cesium ion SDK to CesiumJS 1.116

## 1.115 - 2024-03-01

- Update Cesium ion SDK to CesiumJS 1.115

## 1.114 - 2024-02-01

- Update Cesium ion SDK to CesiumJS 1.114

## 1.113 - 2024-01-02

- Update Cesium ion SDK to CesiumJS 1.113

## 1.112 - 2023-12-01

- Update Cesium ion SDK to CesiumJS 1.112

## 1.111 - 2023-11-01

- Update Cesium ion SDK to CesiumJS 1.111

## 1.110 - 2023-10-02

- Update Cesium ion SDK to CesiumJS 1.110

## 1.109 - 2023-09-01

- Update Cesium ion SDK to CesiumJS 1.109

## 1.108 - 2023-08-01

- Update Cesium ion SDK to CesiumJS 1.108

## 1.107.1 - 2023-07-13

- Update Cesium ion SDK to CesiumJS 1.107.1

## 1.107 - 2023-07-03

- `ClippingPlanesEditor.readyPromise` was removed.
- Update Cesium ion SDK to CesiumJS 1.107

## 1.106 - 2023-06-01

- Update Cesium ion SDK to CesiumJS 1.106

## 1.105 - 2023-05-01

- Update Cesium ion SDK to CesiumJS 1.105

## 1.104 - 2023-04-03

- `ClippingPlanesEditor.readyPromise` was deprecated in CesiumJS 1.104. It will be removed in 1.107.
- Update Cesium ion SDK to CesiumJS 1.104

## 1.103 - 2023-03-01

- Update Cesium ion SDK to CesiumJS 1.103

## 1.102 - 2023-02-01

- Reflecting changes from [#10894](https://github.com/CesiumGS/cesium/pull/10894), Cesium ion SDK now defaults to a WebGL2 rendering context.
- Update Cesium ion SDK to CesiumJS 1.102

## 1.101 - 2023-01-02

- Update Cesium ion SDK to CesiumJS 1.101

## 1.100.1 - 2022-12-06

- Corrected npm dependencies to fix `npm install @cesiumgs/cesium-analytics`.

## 1.100 - 2022-12-01

- Reflecting changes from [#10824](https://github.com/CesiumGS/cesium/pull/10824), Cesium ion SDK is now published with three smaller packages `@cesiumgs/engine`, `@cesiumgs/widgets`, and `@cesiumgs/ion-sdk-widgets`:
  - The `Source` code has been partitioned into npm workspaces: `packages/engine`, `packages/widgets`, and `packages/ion-sdk-widgets`.
  - These workspaces packages will follow semantic versioning.
  - These workspaces packages are built as ES modules with TypeScript definitions.
  - The combined Cesium ion SDK release will continue to be published, however, only the `Assets`, `ThirdParty` and `Widgets` (with CSS files only) are available in the root level `Source` folder.
- Update Cesium ion SDK to CesiumJS 1.100

## 1.99 - 2022-11-01

- Update Cesium ion SDK to CesiumJS 1.99

## 1.98 - 2022-10-03

- Update Cesium ion SDK to CesiumJS 1.98

## 1.97 - 2022-09-01

- Update Cesium ion SDK to CesiumJS 1.97

## 1.96 - 2022-08-01

- Update Cesium ion SDK to CesiumJS 1.96

## 1.95 - 2022-07-01

- Update Cesium ion SDK to CesiumJS 1.95

## 1.94 - 2022-06-01

- Update Cesium ion SDK to CesiumJS 1.94

## 1.93 - 2022-05-02

- Update Cesium ion SDK to CesiumJS 1.93

## 1.92 - 2022-04-01

- Added `ClippingPlanesEditor.readyPromise`, which resolves after the clipping plane owner is ready and planes have been constructed.
- Applied change from CesiumJS where any `Promise`in the API has changed to the native `Promise` API. Code bases using cesium will likely need updates after this change. See the [upgrade guide](https://community.cesium.com/t/cesiumjs-is-switching-from-when-js-to-native-promises-which-will-be-a-breaking-change-in-1-92/17213) for instructions on how to update your code base to be compliant with native promises.

## 1.91 - 2022-03-01

- Update Cesium ion SDK to CesiumJS 1.91

## 1.90 - 2022-02-01

- Update Cesium ion SDK to CesiumJS 1.90

## 1.89 - 2022-01-03

- Update Cesium ion SDK to CesiumJS 1.89

## 1.88 - 2021-12-01

- Update Cesium ion SDK to CesiumJS 1.88

## 1.87.1 - 2021-11-09

- Update Cesium ion SDK to CesiumJS 1.87.1

## 1.87 - 2021-11-01

- Update Cesium ion SDK to CesiumJS 1.87

## 1.86.2 - 2021-10-18

- NPM only release to fix the missing Build folder

## 1.86.1 - 2021-10-15

- Update Cesium ion SDK to CesiumJS 1.86.1

## 1.86 - 2021-10-01

- Update Cesium ion SDK to CesiumJS 1.86

## 1.85 - 2021-09-01

- Update Cesium ion SDK to CesiumJS 1.85

## 1.84 - 2021-08-02

- Update Cesium ion SDK to CesiumJS 1.84

## 1.83 - 2021-07-01

- Update Cesium ion SDK to CesiumJS 1.83

## 1.82 - 2021-06-01

- Update Cesium ion SDK to CesiumJS 1.82

## 1.81 - 2021-05-03

- Update Cesium ion SDK to CesiumJS 1.81

## 1.80 - 2021-04-01

- Update Cesium ion SDK to CesiumJS 1.80

## 1.79.2 - 2021-03-18

### Fixes :wrench:

- Applied a change from CesiumJS [#9430](https://github.com/CesiumGS/cesium/pull/9430) to fix visual artifacts in ground geometry with positions that are extremely close together.

## 1.79.1 - 2021-03-07

- Update Cesium ion SDK to CesiumJS 1.79.1

## 1.78 - 2021-02-01

- Sensors now show the ellipsoid surface in 3D mode when `showEllipsoidSurfaces` is `true`. Previously the ellipsoid surface was only shown in 2D and Columbus View.
- Added `classificationType` to `ConicSensor`, `ConicSensorGraphics`, `CustomPatternSensor`, `CustomPatternSensorGraphics`, `RectangularSensor`, and `RectangularSensorGraphics` to determine whether terrain, 3D Tiles, or both will be shaded when `showEllipsoidSurfaces` is `true`.
- Added experimental viewshed support in 3D mode. The following properties were added to `ConicSensor`, `ConicSensorGraphics`, `CustomPatternSensor`, `CustomPatternSensorGraphics`, `RectangularSensor`, and `RectangularSensorGraphics`:
  - `showViewshed` determines if the sensor renders a viewshed of the contained scene geometry.
  - `viewshedVisibleColor` is the color of the scene geometry that is visible to the sensor.
  - `viewshedOccludedColor` is the color of the scene geometry that is not visible to the sensor.
  - `viewshedResolution` sets the resolution in pixels of the viewshed.
- Added `viewshedSupported` and `ellipsoidSurfaceIn3DSupported` to `ConicSensor`, `CustomPatternSensor`, and `RectangularSensor`.

## 1.77 - 2021-01-04

- Update Cesium ion SDK to CesiumJS 1.77

## 1.76 - 2020-12-01

- Update Cesium ion SDK to CesiumJS 1.76

## 1.75 - 2020-11-01

- Breaking changes
  - `Cesium.getWorldPosition` is now marked as private.
- Update Cesium ion SDK to CesiumJS 1.75

## 1.74 - 2020-10-01

- Fixed clipping editor to work correctly when a tileset has a scale transformation applied.
- Update Cesium ion SDK to CesiumJS 1.74

## 1.73 - 2020-09-01

- Update Cesium ion SDK to CesiumJS 1.73

## 1.72 - 2020-08-03

- Update Cesium ion SDK to CesiumJS 1.72

## 1.71 - 2020-07-01

- Update Cesium ion SDK to CesiumJS 1.71

## 1.70.1 - 2020-06-10

- Update Cesium ion SDK to CesiumJS 1.70.1

## 1.70 - 2020-06-01

- Update Cesium ion SDK to CesiumJS 1.70

## 1.69 - 2020-05-01

- Update Cesium ion SDK to CesiumJS 1.69

## 1.68 - 2020-04-01

- Update Cesium ion SDK to CesiumJS 1.68

## 1.67 - 2020-03-02

- Update Cesium ion SDK to CesiumJS 1.67

## 1.66 - 2020-02-03

- Breaking changes
  - Renamed `planeSize` to `planeSizeInMeters` in `ClippingPlanesEditor` constructor.
  - Changed the type of `planeSizeInMeters` from a `Number` to a `Cartesian2`.
- Added `pixelSize` and `maximumSizeInMeters` to `ClippingPlanesEditor` and `TransformEditor`. The editors are now sized in pixels rather than meters by default.
- Added `showThroughEllipsoid` to `ConicSensorGraphics`, `CustomPatternSensorGraphics`, and `RectangularSensorGraphics`.
- Improved component layer text size for `DistanceMeasurement`.
- Update Cesium ion SDK to CesiumJS 1.66

## 1.65 - 2020-01-06

- Fixed `Measure` widget behavior when expanding and collapsing the widget programmatically.
- Update Cesium ion SDK to CesiumJS 1.65

## 1.64 - 2019-12-02

- Updated unit formating to provide more flexibility with handling value post unit conversion.
- Update Cesium ion SDK to CesiumJS 1.64

## 1.63.1 - 2019-11-06

- Update Cesium ion SDK to CesiumJS 1.63.1

## 1.63 - 2019-11-01

- Breaking Changes
  - `MeasureUnits` is now an object containing `distanceUnits`, `areaUnits`, `volumeUnits`, `angleUnits`, and `slopeUnits` properties.
  - `DistanceUnits` are no longer used for area and volume units. Use `AreaUnits` and `VolumeUnits` repsectively instead.
- Added `DistanceUnits`, `AreaUnits`, `VolumeUnits`, and `AngleUnits` enums for displaying measurement results.
- Update Cesium ion SDK to CesiumJS 1.63

## 1.62 - 2019-10-01

- Update Cesium ion SDK to CesiumJS 1.62

## 1.61 - 2019-09-04

- Update Cesium ion SDK to CesiumJS 1.61

## 1.60 - 2019-08-01

- Update Cesium ion SDK to Cesium 1.60

## 1.59 - 2019-07-01

- Removed the `globe` dependency from the measurement tools, so they all now work even if the globe is turned off.
- Update Cesium ion SDK to Cesium 1.59

## 1.58 - 2019-06-03

- Update Cesium ion SDK to Cesium 1.58

## 1.57 - 2019-05-01

- Added `locale` option to the `Measure` widget to specify language-specific number formatting.
- Updated `HorizontalMeasurement` to support drawing horizontal measurements with multiple line segments.
- Update Cesium ion SDK to Cesium 1.57

## 1.56 - 2019-04-02

- Added `PolylineMeasurement` type to the `Measure` widget for doing polyline distance measurements.
- Update Cesium ion SDK to Cesium 1.56.1

## 1.55 - 2019-03-01

- Breaking Changes
  - The `showDistanceMeasureComponents` parameter option was removed from `viewerMeasureMixin` and `Measure`. Instead, there are two distance measurements on the toolbar, one with component lines and one without.
  - Removed `MeasureViewModel.showDistanceMeasureComponents`
- Updated Cesium ion SDK to CesiumJS 1.55
- Added a `Component Distance` measurement type to the `Measure` widget. In addition to displaying the straight line distance between two points, it measures the vertical distance, horizontal distance, and slope angles.

## 1.54 - 2019-02-01

- Update Cesium ion SDK to Cesium 1.54

## 1.53 - 2019-01-02

- Update Cesium ion SDK to CesiumJS 1.53

## 1.52 - 2018-12-03

- Update Cesium ion SDK to CesiumJS 1.52
- Added `getSlope`, a function which takes window coordinates and returns the slope of the terrain, 3D Tileset, or anything else rendered at that pixel location.
- Added slope computation to the `PointMeasurement` widget.
- Added new `Data Fusion Analysis` Sandcastle example showing how sensors and measurement tools work across BIM, photogrammetry, and point cloud 3D tilesets.

## 1.51 - 2018-11-01

- Update Cesium ion SDK to CesiumJS 1.51
- Added the `TransformEditor` widget for interactively changing the translation, rotation or scale of a primitive.

## 1.50 - 2018-10-01

- Update Cesium ion SDK to CesiumJS 1.50
- Fixed `Measure` widget globe picking in 2D and Columbus View.
- Fixed `ClippingPlanesEditor` widget plane positioning for tilesets with no root tile transform or tiles using RTC.

## 1.49 - 2018-09-04

- Update Cesium ion SDK to CesiumJS 1.49
- Added `Measure`, a widget for making ephemeral measurements. See the `Measure Widget` Sandcastle example under the Cesium ion tab for an example of how to use the widget.
- Added `ClippingPlanesEditor`, a helper class that creates mouse handlers and visual primitives for dragging clipping planes in a `ClippingPlaneCollection`. See the `Clipping Planes Editor` Sandcastle example under the Cesium ion tab for examples.

## 1.48 - 2018-08-01

- Update Cesium ion SDK to CesiumJS 1.48

## 1.47 - 2018-07-03

- Update Cesium ion SDK to CesiumJS 1.47

## 1.46 - 2018-06-01

- Update Cesium ion SDK to CesiumJS 1.46

## 1.45 - 2018-05-01

- Update Cesium ion SDK to CesiumJS 1.45.
- Fixed bug where assigning a new `radius`, `xHalfAngle` or `yHalfAngle` to a `RectangularSensor` made the sensor render incorrectly.
- Fixed `ConicSensor` picking bug.
- Fixed materials on conic sensors with a small radius.
- Fixed changing material uniforms when the sensor property `showEnvironmentConstraint` is `true`.

## 1.44 - 2018-04-02

- Update Cesium ion SDK to CesiumJS 1.44

## 1.43 - 2018-03-01

- Cesium Pro is now part of the Cesium ion SDK

## 1.42 - 2018-02-01

- Updated Cesium Pro to Cesium 1.42

## 1.41 - 2018-01-02

- Updated Cesium Pro to Cesium 1.41

## 1.40 - 2017-12-01

- Updated Cesium Pro to Cesium 1.40

## 1.39 - 2017-11-01

- Updated Cesium Pro to Cesium 1.39

## 1.38 - 2017-10-02

- Updated Cesium Pro to Cesium 1.38

## 1.37 - 2017-09-01

- Updated Cesium Pro to Cesium 1.37

## 1.36 - 2017-08-01

- Updated Cesium Pro to Cesium 1.36

## 1.35 - 2017-07-05

- Fix an issue rendering sensors in Edge.
- Sensors support intersection with the new 3D Tiles feature. See the `3D Tiles Sensor` Sandcastle example.
- Updated Cesium Pro to Cesium 1.35

## 1.34 - 2017-06-01

- Updated Cesium Pro to Cesium 1.34

## 1.33 - 2017-05-01

- Updated Cesium Pro to Cesium 1.33

## 1.32 - 2017-04-03

- Updated Cesium Pro to Cesium 1.32

## 1.31 - 2017-03-01

- Updated Cesium Pro to Cesium 1.31

## 1.30 - 2017-02-01

- Updated Cesium Pro to Cesium 1.30

## 1.29 - 2017-01-02

- Updated Cesium Pro to Cesium 1.29

## 1.28 - 2016-12-01

- Updated Cesium Pro to Cesium 1.28

## 1.27 - 2016-11-01

- Updated Cesium Pro to Cesium 1.27

## 1.26 - 2016-10-03

- Updated Cesium Pro to Cesium 1.26

## 1.25 - 2016-09-01

- Fix an issue with rendering sensor domes when the sensor had a small radius.
- Updated Cesium Pro to Cesium 1.25

## 1.24 - 2016-08-01

- Updated Cesium Pro to Cesium 1.24

## 1.23 - 2016-07-01

- Added the following properties to `ConicSensor`, `ConicSensorGraphics`, `CustomPatternSensor`, `CustomPatternSensorGraphics`, `RectangularSensor`, and `RectangularSensorGraphics`:
  - `environmentConstraint` determines if the sensor will be occluded by the environment, e.g. terrain or models.
  - `showEnvironmentOcclusion` determines if the portion of the sensor occluded by the environment is shown.
  - `environmentOcclusionMaterial` is the appearance of the surface that is occluded by the environment.
  - `showEnvironmentIntersection` determines if the line intersecting the sensor and the environment is shown.
  - `environmentIntersectionColor` is the color of the line intersecting the sensor and the environment.
  - `environmentIntersectionWidth` is the width of the line intersecting the sensor and the environment in meters.
- Added `Fan` `outlineWidth` to CZML.
- Fixed `Fan` CZML parsing to allow specifying `directions` as a list of references.
- Updated Cesium Pro to Cesium 1.23

## 1.22 - 2016-06-01

- Added ability for `Viewer.zoomTo` and `Viewer.flyTo` to zoom/fly to sensors.
- Updated Cesium Pro to Cesium 1.22

## 1.21 - 2016-05-02

- Updated Cesium Pro to Cesium 1.21

## 1.20 - 2016-04-01

- Fixed crash when custom sensor patterns in CZML have duplicate points.
- Updated Cesium Pro to Cesium 1.20

## 1.19 - 2016-03-01

- Updated Cesium Pro to Cesium 1.19

## 1.18 - 2016-02-01

- Updated Cesium Pro to Cesium 1.18

## 1.17 - 2016-01-04

- Updated Cesium Pro to Cesium 1.17

## 1.16 - 2015-12-01

- Updated Cesium Pro to Cesium 1.16

## 1.15 - 2015-11-02

- Updated Cesium Pro to Cesium 1.15

## 1.14 - 2015-10-02

- Updated Cesium Pro to Cesium 1.14

## 1.13 - 2015-09-01

- Updated Cesium Pro to Cesium 1.13

## 1.12 - 2015-08-03

- Updated Cesium Pro to Cesium 1.12

## 1.11 - 2015-07-01

- Updated Cesium Pro to Cesium 1.11

## 1.10 - 2015-06-01

- Fixed an issue with ConicSensor horizon crossing ordering.
- Updated Cesium Pro to Cesium 1.10

## 1.9 - 2015-05-01

- Updated Cesium Pro to Cesium 1.9

## 1.8 - 2015-04-01

- Updated Cesium Pro to Cesium 1.8

## 1.7 - 2015-03-03

- Updated Cesium Pro to Cesium 1.7

## 1.5 - 2015-01-05

- Updated Cesium Pro to Cesium 1.5.

## 1.4 - 2014-12-02

- Added `outlineWidth` property to `FanGraphics`.

## 1.3 - 2014-11-03

- Fixed issue where sensor visualizers where not setting the `showIntersection` property.
- Improve `CustomPatternSensor` performance.

## 1.2 - 2014-10-01

- Improved sensor shader caching performance.

## 1.1.1 - 2014-09-23

- Fixed ellipsoid horizon surface rendering issue for `CustomPatternSensor` and `ConicSensor` when the sensor vertex is near the surface of the ellipsoid.
- Fixed shading of conic sensor lateral surfaces.
- Fixed recursion issue for `CustomPatternSensor` caused when a series of consecutive directions were essentially coplanar.

## 1.1 - 2014-09-02

- Improved compatibility of DataSource created conic sensors on older browsers.
- Increased the number of points supported by `CustomSensorPattern`.
- Fixed a crashed that occurred when removing sensors from a 2D scene.
- Fixed a sensor rendering artifact in 2D and Columbus View which caused a discontinuity on the sensor boundary.

## 1.0 - 2014-08-01

- Breaking changes:
  - Renamed `CustomSensorVolume` to `CustomPatternSensor`.
  - Renamed `RectangularPyramidSensorVolume` to `RectangularSensor`.
  - Renamed `DynamicPyramidVisualizer` to `RectangularSensorVisualizer`.
  - Renamed `DynamicConeVisualizerUsingCustomSensor` to `ConicSensorVisualizer`.
  - Renamed `DynamicCone` to `ConicSensorGraphics`.
  - Renamed `DynamicPyramid` to `RectangularSensorGraphics`.
  - Renamed `DynamicFan` to `FanGraphics`.
  - Renamed `DynamicVector` to `VectorGraphics`.
  - Renamed `DynamicVectorVisualizer` to `VectorVisualizer`.
- Vectors and Sensors are now STK Cesium-only features.
- Improved reference documentation for `CustomSensorVolume`.
- Added `ConicSensor` type.
- `ConicSensorVisualizer` data source now utilizes `ConicSensor` for rendering.
- Added `CustomPatternSensorGraphics` and `CustomPatternSensorVisualizer`.
- Opaque sensors now render correctly when inside the sensor volume.

## Beta Releases

## b30 - 2014-07-01

- Reduced the number of facets used to approximate the conic sensor in order to avoid exceeding the number of uniforms allowed for the fragment shader.
- Fixed issue which caused visual artifacts for sensors located on the surface of the ellipsoid.
- Fixed issue with `DynamicConeVisualizerUsingCustomSensor` initialization for spherical and hemispherical cones.
- Fixed issue where the complete ellipsoid horizon surface would not render correctly.
- Fixed issue where changes to the `CustomSensorVolume` definition made when in 2D mode would not be reflected when the scene was changed to 3D.
- Fixed `DynamicConeVisualizerUsingCustomSensor` so that changes to the sensor definition would be correctly reflected.
- Improved reference documentation for `RectangularPyramidSensorVolume`.
- Added `debugShowBoundingVolume` property to `RectangularPyramidSensorVolume` and `CustomSensorVolume`.

## b29 - 2014-06-02

- Breaking changes:
  - Replaced `CustomSensorVolume` `setDirections`/`getDirections` with a `directions` property.
  - Renamed `material` property of `CustomSensorVolume` and `RectangularPyramidSensorVolume` to `lateralSurfaceMaterial`.
- Added sensor rendering support to 2D and Columbus View modes.
- Added `showEllipsoidSurfaces`, and `ellipsoidSurfaceMaterial` properties to `CustomSensorVolume`, `RectangularPyramidSensorVolume`, `DynamicCone`, and `DynamicPyramid`.
- Added `showLateralSurfaces`, `showEllipsoidHorizonSurfaces`, and `showDomeSurfaces` properties to `CustomSensorVolume`, `RectangularPyramidSensorVolume`, `DynamicCone`, and `DynamicPyramid`.
- Fixed incorrect ellipsoid horizon surface rendering for non-convex custom sensor volumes.
- Improved `DynamicConeVisualizerUsingCustomSensor` implementation for 90 degree halfangle outer cone.

## b28 - 2014-05-01

- Breaking changes:
  - Removed `DynamicVector.width`.
- Added support for non-convex `CustomSensorVolume` visualization.
- Added `Vector` for visualizing 3D vectors including maintaining a minimal pixel length.
- Added `FanGeometry`, `FanOutlineGeometry`, and `DynamicFan`. A Fan is defined by an origin and list of directions. This is useful for drawing static projected shapes such as azimuth elevation masks and body masks.
- Fixed crash when computing sensor horizon crossings in tangential edge case.

## b27 - 2014-04-01

- Fixed artifact with ray-cast sensor surfaces and multiple frustum rendering.
- Fixed alpha blending issue for sensor surface facets.
- Sensor lateral and ellipsoid horizon surface texture coordinates are now correctly mapped to normalized polar coordinates.
- Sensor dome texture coordinates are now correctly mapped to a spherical surface.
- Fixed crash which prevented sensor dome and ellipsoid horizon surface materials from being changed after initial creation.
- Fixed bug caused by undefined render state in sensor dome and ellipsoid horizon surface facets when the sensor definition was changed.

## b26 - 2014-03-03

- Breaking changes:
  - Removed `SensorVolumeCollection` type. Sensors should now be added directly to the `Scene` primitives collection.
  - Renamed `DynamicCone.capMaterial` to `DynamicCone.domeSurfaceMaterial` and `DynamicCone.outerMaterial` to `DynamicCone.material`
  - Removed `DynamicCone.innerMaterial` and , which were no longer being used.
- Added shading of dome facets to `CustomSensorVolume` and `RectangularPyramidSensorVolume`.
- Added `domeSurfaceMaterial` property to `CustomSensorVolume`, `RectangularPyramidSensorVolume`, `DynamicCone`, `DynamicConeVisualizerUsingCustomSensor`, `DynamicPyramid`, and `DynamicPyramidVisualizer`.
- Moved computation of some geometric parameters from the shader code. The parameters are now passed as uniforms.

## b25 - 2014-02-03

- No update.

## b24 - 2014-01-09

- Breaking changes:
  - `RectangularPyramidSensorVolume` xHalfAngle and yHalfAngle values were interpreted incorrectly. They now correctly affect the x-width and y-width of the sensor model.
  - Renamed `DynamicCone` `silhouetteMaterial` property to `ellipsoidHorizonSurfaceMaterial`.
- Added shading of ellipsoid horizon facets to `CustomSensorVolume` and `RectangularPyramidSensorVolume`.
- Added `ellipsoidHorizonSurfaceMaterial` property to `CustomSensorVolume` and `RectangularPyramidSensorVolume`.
- Added `portionToDisplay` property to `CustomSensorVolume` and `RectangularPyramidSensorVolume`.
