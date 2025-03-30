"use client";

import React from "react";
import dynamic from "next/dynamic";

interface SceneProps {
  initialSceneData: any;
  onSceneDataChange?: (data: any) => void;
  renderObservationPoints?: boolean;
  enableXR?: boolean;
}

// Import your Scene dynamically (with SSR disabled)
const Scene = dynamic<SceneProps>(
  () => import("../../../src/components/Scene/Scene"),
  {
    ssr: false,
  }
);

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
  return (
    <div
      style={{
        width: "100%",
        height: "100%", // Takes full height of its container
        display: "flex",
        flexGrow: 1,
        overflow: "hidden",
      }}
    >
      <Scene
        initialSceneData={initialSceneData}
        onSceneDataChange={onSceneDataChange}
        renderObservationPoints={renderObservationPoints}
      />
    </div>
  );
};

export default SceneCanvas;
