"use client";
import React from "react";
import Scene from "@/components/Scene/Scene";

const PreviewScene = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
}: {
  initialSceneData: any;
  renderObservationPoints?: boolean;
  onSceneDataChange?: any;
  enableXR?: boolean;
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
      />
    </div>
  );
};

export default PreviewScene;
