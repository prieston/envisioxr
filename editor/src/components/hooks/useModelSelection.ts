import { useRef } from "react";
import * as THREE from "three";

const CLICK_THRESHOLD = 5;

interface UseModelSelectionProps {
  id: string;
  onSelect: ((id: string, object: THREE.Object3D) => void) | null;
  previewMode: boolean;
}

export const useModelSelection = ({
  id,
  onSelect,
  previewMode,
}: UseModelSelectionProps) => {
  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (previewMode || !onSelect) return;
    pointerDown.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (previewMode || !onSelect || !pointerDown.current) return;
    const dx = e.clientX - pointerDown.current.x;
    const dy = e.clientY - pointerDown.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < CLICK_THRESHOLD) {
      onSelect(id, e.object);
    }
    pointerDown.current = null;
  };

  return {
    handlePointerDown,
    handlePointerUp,
  };
};
