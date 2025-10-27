"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWorldStore, useSceneStore } from "@envisio/core";
import PlaybackManager from "./PlaybackManager";

const Scene = dynamic(() => import("@envisio/engine-three"), {
  ssr: false,
});
const CesiumViewer = dynamic(() => import("@envisio/engine-cesium"), {
  ssr: false,
});
const CesiumObjectTransformEditor = dynamic(
  () =>
    import("@envisio/engine-cesium").then((m) => ({
      default: m.CesiumObjectTransformEditor,
    })),
  { ssr: false }
);
const ViewshedAnalysis = dynamic(
  () =>
    import("@envisio/ion-sdk").then((m) => ({
      default: m.ViewshedAnalysis,
    })),
  { ssr: false }
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
  const engine = useWorldStore((s) => s.engine);
  const selectedObject = useSceneStore((s) => s.selectedObject);
  const objects = useSceneStore((s) => s.objects);
  const cesiumViewer = useSceneStore((s) => s.cesiumViewer);
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
            {Array.isArray(objects)
              ? objects
                  .filter(
                    (obj: any) =>
                      obj?.isObservationModel && obj?.observationProperties
                  )
                  .map((obj: any) => (
                    <ViewshedAnalysis
                      key={`ion-viewshed-${obj.id}`}
                      position={
                        (obj.position || [0, 0, 0]) as [number, number, number]
                      }
                      rotation={
                        (obj.rotation || [0, 0, 0]) as [number, number, number]
                      }
                      observationProperties={obj.observationProperties as any}
                      objectId={obj.id}
                      cesiumViewer={cesiumViewer}
                    />
                  ))
              : null}
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
