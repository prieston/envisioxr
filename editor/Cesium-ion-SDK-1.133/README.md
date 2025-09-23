# Cesium ion SDK

![Cesium](https://github.com/CesiumGS/cesium/wiki/logos/Cesium_Logo_Color.jpg)

The Cesium ion SDK JavaScript library extends the open source CesiumJS JavaScript library and includes additional GPU-accelerated 3D analysis tools and ready-to-use UI widgets.

---

[**Docs**](https://cesium.com/learn/cesiumjs-learn/cesium-ion-sdk/) :earth_americas: [**Website**](https://cesium.com/platform/cesiumjs/ion-sdk/) :earth_africa: [**Forum**](https://community.cesium.com/) :earth_asia: [**User Stories**](https://cesium.com/user-stories/)

---

## :rocket: Get started

Visit the [Downloads page](https://cesium.com/downloads/) to download a pre-built copy of the Cesium ion SDK, or download individually packed node modules.

### zip

After downloading and unzipping the pre-built zip, run:

```sh
npm install
npm start
```

and navigate to `//localhost:8080` to access documentation and code examples.

Pre-built versions of the library are available in the `Build` directory of each package, and are designed to be imported after CesiumJS has been imported. For example:

```html
<script src="<PATH_TO_CESIUMJS>/Build/Cesium/Cesium.js"></script>
<script src="<PATH_TO_CESIUM_ION_SDK>/packages/IonSdkSensors/Build/IonSdkSensors/IonSdkSensors.js>"></script>
<link
  href="<PATH_TO_CESIUMJS>/Build/Cesium/Widgets/widgets.css"
  rel="stylesheet"
/>
<script>
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
</script>
```

See the [Build Guide](./Documentation/BuildGuide/) for more information.

### npm & yarn

If you’re building your application using a module bundler such as Webpack, Parcel, or Rollup, you can install the Cesium ion packages available on the [Downloads page](https://cesium.com/downloads/).

After downloading, install a package to your app with the command:

```sh
npm install --save <PATH_TO_DOWNLOAD>
```

Then, import CesiumJS in your app code, followed by the package(s). Import individual modules to benefit from tree shaking optimizations through most build tools:

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

See each package for additional details.

### What next?

See our [Quickstart Guide](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/) for more information on getting a CesiumJS app up and running.

Instructions for serving local data are in the CesiumJS
[Offline Guide](./Documentation/OfflineGuide/README.md).

## :earth_americas: Where does the Global 3D Content come from?

The Cesium platform follows an [open-core business model](https://cesium.com/why-cesium/open-ecosystem/cesium-business-model/) with open source runtime engines such as CesiumJS and optional commercial subscription to Cesium ion.

CesiumJS can stream [3D content such as terrain, imagery, and 3D Tiles from the commercial Cesium ion platform](https://cesium.com/platform/cesium-ion/content/) alongside open standards from other offline or online services. We provide Cesium ion as the quickest option for all users to get up and running, but you are free to use any combination of content sources with CesiumJS that you please.

Bring your own data for tiling, hosting, and streaming from Cesium ion.
