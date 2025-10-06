import * as THREE from "three";

export function detectModelFrontDirection(model: THREE.Object3D): {
  frontAxis: "x" | "y" | "z" | "negX" | "negY" | "negZ";
  confidence: number;
  boundingBox: THREE.Box3;
} {
  if (!model) {
    return { frontAxis: "z", confidence: 0, boundingBox: new THREE.Box3() };
  }

  const boundingBox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  const meshes: THREE.Mesh[] = [];
  model.traverse((child) => {
    if ((child as any) instanceof THREE.Mesh) {
      meshes.push(child as THREE.Mesh);
    }
  });

  if (meshes.length === 0) {
    return { frontAxis: "z", confidence: 0.5, boundingBox };
  }

  const vertexPositions: THREE.Vector3[] = [];
  meshes.forEach((mesh) => {
    const positionAttribute = mesh.geometry?.getAttribute("position");
    if (positionAttribute) {
      mesh.updateMatrixWorld(true);
      const matrix = mesh.matrixWorld.clone();
      for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute as any, i);
        vertex.applyMatrix4(matrix);
        vertexPositions.push(vertex);
      }
    }
  });

  if (vertexPositions.length === 0) {
    return { frontAxis: "z", confidence: 0.5, boundingBox };
  }

  const xRange =
    Math.max(...vertexPositions.map((v) => v.x)) -
    Math.min(...vertexPositions.map((v) => v.x));
  const yRange =
    Math.max(...vertexPositions.map((v) => v.y)) -
    Math.min(...vertexPositions.map((v) => v.y));
  const zRange =
    Math.max(...vertexPositions.map((v) => v.z)) -
    Math.min(...vertexPositions.map((v) => v.z));

  const ranges = [
    { axis: "x" as const, range: xRange },
    { axis: "y" as const, range: yRange },
    { axis: "z" as const, range: zRange },
  ].sort((a, b) => b.range - a.range);

  const longestAxis = ranges[0].axis;
  let frontAxis: "x" | "y" | "z" | "negX" | "negY" | "negZ" = "z";
  let confidence = 0.5;

  if (longestAxis === "z") {
    const zCenter = center.z;
    const zMin = Math.min(...vertexPositions.map((v) => v.z));
    const zMax = Math.max(...vertexPositions.map((v) => v.z));
    frontAxis =
      Math.abs(zCenter - zMin) > Math.abs(zCenter - zMax) ? "z" : "negZ";
    confidence = 0.8;
  } else if (longestAxis === "x") {
    const xCenter = center.x;
    const xMin = Math.min(...vertexPositions.map((v) => v.x));
    const xMax = Math.max(...vertexPositions.map((v) => v.x));
    frontAxis =
      Math.abs(xCenter - xMin) > Math.abs(xCenter - xMax) ? "x" : "negX";
    confidence = 0.7;
  } else if (longestAxis === "y") {
    frontAxis = "z";
    confidence = 0.6;
  }

  return { frontAxis, confidence, boundingBox };
}

export function getRotationOffsetForFrontAxis(frontAxis: string): {
  heading: number;
  pitch: number;
  roll: number;
} {
  switch (frontAxis) {
    case "x":
      return { heading: Math.PI / 2, pitch: -Math.PI / 2, roll: 0 };
    case "negX":
      return { heading: -Math.PI / 2, pitch: -Math.PI / 2, roll: 0 };
    case "y":
      return { heading: 0, pitch: 0, roll: 0 };
    case "negY":
      return { heading: 0, pitch: Math.PI, roll: 0 };
    case "z":
      return { heading: 0, pitch: -Math.PI / 2, roll: 0 };
    case "negZ":
      return { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 };
    default:
      return { heading: 0, pitch: -Math.PI / 2, roll: 0 };
  }
}

export function applyModelFrontDirection(
  baseRotation: [number, number, number],
  model: THREE.Object3D | null,
  alignWithModelFront: boolean,
  manualFrontDirection?: "x" | "y" | "z" | "negX" | "negY" | "negZ"
): [number, number, number] {
  if (!alignWithModelFront) return baseRotation;

  const frontAxis = manualFrontDirection
    ? manualFrontDirection
    : model
      ? detectModelFrontDirection(model).frontAxis
      : "z";

  const offset = getRotationOffsetForFrontAxis(frontAxis);
  return [
    baseRotation[0] + offset.heading,
    baseRotation[1] + offset.pitch,
    baseRotation[2] + offset.roll,
  ];
}
