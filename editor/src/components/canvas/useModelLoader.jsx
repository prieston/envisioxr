// src/hooks/useModelLoader.js
"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Rhino3dmLoader } from "three/addons/loaders/3DMLoader.js"; // or from 'three/examples/jsm/loaders/3DMLoader.js' if needed

export default function useModelLoader(url, type = "glb") {
  if (type === "3dm") {
    return useLoader(Rhino3dmLoader, url, (loader) => {
      // Set the library path to a CDN so that the loader can find rhino3dm.js
      loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/");
      // Ensure the file is loaded as binary data (ArrayBuffer)
      if (loader.fileLoader && typeof loader.fileLoader.setResponseType === "function") {
        loader.fileLoader.setResponseType("arraybuffer");
      }
    });
  }
  return useLoader(GLTFLoader, url);
}
