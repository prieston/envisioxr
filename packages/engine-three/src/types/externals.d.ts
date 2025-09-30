declare module "three";
declare module "three/examples/jsm/loaders/DRACOLoader.js" {
  export class DRACOLoader {
    setDecoderPath(path: string): this;
  }
}

declare module "3d-tiles-renderer/plugins" {
  export class CesiumIonAuthPlugin {
    constructor(options: any);
  }
  export class TilesFadePlugin {
    constructor(options?: any);
  }
  export class TileCompressionPlugin {
    constructor(options?: any);
  }
  export class GLTFExtensionsPlugin {
    constructor(options: any);
  }
}
