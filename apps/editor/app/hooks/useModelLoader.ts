"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// Rhino3dmLoader path may vary across three versions; keep current working import
// Three r170+ moved example loaders under examples/jsm. Rhino3dmLoader lives at:
// 'three/examples/jsm/loaders/3DMLoader.js'
import { Rhino3dmLoader } from "three/examples/jsm/loaders/3DMLoader.js";

export default function useModelLoader(
  url: string | undefined,
  type: string = "glb"
) {
  // Always call hooks unconditionally - use a dummy URL if none provided
  const dummyUrl = url || "";

  // Always call both hooks to satisfy React Hooks rules
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const rhinoResult = useLoader(Rhino3dmLoader as any, dummyUrl, (loader: any) => {
    loader.setLibraryPath("https://cdn.jsdelivr.net/npm/rhino3dm@8.4.0/");
    if (
      loader.fileLoader &&
      typeof loader.fileLoader.setResponseType === "function"
    ) {
      loader.fileLoader.setResponseType("arraybuffer");
    }
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gltfResult = useLoader(GLTFLoader as any, dummyUrl);

  // Return null if no URL provided
  if (!url) {
    console.warn("No URL provided to useModelLoader");
    return null;
  }

  // Return the appropriate result based on type
  return type === "3dm" ? rhinoResult : gltfResult;
}
