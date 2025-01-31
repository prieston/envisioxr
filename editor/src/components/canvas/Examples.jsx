'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'

export function Monument({ setModelLoaded, opacity = 1, ...props }) {
  const { scene } = useGLTF('https://prieston-prod.fra1.cdn.digitaloceanspaces.com/firefly/delos_dionisos.glb');

  useEffect(() => {
    if (setModelLoaded && scene) {
      setModelLoaded(true);
    }
  }, [setModelLoaded, scene]);

  useEffect(() => {
    if (scene) {
      window.scene = scene;
      let targetGroup = null;

      // Search for the object by name
      scene.traverse((child) => {
        if (child.name === "DELOS_DIONYSOS_26_04_EXPORTglb") {  // Match the name exactly
          targetGroup = child;
        }
      });

      if (targetGroup) {
        targetGroup.traverse((child) => {
          if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = opacity;
            child.material.needsUpdate = true;
          }
        });
      } else {
        console.warn("Object with name 'DELOS_DIONYSOS_26_04_EXPORTglb' not found.");
      }
    }
  }, [opacity, scene]);

  return <primitive object={scene} {...props} />;
}
