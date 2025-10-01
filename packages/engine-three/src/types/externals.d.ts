declare module "three/examples/jsm/loaders/DRACOLoader.js" {
  export class DRACOLoader {
    setDecoderPath(path: string): this;
  }
}

declare module "three/examples/jsm/loaders/GLTFLoader.js" {
  export class GLTFLoader {}
}

declare module "three/examples/jsm/loaders/3DMLoader.js" {
  export class Rhino3dmLoader {}
}

declare module "3d-tiles-renderer" {
  export class TilesRenderer {
    registerPlugin(plugin: any): void;
    setCamera(camera: any): void;
    setResolutionFromRenderer(camera: any, renderer: any): void;
    update(): void;
    addEventListener(type: string, listener: (...args: any[]) => void): void;
    errorTarget: number;
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

declare module "@envisio/core/state" {
  export const useSceneStore: any;
  export const useWorldStore: any;
}
