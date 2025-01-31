// src/components/canvas/Scene.jsx
"use client";

import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, Grid, OrbitControls, TransformControls, useGLTF } from "@react-three/drei";
import useSceneStore from "@/hooks/useSceneStore";
import * as THREE from "three";

const Model = ({ id, url, position, scale, rotation, selected, onSelect }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef();

  // Apply selection highlighting
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive = selected ? new THREE.Color(0x00ffff) : new THREE.Color(0x000000);
        }
      });
    }
  }, [selected]);

  return (
    <primitive
      object={scene}
      ref={modelRef}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation(); // Prevents deselecting when clicking the model
        onSelect(id, modelRef.current);
      }}
    />
  );
};

export default function Scene({ ...props }) {
  const objects = useSceneStore((state) => state.objects);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const transformMode = useSceneStore((state) => state.transformMode);
  const selectObject = useSceneStore((state) => state.selectObject);
  const deselectObject = useSceneStore((state) => state.deselectObject);
  const setModelPosition = useSceneStore((state) => state.setModelPosition);
  const setModelRotation = useSceneStore((state) => state.setModelRotation);
  const setModelScale = useSceneStore((state) => state.setModelScale);

  const transformControlsRef = useRef();
  const orbitControlsRef = useRef();

  // Disable OrbitControls when an object is selected
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !selectedObject;
    }
  }, [selectedObject]);

  // Handle TransformControls object movement
  useEffect(() => {
    if (transformControlsRef.current && selectedObject) {
      const handleObjectChange = () => {
        if (selectedObject?.ref) {
          if (transformMode === "translate") {
            setModelPosition(selectedObject.id, selectedObject.ref.position);
          } else if (transformMode === "rotate") {
            setModelRotation(selectedObject.id, selectedObject.ref.rotation);
          } else if (transformMode === "scale") {
            setModelScale(selectedObject.id, selectedObject.ref.scale);
          }
        }
      };

      transformControlsRef.current.addEventListener("objectChange", handleObjectChange);

      return () => {
        transformControlsRef.current.removeEventListener("objectChange", handleObjectChange);
      };
    }
  }, [selectedObject, setModelPosition, setModelRotation, setModelScale, transformMode]);

  return (
    <Canvas
      {...props}
      camera={{ position: [0, 5, 10], fov: 50 }}
      onPointerMissed={() => deselectObject()} // Deselect when clicking empty space
    >
      {/* OrbitControls (Disabled when an object is selected) */}
      <OrbitControls ref={orbitControlsRef} />

      {/* Grid */}
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

      {/* Render All Models */}
      {objects.map((obj) => (
        <Model
          key={obj.id}
          id={obj.id}
          url={obj.url}
          position={obj.position}
          scale={obj.scale}
          rotation={obj.rotation}
          selected={selectedObject?.id === obj.id}
          onSelect={selectObject}
        />
      ))}

      {/* Transform Controls (Mode: Move, Rotate, Scale) */}
      {selectedObject && selectedObject.ref && (
        <TransformControls ref={transformControlsRef} object={selectedObject.ref} mode={transformMode} />
      )}

      <Preload all />
    </Canvas>
  );
}
