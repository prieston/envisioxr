"use client";

import React, { useMemo } from "react";
import { useSceneStore } from "@envisio/core";
import { SceneObjectsProps, Model as ModelType } from "./types";
import Model from "../Model";

const SceneObjects: React.FC<SceneObjectsProps> = ({
  objects,
  previewMode,
  isPublishMode = false,
}) => {
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);

  // Memoize objects list to prevent unnecessary re-renders
  const memoizedObjects = useMemo(() => {
    return objects.map(
      (obj: ModelType) =>
        obj.url && (
          <Model
            key={obj.id}
            id={obj.id}
            url={obj.url}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
            selected={selectedObject?.id === obj.id}
            onSelect={previewMode || isPublishMode ? undefined : selectObject}
            assetId={obj.assetId || undefined}
            isObservationModel={obj.isObservationModel}
            observationProperties={
              obj.observationProperties
                ? {
                    ...obj.observationProperties,
                    showViewshed: false,
                  }
                : undefined
            }
          />
        )
    );
  }, [objects, selectedObject?.id, previewMode, isPublishMode, selectObject]);

  return <>{memoizedObjects}</>;
};

export default SceneObjects;
