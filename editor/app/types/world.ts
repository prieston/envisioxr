export type Engine = 'three' | 'cesium';

export interface World {
  id: string;
  title: string;
  description?: string;
  sceneData: any;
  engine: Engine;
}
