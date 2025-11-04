"use client";
import React from "react";
import Scene, { SceneProps } from "@envisio/engine-three";
import dynamic from "next/dynamic";
import { useWorldStore } from "@envisio/core";

const CesiumViewer = dynamic(
  () => import("@envisio/engine-cesium").then(m => m.CesiumViewer),
  { ssr: false }
);

type SceneData = NonNullable<SceneProps["initialSceneData"]>;

const PreviewScene = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
  isPublishMode = false,
}: {
  initialSceneData: SceneData;
  renderObservationPoints?: boolean;
  onSceneDataChange?: SceneProps["onSceneDataChange"];
  enableXR?: boolean;
  isPublishMode?: boolean;
}) => {
  const engine = useWorldStore((s) => s.engine);
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
      {engine === "cesium" ? (
        <CesiumViewer />
      ) : (
        <Scene
          initialSceneData={initialSceneData}
          renderObservationPoints={renderObservationPoints}
          onSceneDataChange={onSceneDataChange}
          enableXR={enableXR}
          isPublishMode={isPublishMode}
        />
      )}
    </div>
  );
};

export default PreviewScene;
