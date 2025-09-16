import { GeometryInstance } from "@cesium/engine";
import { FanGeometry, FanOutlineGeometry } from "@cesiumgs/ion-sdk-geometry";

// Verify GeometryInstance can be take XXXGeometry objects.
let geometryInstance: GeometryInstance;

geometryInstance = new GeometryInstance({
  geometry: new FanGeometry({ directions: [] }),
});

geometryInstance = new GeometryInstance({
  geometry: new FanOutlineGeometry({ directions: [] }),
});
