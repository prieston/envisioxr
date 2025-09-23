# @cesiumgs/ion-sdk-geometry

![Cesium](https://github.com/CesiumGS/cesium/wiki/logos/Cesium_Logo_Color.jpg)

`@cesiumgs/ion-sdk-geometry` is an additional geometry package offered as part of the [Cesium ion SDK](https://cesium.com/platform/cesiumjs/ion-sdk/) for use with CesiumJS. It includes:

- `Vector`
- `FanGeometry`

## Install with npm

### Local path

`@cesiumgs/ion-sdk-geometry` can be installed to an npm project with [a local path](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#local-paths).

```sh
npm install --save <PATH_TO_DOWNLOAD>
```

### npm registry

`@cesiumgs/ion-sdk-geometry` can be published to [an internal or private registry](https://docs.npmjs.com/cli/v8/using-npm/registry).

Once `@cesiumgs/ion-sdk-geometry` is published to an internal registry, those with access can install as usual.

```sh
npm install --save @cesiumgs/ion-sdk-geometry
```

## Usage

`@cesiumgs/ion-sdk-geometry` is published as an IIFE, and as ESM modules with full typing support.

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
import { Vector } from "@cesiumgs/ion-sdk-geometry";
import "@cesium/widgets/Source/widgets.css";

const viewer = new Viewer("cesiumContainer");

viewer.entities.add({
  position: new Cartesian3(
    -2356175.551050638,
    -3743953.4625439458,
    4582038.183197298,
  ),
  orientation: new Quaternion(
    -0.8122219432572747,
    -0.44852445132363405,
    -0.32651309809675877,
    0.18030676145798274,
  ),
  fan: {
    directions: directions,
    radius: 10000,
    outline: false,
    material: new StripeMaterialProperty({
      repeat: 20,
      evenColor: Color.WHITE,
      oddColor: Color.BLACK,
    }),
  },
});
```

### IIFE

An IIFE is available as a minified script for production, or an unminified script for development at `Build/IonSdkGeometry` or `Build/IonSdkGeometryUnminified` respectively.

Include the script tag for Cesium ion SDK Geometry _after_ the CesiumJS script tag.

#### Minified

```html
<script src="<PATH_TO_CESIUMJS>/Build/Cesium/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_GEOMETRIES>/Build/IonSdkGeometry/IonSdkGeometry.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
```

#### Unminified

```html
<script src="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Cesium.js"></script>
<script src="<PATH_TO_CESIUMGS_GEOMETRIES>/Build/IonSdkGeometryUnminified/IonSdkGeometry.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/CesiumUnminified/Widgets/widgets.css"
  rel="stylesheet"
/>
```

```js
const viewer = new Cesium.Viewer("cesiumContainer");

viewer.entities.add({
  position: new Cesium.Cartesian3(
    -2356175.551050638,
    -3743953.4625439458,
    4582038.183197298,
  ),
  orientation: new Cesium.Quaternion(
    -0.8122219432572747,
    -0.44852445132363405,
    -0.32651309809675877,
    0.18030676145798274,
  ),
  fan: {
    directions: directions,
    radius: 10000,
    outline: false,
    material: new Cesium.StripeMaterialProperty({
      repeat: 20,
      evenColor: Cesium.Color.WHITE,
      oddColor: Cesium.Color.BLACK,
    }),
  },
});
```

Use any specific geometry classes from that global via the `IonSdkGeometry` global variable, ie. `IonSdkGeometry.Vector` or `const { Vector } = IonSdkGeometry`.

### Pre-bundled ESM

Pre-bundled ESM is available as a minified script for production, or an unminified script for development at `Build/IonSdkGeometry` or `Build/IonSdkGeometryUnminified` respectively.

Import Cesium Geometry _after_ importing CesiumJS.

```js
import { Viewer } from "<PATH_TO_CESIUMJS>/Build/Cesium/index.js";
import { Vector } from "<PATH_TO_CESIUM_ION_SDK_GEOMETRY>/Build/IonSdkGeometry/index.js";
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

## Extra assets

Regardless how you install and include the script there are a few asset files that also need to be hosted/accessibly for the custom geometries to work. These should follow a similar approach to how you include static files for OSS CesiumJS.

- `[CESIUM_BASE_URL]/IonSdkGeometry` should include the files in `<PATH_TO_CESIUM_ION_SDK_GEOMETRY>/Build/IonSdkGeometry/IonSdkGeometry`
- `[CESIUM_BASE_URL]/IonSdkGeometryWorkers` should include the files in `<PATH_TO_CESIUM_ION_SDK_GEOMETRY>/Build/IonSdkGeometry/IonSdkGeometryWorkers`

### API

Once geometry is imported and initialized, create geometries using the Entity API or directly using the primitives.

```js
viewer.entities.add({
  position: new Cesium.Cartesian3(
    -2356175.551050638,
    -3743953.4625439458,
    4582038.183197298,
  ),
  orientation: new Cesium.Quaternion(
    -0.8122219432572747,
    -0.44852445132363405,
    -0.32651309809675877,
    0.18030676145798274,
  ),
  fan: {
    directions: directions,
    radius: 10000,
    outline: false,
    material: new Cesium.StripeMaterialProperty({
      repeat: 20,
      evenColor: Cesium.Color.WHITE,
      oddColor: Cesium.Color.BLACK,
    }),
  },
});
```

For the full API offered by this package, see [API Reference Documentation](https://cesium.com/learn/ion-sdk/ref-doc/).
