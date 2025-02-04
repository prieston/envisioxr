"use client";
import React from "react";
import Scene from "@/components/Scene/Scene";

const PreviewScene = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
}: {
  initialSceneData: any;
  renderObservationPoints?: boolean;
  onSceneDataChange?: any;
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
      />
    </div>
  );
};

export default PreviewScene;
