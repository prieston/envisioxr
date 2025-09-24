"use client";

import React from "react";
import useSceneStore from "../../../app/hooks/useSceneStore";
import { SceneObjectsProps, Model as ModelType } from "./types";
import Model from "../Model";

const SceneObjects: React.FC<SceneObjectsProps> = ({
  objects,
  previewMode,
  isPublishMode = false,
}) => {
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const selectObject = useSceneStore((state) => state.selectObject);

  return (
    <>
      {objects.map(
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
              iotProperties={obj.iotProperties}
            />
          )
      )}
    </>
  );
};

export default SceneObjects;
