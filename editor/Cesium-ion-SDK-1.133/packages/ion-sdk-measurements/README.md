# @cesiumgs/ion-sdk-measurements

![Cesium](https://github.com/CesiumGS/cesium/wiki/logos/Cesium_Logo_Color.jpg)

Extend your CesiumJS-based apps with additional widgets for 3D visualization and analysis.

[CesiumJS](https://github.com/CesiumGS/cesium) is a JavaScript library for creating 3D globes and 2D maps in a web browser without a plugin. It uses WebGL for hardware-accelerated graphics, and is cross-platform, cross-browser, and tuned for dynamic-data visualization.

---

[**Docs**](https://cesium.com/learn/ion-sdk/ref-doc/) :earth_americas: [**Website**](https://cesium.com/platform/cesiumjs/ion-sdk/) :earth_africa: [**Forum**](https://community.cesium.com/) :earth_asia: [**User Stories**](https://cesium.com/user-stories/)

---

## Install with npm

### Local path

`@cesiumgs/ion-sdk-measurements` can be installed to an npm project with [a local path](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#local-paths).

```sh
npm install --save <PATH_TO_DOWNLOAD>
```

### npm registry

`@cesiumgs/ion-sdk-measurements` can be published to [an internal or private registry](https://docs.npmjs.com/cli/v8/using-npm/registry).

Once `@cesiumgs/ion-sdk-measurements` is published to an internal registry, those with access can install as usual.

```sh
npm install --save @cesiumgs/ion-sdk-measurements
```

## Usage

`@cesiumgs/ion-sdk-measurements` is published as an IIFE, and as ESM modules with full typing support.

### ESM modules

Import individual modules to benefit from tree shaking optimizations through most build tools:

```js
import {
  Cartesian3,
  Color,
  StripeMaterialProperty,
  Quaternion,
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import {
  viewerMeasureMixin,
  MeasureUnits,
  DistanceUnits,
  AreaUnits,
  VolumeUnits,
} from "@cesiumgs/ion-sdk-measurements";
import "@cesium/widgets/Source/widgets.css";
import "@cesiumgs/ion-sdk-measurements/Build/IonSdkMeasurements/widgets.css";

const viewer = new Viewer("cesiumContainer");

viewer.extend(viewerMeasureMixin, {
  units: new MeasureUnits({
    distanceUnits: DistanceUnits.METERS,
    areaUnits: AreaUnits.SQUARE_METERS,
    volumeUnits: VolumeUnits.CUBIC_METERS,
  }),
});
```

### IIFE

An IIFE is available as a minified script for production, or an unminified script for development at `Build/IonSdkMeasurements` or `Build/IonSdkMeasurementsUnminified` respectively.

Include the script tag for Cesium ion SDK Measurements _after_ the CesiumJS script tag.

#### Minified

```html
<script src="<PATH_TO_CESIUMJS>/Build/Cesium/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_ION_SDK_MEASUREMENTS>/Build/IonSdkMeasurements/IonSdkMeasurements.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
<link
  href="<PATH_TO_CESIUMGS_ION_SDK_MEASUREMENTS>/Build/IonSdkMeasurements/widgets.css"
  rel="stylesheet"
/>
```

#### Unminified

```html
<script src="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_ION_SDK_MEASUREMENTS>/Build/IonSdkMeasurementsUnminified/IonSdkMeasurements.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Widgets/widgets.css"
  rel="stylesheet"
/>
<link
  href="<PATH_TO_CESIUMGS_ION_SDK_MEASUREMENTS>/Build/IonSdkMeasurementsUnminified/widgets.css"
  rel="stylesheet"
/>
```

```js
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

viewer.extend(IonSdkMeasurements.viewerMeasureMixin, {
  units: new IonSdkMeasurements.MeasureUnits({
    distanceUnits: IonSdkMeasurements.DistanceUnits.METERS,
    areaUnits: IonSdkMeasurements.AreaUnits.SQUARE_METERS,
    volumeUnits: IonSdkMeasurements.VolumeUnits.CUBIC_METERS,
  }),
});
```

Use any specific ion widgets classes from that global via the `IonSdkMeasurements` global variable, ie. `IonSdkMeasurements.viewerMeasureMixin` or `const { viewerMeasureMixin } = IonSdkMeasurements`.

### Pre-bundled ESM

Pre-bundled ESM is available as a minified script for production, or an unminified script for development at `Build/IonSdkMeasurements` or `Build/IonSdkMeasurementsUnminified` respectively.

Import Cesium Sensors _after_ importing CesiumJS.

```js
import { Viewer } from "<PATH_TO_CESIUMJS>/Build/Cesium/index.js";
import { Vector } from "<PATH_TO_CESIUM_SENORS>/Build/IonSdkMeasurements/index.js";
```

If using pre-bundled ESM without build tooling, you will need to use [import maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps) to resolve the `cesium` peer dependency.

```html
<script type="importmap">
  {
    "imports": {
      "@cesium/engine": "<PATH_TO_CESIUMJS>/Build/Cesium/index.js",
      "@cesium/widgets": "<PATH_TO_CESIUMJS>/Build/Cesium/index.js"
    }
  }
</script>
```

## Extra assets

Regardless how you install and include the script there are a few asset files that also need to be hosted/accessible for the ion sdk measurements to work. These should follow a similar approach to how you include static files for OSS CesiumJS.

- `[CESIUM_BASE_URL]/Widgets` should include the files in `<PATH_TO_CESIUMGS_ION_SDK_MEASUREMENTS>/Build/IonSdkMeasurements/IonSdkMeasurements`

### API

For the full API offered by this package, see [API Reference Documentation](https://cesium.com/learn/ion-sdk/ref-doc/).

## Community

Have questions? Ask them on the [community forum](https://community.cesium.com/).

Interested in contributing? See [CONTRIBUTING.md](https://github.com/CesiumGS/cesium/blob/main/CONTRIBUTING.md). :heart:

## License

See [sla-cesium-ion-components.pdf]("./sla-cesium-ion-components.pdf").

## Development

### Scripts

#### Build

```sh
npm run build --workspace @cesiumgs/ion-sdk-measurements
```

#### Generate TypeScript definitions

```sh
npm run build-ts --workspace @cesiumgs/ion-sdk-measurements
```

#### Run tests

```sh
npm run test --workspace @cesiumgs/ion-sdk-measurements
```

#### Run coverage report

```sh
npm run coverage --workspace @cesiumgs/ion-sdk-measurements
```
