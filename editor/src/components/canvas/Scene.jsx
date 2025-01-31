// src/components/canvas/Scene.jsx
"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, Grid, OrbitControls, useGLTF } from "@react-three/drei";
import useSceneStore from "@/hooks/useSceneStore";
import * as THREE from "three";

// Load and render models from Zustand
const Model = ({ url, position }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={position} />;
};

export default function Scene({ ...props }) {
  const objects = useSceneStore((state) => state.objects);

  return (
    <Canvas
      {...props}
      camera={{ position: [0, 5, 10], fov: 50 }}
      onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}
    >
      {/* OrbitControls to move the camera */}
      <OrbitControls />

      {/* Fix Grid Centering */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        fadeDistance={100}
        sectionColor={[1, 1, 1]}
        cellColor={[0.5, 0.5, 0.5]}
      />

      {/* Scene Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} castShadow />

      {/* Render All Models from Zustand */}
      {objects.map((obj, index) => (
        <Model key={index} url={obj.url} position={[0, 0, 0]} />
      ))}

      <Preload all />
    </Canvas>
  );
}
