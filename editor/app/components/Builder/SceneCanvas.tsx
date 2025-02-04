"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import your Scene dynamically (with SSR disabled)
const Scene = dynamic(() => import("@/components/Scene/Scene"), {
  ssr: false,
});

const SceneCanvas = ({
  initialSceneData,
  onSceneDataChange,
  renderObservationPoints,
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
