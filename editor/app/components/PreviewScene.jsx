"use client";
import React from "react";
import Scene from "@/components/canvas/Scene";

const PreviewScene = ({ initialSceneData }) => {
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
      <Scene initialSceneData={initialSceneData} />
    </div>
  );
};

export default PreviewScene;
