import * as THREE from "three";

export interface Model {
  id: string;
  url: string;
  type?: string;
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  ref?: THREE.Object3D;
}

export interface ObservationPoint {
  id: number;
  title: string;
  description: string;
  position: [number, number, number] | null;
  target: [number, number, number] | null;
}

export interface SceneProps {
  initialSceneData?: {
    objects?: Model[];
    observationPoints?: ObservationPoint[];
  };
  renderObservationPoints?: boolean;
  onSceneDataChange?: (data: any) => void;
  enableXR?: boolean;
  isPublishMode?: boolean;
}

export interface SceneObjectsProps {
  objects: Model[];
  previewMode: boolean;
  enableXR: boolean;
}

export interface SceneObservationPointsProps {
  points: ObservationPoint[];
  previewMode: boolean;
  enableXR: boolean;
  renderObservationPoints: boolean;
}

export interface SceneTransformControlsProps {
  selectedObject: Model | null;
  transformControlsRef: React.RefObject<any>;
}
