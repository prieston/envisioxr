"use client";

import React from "react";
import { useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();

  // Calculate dynamic opacity: when progress is 100, opacity becomes 0
  const dynamicOpacity = 1 - progress / 100;

  return (
    <div
      className="loader"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "3px",
        background: "transparent",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: `linear-gradient(90deg, rgba(107, 156, 216, ${dynamicOpacity * 0.8}), rgba(107, 156, 216, ${dynamicOpacity}))`,
          transition: "width 0.2s ease-out, background 0.2s ease-out",
          borderRadius: "0 0 2px 2px",
        }}
      />
    </div>
  );
};

export default Loader;
