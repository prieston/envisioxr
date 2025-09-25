"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Rhino3dmLoader path may vary across three versions; keep current working import
import { Rhino3dmLoader } from "three/addons/loaders/3DMLoader.js";

export default function useModelLoader(
  url: string | undefined,
  type: string = "glb"
) {
  if (!url) {
    console.warn("No URL provided to useModelLoader");
    return null;
  }

  if (type === "3dm") {
    return useLoader(Rhino3dmLoader as any, url, (loader: any) => {
      loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/");
      if (
        loader.fileLoader &&
        typeof loader.fileLoader.setResponseType === "function"
      ) {
        loader.fileLoader.setResponseType("arraybuffer");
      }
    });
  }

  return useLoader(GLTFLoader as any, url);
}
