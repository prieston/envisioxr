// app/components/SceneCanvas.jsx
"use client";

import React from "react";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("@/components/canvas/Scene"), { ssr: false });

const SceneCanvas = () => {
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
      <Scene />
    </div>
  );
};

export default SceneCanvas;
