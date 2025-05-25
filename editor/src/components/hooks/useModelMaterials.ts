import { useEffect } from "react";
import * as THREE from "three";

interface UseModelMaterialsProps {
  modelRef: React.RefObject<THREE.Object3D>;
  selected: boolean;
  previewMode: boolean;
}

export const useModelMaterials = ({
  modelRef,
  selected,
  previewMode,
}: UseModelMaterialsProps) => {
  useEffect(() => {
    if (modelRef.current && !previewMode) {
      modelRef.current.traverse((child) => {
        // @ts-expect-error-next-line - ignore type error
        if (child.isMesh && child.material) {
          // Set emissive to highlight color if selected, otherwise reset to black.
          // @ts-expect-error-next-line - ignore type error
          child.material.emissive = selected
            ? new THREE.Color(0x00ffff)
            : new THREE.Color(0x000000);
        }
      });
    }
  }, [selected, previewMode, modelRef]);
};
