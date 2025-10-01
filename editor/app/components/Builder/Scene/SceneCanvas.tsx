"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWorldStore } from "@envisio/core";

const Scene = dynamic(() => import("@envisio/engine-three"), {
  ssr: false,
});
const CesiumViewer = dynamic(() => import("@envisio/engine-cesium"), {
  ssr: false,
});

interface SceneCanvasProps {
  initialSceneData: any;
  onSceneDataChange?: (data: any) => void;
  renderObservationPoints?: boolean;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({
  initialSceneData,
  onSceneDataChange,
  renderObservationPoints = true,
}) => {
  const engine = useWorldStore((s) => s.engine);
  return (
    <div
      style={{
        width: "100%",
        height: "100%", // Takes full height of its container
        display: "flex",
        flexGrow: 1,
        overflow: "hidden",
        pointerEvents: "auto", // Allow panning and interaction with the canvas
      }}
    >
      {engine === "cesium" ? (
        <CesiumViewer />
      ) : (
        <Scene
          initialSceneData={initialSceneData}
          onSceneDataChange={onSceneDataChange}
          renderObservationPoints={renderObservationPoints}
        />
      )}
    </div>
  );
};

export default SceneCanvas;
