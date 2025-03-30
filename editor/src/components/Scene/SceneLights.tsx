"use client";

import React from "react";

const SceneLights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <hemisphereLight
        intensity={0.5}
        groundColor="#444444"
        position={[0, 50, 0]}
      />
    </>
  );
};

export default SceneLights;
