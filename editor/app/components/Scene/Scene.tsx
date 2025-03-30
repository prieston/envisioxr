"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

interface SceneProps {
  initialSceneData: any;
  renderObservationPoints?: boolean;
  onSceneDataChange?: (data: any) => void;
  enableXR?: boolean;
}

const Scene: React.FC<SceneProps> = ({
  initialSceneData,
  renderObservationPoints = true,
  onSceneDataChange,
  enableXR = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf0f0f0, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    const transformControls = new TransformControls(
      camera,
      renderer.domElement
    );
    transformControls.addEventListener("dragging-changed", (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Add multiple directional lights for better coverage
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight2.position.set(-1, 1, -1);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight3.position.set(0, 1, 0);
    scene.add(directionalLight3);

    // Add hemisphere light for better ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemisphereLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Handle initial scene data
  useEffect(() => {
    if (!sceneRef.current || !initialSceneData) return;

    // Clear existing objects
    while (sceneRef.current.children.length > 0) {
      const object = sceneRef.current.children[0];
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        object.material.dispose();
      }
      sceneRef.current.remove(object);
    }

    // Add objects from initialSceneData
    if (initialSceneData.objects) {
      initialSceneData.objects.forEach((obj: any) => {
        if (obj.url) {
          // Load GLB model
          const loader = new GLTFLoader();
          loader.load(
            obj.url,
            (gltf) => {
              const model = gltf.scene;
              model.position.set(...obj.position);
              if (obj.rotation) {
                model.rotation.set(...obj.rotation);
              }
              if (obj.scale) {
                model.scale.set(...obj.scale);
              }
              sceneRef.current?.add(model);
            },
            undefined,
            (error) => {
              console.error("Error loading model:", error);
            }
          );
        }
      });
    }
  }, [initialSceneData]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default Scene;
