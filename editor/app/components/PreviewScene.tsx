"use client";
import React from "react";
import Scene from "../../src/components/Scene/Scene";

interface SceneData {
  objects?: any[];
  observationPoints?: any[];
  selectedAssetId?: string;
  selectedLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}

const PreviewScene = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
  isPublishMode = false,
}: {
  initialSceneData: SceneData;
  renderObservationPoints?: boolean;
  onSceneDataChange?: any;
  enableXR?: boolean;
  isPublishMode?: boolean;
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <Scene
        initialSceneData={initialSceneData}
        renderObservationPoints={renderObservationPoints}
        onSceneDataChange={onSceneDataChange}
        enableXR={enableXR}
        isPublishMode={isPublishMode}
      />
    </div>
  );
};

export default PreviewScene;
