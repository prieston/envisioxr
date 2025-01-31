// src/components/canvas/Scene.jsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Preload, Grid, OrbitControls } from "@react-three/drei"; // Import OrbitControls for camera
import { r3f } from "@/helpers/global";
import * as THREE from "three";

export default function Scene({ ...props }) {
  return (
    <Canvas
      {...props}
      camera={{ position: [0, 5, 10], fov: 50 }} // Adjust camera position
      onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}
    >
      {/* OrbitControls to move the camera */}
      <OrbitControls />

      {/* Fix Grid Centering */}
      <Grid
        position={[0, 0, 0]} // Ensure it's at the center
        args={[20, 20]} // [size, divisions] - Increase size if needed
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        fadeDistance={100} // Ensure fading doesn't hide it
        sectionColor={[1, 1, 1]} // White lines
        cellColor={[0.5, 0.5, 0.5]} // Lighter gray minor grid
      />

      {/* Scene Objects */}
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
}
