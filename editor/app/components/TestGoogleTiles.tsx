"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Html, Stats } from "@react-three/drei";
import dynamic from "next/dynamic";

// Create a dynamic import for the 3D Tiles components to ensure they're loaded client-side
const TilesComponent = dynamic(() => import("./TilesComponent.tsx"), {
  ssr: false,
  loading: () => (
    <Html center>
      <div
        style={{
          color: "white",
          background: "rgba(0,0,0,0.7)",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        Loading 3D Tiles components...
      </div>
    </Html>
  ),
});

export default function Test3DTiles() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas
        camera={{
          position: [1000, 1000, 1000],
          near: 1,
          far: 1e9,
          fov: 45,
        }}
        gl={{ antialias: true }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Suspense
          fallback={
            <Html center>
              <div
                style={{
                  color: "white",
                  background: "rgba(0,0,0,0.7)",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                Loading...
              </div>
            </Html>
          }
        >
          <TilesComponent apiKey={process.env.NEXT_PUBLIC_CESIUM_ION_KEY} />
        </Suspense>
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={500}
          maxDistance={10000}
        />
        <Environment preset="sunset" background />
        <Stats />
      </Canvas>
    </div>
  );
}
