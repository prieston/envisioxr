import * as THREE from "three";

interface UseModelMaterialsProps {
  modelRef: React.RefObject<THREE.Object3D | null>;
  selected: boolean;
  previewMode: boolean;
}

export function useModelMaterials({
  modelRef,
  selected,
  previewMode,
}: UseModelMaterialsProps) {
  if (!modelRef.current) return;

  modelRef.current.traverse((child: any) => {
    if (child.isMesh && child.material) {
      child.material.transparent = true;
      child.material.opacity = selected ? 1.0 : 0.9;
    }
  });
}
