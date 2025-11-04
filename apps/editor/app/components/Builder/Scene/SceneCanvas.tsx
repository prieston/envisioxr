"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWorldStore, useSceneStore } from "@envisio/core";
import PlaybackManager from "./PlaybackManager";

const Scene = dynamic(() => import("@envisio/engine-three"), {
  ssr: false,
});
const CesiumViewer = dynamic(
  () => import("@envisio/engine-cesium").then(m => m.CesiumViewer),
  { ssr: false }
);
const CesiumObjectTransformEditor = dynamic(
  () =>
    import("@envisio/engine-cesium").then((m) => ({
      default: m.CesiumObjectTransformEditor,
    })),
  { ssr: false }
);
// ViewshedAnalysis is rendered within the Cesium engine viewer; do not render here to avoid duplication

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
  const selectedObject = useSceneStore((s) => s.selectedObject);

  return (
    <>
      {/* Playback Manager - handles automatic observation cycling */}
      <PlaybackManager />

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
          <>
            <CesiumViewer />
            {selectedObject && (
              <CesiumObjectTransformEditor selectedObject={selectedObject} />
            )}
            {/* ViewshedAnalysis is handled by CesiumViewer to ensure single source of render */}
          </>
        ) : (
          <Scene
            initialSceneData={initialSceneData}
            onSceneDataChange={onSceneDataChange}
            renderObservationPoints={renderObservationPoints}
          />
        )}
      </div>
    </>
  );
};

export default SceneCanvas;
