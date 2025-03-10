"use client";

import React from "react";
import { useProgress } from "@react-three/drei";

const Loader = () => {
  const { progress } = useProgress();
  console.log("Loading progress:", progress); // Verify progress updates in console

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
        height: "4px", // Thin progress bar
        background: "transparent",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: `rgba(0, 123, 255, ${dynamicOpacity})`, // Blue color with dynamic opacity
          transition: "width 0.2s ease-out, background 0.2s ease-out",
        }}
      />
    </div>
  );
};

export default Loader;
