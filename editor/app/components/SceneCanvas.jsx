// app/components/SceneCanvas.jsx
"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei"; // Import Grid from drei
import useSceneStore from "../hooks/useSceneStore";

const SceneCanvas = () => {
  const objects = useSceneStore((state) => state.objects);
  const selectObject = useSceneStore((state) => state.selectObject);

  return (
    <Canvas camera={{ position: [0, 2, 5] }}>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <OrbitControls />

      {/* Grid Helper */}
      <Grid args={[10, 10]} cellColor={"gray"} sectionColor={"white"} fadeDistance={10} />

      {/* Objects in the scene */}
      {objects.map((obj, index) => (
        <mesh key={index} position={obj.position} onClick={() => selectObject(obj.id)}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      ))}
    </Canvas>
  );
};

export default SceneCanvas;
