"use client";

import React from "react";

interface SceneLightsProps {
  ambientLightIntensity?: number;
}

const SceneLights: React.FC<SceneLightsProps> = ({
  ambientLightIntensity = 0.5,
}) => {
  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-10, 10, -5]}
        intensity={0.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
};

export default SceneLights;
