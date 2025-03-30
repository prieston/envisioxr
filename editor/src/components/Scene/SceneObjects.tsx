"use client";

import React from "react";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useSceneStore from "../../../app/hooks/useSceneStore";
import { SceneObjectsProps, Model as ModelType } from "./types";
import Model from "../Model";

const SceneObjects: React.FC<SceneObjectsProps> = ({
  objects,
  previewMode,
  enableXR,
  isPublishMode = false,
}) => {
  const { scene } = useThree();
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);

  return (
    <>
      {objects.map((obj: ModelType) => (
        <Model
          key={obj.id}
          id={obj.id}
          url={obj.url}
          position={obj.position}
          rotation={obj.rotation}
          scale={obj.scale}
          selected={selectedObject?.id === obj.id}
          onSelect={previewMode || isPublishMode ? null : selectObject}
        />
      ))}
    </>
  );
};

export default SceneObjects;
