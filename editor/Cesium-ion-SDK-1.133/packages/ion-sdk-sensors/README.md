# @cesiumgs/ion-sdk-sensors

![Cesium](https://github.com/CesiumGS/cesium/wiki/logos/Cesium_Logo_Color.jpg)

`@cesiumgs/ion-sdk-sensors` is an additional package offered as part of the [Cesium ion SDK](https://cesium.com/platform/cesiumjs/ion-sdk/) for use with CesiumJS. It includes:

- `RectangularSensor`
- `ConicSensor`
- `CustomPatternSensor`

## Install with npm

### Local path

`@cesiumgs/ion-sdk-sensors` can be installed to an npm project with [a local path](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#local-paths).

```sh
npm install --save <PATH_TO_DOWNLOAD>
```

### npm registry

`@cesiumgs/ion-sdk-sensors` can be published to [an internal or private registry](https://docs.npmjs.com/cli/v8/using-npm/registry).

Once `@cesiumgs/ion-sdk-sensors` is published to an internal registry, those with access can install as usual.

```sh
npm install --save @cesiumgs/ion-sdk-sensors
```

## Usage

`@cesiumgs/ion-sdk-sensors` is published as an IIFE, and as ESM modules with full typing support.

### ESM modules

Import individual modules to benefit from tree shaking optimizations through most build tools:

```js
import {
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Color,
  Ellipsoid,
  Material,
  Matrix3,
  Matrix4,
  Material,
  Transforms,
  Frozen,
  Scene,
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { RectangularSensor } from "@cesiumgs/ion-sdk-sensors";
import "@cesium/widgets/Source/widgets.css";

const viewer = new Viewer("cesiumContainer");

function getModelMatrix(ellipsoid, cartographic, clock, cone, twist) {
  const location = ellipsoid.cartographicToCartesian(cartographic);
  const modelMatrix = Transforms.northEastDownToFixedFrame(location);
  const orientation = Matrix3.multiply(
    Matrix3.multiply(
      Matrix3.fromRotationZ(clock),
      Matrix3.fromRotationY(cone),
      new Matrix3(),
    ),
    Matrix3.fromRotationX(twist),
    new Matrix3(),
  );
  return Matrix4.multiply(
    modelMatrix,
    Matrix4.fromRotationTranslation(orientation, Cartesian3.ZERO),
    new Matrix4(),
  );
}

function addSensor(options) {
  options = options ?? Frozen.EMPTY_OBJECT;

  const longitude = options.longitude ?? 0.0;
  const latitude = options.latitude ?? 0.0;
  const radius = options.radius ?? 20000000;
  const altitude = options.altitude ?? 0.0;
  const clock = options.clock ?? 0.0;
  const cone = options.cone ?? 0.0;
  const twist = options.twist ?? 0.0;

  const lateralSurfaceMaterial = Material.fromType("Grid");
  lateralSurfaceMaterial.uniforms.color = new Color(0, 1, 1, 1);
  lateralSurfaceMaterial.uniforms.cellAlpha = 0.5;
  lateralSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 10,
  };

  const ellipsoidHorizonSurfaceMaterial = Material.fromType("Grid");
  ellipsoidHorizonSurfaceMaterial.uniforms.color = new Color(
    0.4,
    1.0,
    0.0,
    1.0,
  );
  ellipsoidHorizonSurfaceMaterial.uniforms.cellAlpha = 0.5;
  ellipsoidHorizonSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 10,
  };

  const domeSurfaceMaterial = Material.fromType("Grid");
  domeSurfaceMaterial.uniforms.color = new Color(1.0, 1.0, 0.0, 1.0);
  domeSurfaceMaterial.uniforms.cellAlpha = 0.5;
  domeSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 12,
  };

  const ellipsoidSurfaceMaterial = Material.fromType("Color");
  ellipsoidSurfaceMaterial.uniforms.color = new Color(1.0, 0.0, 1.0, 0.5);

  return viewer.scene.primitives.add(
    new RectangularSensor({
      radius: radius,
      xHalfAngle: CesiumMath.toRadians(45.0),
      yHalfAngle: CesiumMath.toRadians(45.0),
      modelMatrix: getModelMatrix(
        Ellipsoid.WGS84,
        new Cartographic(
          CesiumMath.toRadians(longitude),
          CesiumMath.toRadians(latitude),
          altitude,
        ),
        CesiumMath.toRadians(clock),
        CesiumMath.toRadians(cone),
        CesiumMath.toRadians(twist),
      ),
      lateralSurfaceMaterial,
      ellipsoidHorizonSurfaceMaterial,
      domeSurfaceMaterial,
      ellipsoidSurfaceMaterial,
    }),
  );
}

const sensor = addSensor({
  latitude: 30.0,
  longitude: -90.0,
  altitude: 3500000.0,
  radius: 20000000.0,
});
```

### IIFE

An IIFE is available as a minified script for production, or an unminified script for development at `Build/IonSdkSensors` or `Build/IonSdkSensorsUnminified` respectively.

Include the script tag for Cesium Sensors _after_ the CesiumJS script tag.

#### Minified

```html
<script src="<PATH_TO_CESIUMJS>/Build/Cesium/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_ION_SDK_SENSORS>/Build/IonSdkSensors/IonSdkSensors.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
```

#### Unminified

```html
<script src="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_ION_SDK_SENSORS>/Build/IonSdkSensorsUnminified/IonSdkSensors.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Widgets/widgets.css"
  rel="stylesheet"
/>
```

```js
const viewer = new Cesium.Viewer("cesiumContainer");

viewer.entities.add({
  position: options.center,
  orientation: orientation,
  rectangularSensor: {
    radius: options.radius,
    xHalfAngle: Cesium.Math.toRadians(options.xHalfAngle),
    yHalfAngle: Cesium.Math.toRadians(options.yHalfAngle),
    lateralSurfaceMaterial: lateralSurfaceMaterial,
    domeSurfaceMaterial: domeSurfaceMaterial,
    environmentOcclusionMaterial: environmentOcclusionMaterial,
    showLateralSurfaces: true,
    showEllipsoidHorizonSurfaces: false,
    showDomeSurfaces: true,
    showEllipsoidSurfaces: false,
    environmentConstraint: true,
    showEnvironmentOcclusion: false,
    showViewshed: true,
    classificationType: options.classificationType,
    showIntersection: false,
    showThroughEllipsoid: true,
  },
});
```

Use any specific sensors classes from that global via the `IonSdkSensors` global variable, ie. `IonSdkSensors.RectangularSensor` or `const { RectangularSensor } = IonSdkSensors`.

### Pre-bundled ESM

Pre-bundled ESM is available as a minified script for production, or an unminified script for development at `Build/IonSdkSensors` or `Build/IonSdkSensorsUnminified` respectively.

Import Cesium Sensors _after_ importing CesiumJS.

```js
import { Viewer } from "<PATH_TO_CESIUMJS>/Build/Cesium/index.js";
import { Vector } from "<PATH_TO_CESIUM_SENORS>/Build/IonSdkSensors/index.js";
```

If using pre-bundled ESM without build tooling, you will need to use [import maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps) to resolve the `cesium` peer dependency.

```html
<script type="importmap">
  {
    "imports": {
      "@cesium/engine": "<PATH_TO_CESIUMJS>/Build/Cesium/index.js"
    }
  }
</script>
```

### API

Once sensors is imported and initialized, create sensors using the Entity API or directly using the primitives.

```js
viewer.entities.add({
  position: options.center,
  orientation: orientation,
  rectangularSensor: {
    radius: options.radius,
    xHalfAngle: Cesium.Math.toRadians(options.xHalfAngle),
    yHalfAngle: Cesium.Math.toRadians(options.yHalfAngle),
    lateralSurfaceMaterial: lateralSurfaceMaterial,
    domeSurfaceMaterial: domeSurfaceMaterial,
    environmentOcclusionMaterial: environmentOcclusionMaterial,
    showLateralSurfaces: true,
    showEllipsoidHorizonSurfaces: false,
    showDomeSurfaces: true,
    showEllipsoidSurfaces: false,
    environmentConstraint: true,
    showEnvironmentOcclusion: false,
    showViewshed: true,
    classificationType: options.classificationType,
    showIntersection: false,
    showThroughEllipsoid: true,
  },
});
```

For the full API offered by this package, see [API Reference Documentation](https://cesium.com/learn/ion-sdk/ref-doc/).
