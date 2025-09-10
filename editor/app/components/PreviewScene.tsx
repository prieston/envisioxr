"use client";
import React from "react";
import Scene from "../../src/components/Scene/Scene";
import dynamic from "next/dynamic";
import useWorldStore from "../hooks/useWorldStore";

const CesiumViewer = dynamic(() => import("./CesiumViewer"), { ssr: false });

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
