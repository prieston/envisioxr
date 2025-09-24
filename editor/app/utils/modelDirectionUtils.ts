import * as THREE from "three";

/**
 * Detect the natural front direction of a 3D model
 * This analyzes the model's geometry to determine which axis it's "facing"
 */
export function detectModelFrontDirection(model: THREE.Object3D): {
  frontAxis: "x" | "y" | "z" | "negX" | "negY" | "negZ";
  confidence: number;
  boundingBox: THREE.Box3;
} {
  if (!model) {
    return {
      frontAxis: "z",
      confidence: 0,
      boundingBox: new THREE.Box3(),
    };
  }

  // Get bounding box of the model
  const boundingBox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);

  // Analyze the model's geometry to find the most likely front direction
  const meshes: THREE.Mesh[] = [];
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      meshes.push(child);
    }
  });

  if (meshes.length === 0) {
    return {
      frontAxis: "z",
      confidence: 0.5,
      boundingBox,
    };
  }

  // Analyze vertex positions to determine front direction
  const vertexPositions: THREE.Vector3[] = [];

  meshes.forEach((mesh) => {
    if (mesh.geometry) {
      const geometry = mesh.geometry;
      const positionAttribute = geometry.getAttribute("position");

      if (positionAttribute) {
        // Transform vertices to world space
        const matrix = new THREE.Matrix4();
        mesh.updateMatrixWorld(true);
        matrix.copy(mesh.matrixWorld);

        for (let i = 0; i < positionAttribute.count; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(matrix);
          vertexPositions.push(vertex);
        }
      }
    }
  });

  if (vertexPositions.length === 0) {
    return {
      frontAxis: "z",
      confidence: 0.5,
      boundingBox,
    };
  }

  // Find the axis with the most variation (likely the length of the model)
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
    { axis: "x", range: xRange },
    { axis: "y", range: yRange },
    { axis: "z", range: zRange },
  ];

  // Sort by range (longest axis first)
  ranges.sort((a, b) => b.range - a.range);

  // The longest axis is likely the "length" of the model
  // The second longest might be width, shortest is height
  const longestAxis = ranges[0].axis;

  // Analyze vertex distribution to determine front direction
  let frontAxis: "x" | "y" | "z" | "negX" | "negY" | "negZ" = "z";
  let confidence = 0.5;

  // For camera models and most 3D models, the detection logic:
  // - If Z is the longest axis, they typically face +Z (forward)
  // - If X is longest, they might face +X or -X (sideways)
  // - If Y is longest, they might face +Y (up) or -Y (down)

  if (longestAxis === "z") {
    // Model is longest along Z axis - likely faces +Z or -Z
    const zCenter = center.z;
    const zMin = Math.min(...vertexPositions.map((v) => v.z));
    const zMax = Math.max(...vertexPositions.map((v) => v.z));

    // If center is closer to one end, that's likely the "back"
    const distanceFromMin = Math.abs(zCenter - zMin);
    const distanceFromMax = Math.abs(zCenter - zMax);

    if (distanceFromMin > distanceFromMax) {
      frontAxis = "z"; // Faces +Z
    } else {
      frontAxis = "negZ"; // Faces -Z
    }
    confidence = 0.8;
  } else if (longestAxis === "x") {
    // Model is longest along X axis
    const xCenter = center.x;
    const xMin = Math.min(...vertexPositions.map((v) => v.x));
    const xMax = Math.max(...vertexPositions.map((v) => v.x));

    const distanceFromMin = Math.abs(xCenter - xMin);
    const distanceFromMax = Math.abs(xCenter - xMax);

    if (distanceFromMin > distanceFromMax) {
      frontAxis = "x"; // Faces +X
    } else {
      frontAxis = "negX"; // Faces -X
    }
    confidence = 0.7;
  } else if (longestAxis === "y") {
    // Model is longest along Y axis - might be vertical (like a pole with camera on top)
    // For camera models on poles, they typically face forward (Z direction)
    // but are oriented vertically, so we should still use Z as the front direction
    frontAxis = "z"; // Default to forward facing for vertical models
    confidence = 0.6;
  }

  console.log("🔍 Model Direction Detection:", {
    modelName: model.name || "Unknown",
    frontAxis,
    confidence,
    longestAxis,
    ranges: ranges.map((r) => ({ axis: r.axis, range: r.range.toFixed(2) })),
    boundingBox: {
      size: {
        x: size.x.toFixed(2),
        y: size.y.toFixed(2),
        z: size.z.toFixed(2),
      },
      center: {
        x: center.x.toFixed(2),
        y: center.y.toFixed(2),
        z: center.z.toFixed(2),
      },
    },
  });

  return {
    frontAxis,
    confidence,
    boundingBox,
  };
}

/**
 * Convert front axis to rotation offset
 * This returns the rotation needed to align the cone with the model's front direction
 */
export function getRotationOffsetForFrontAxis(frontAxis: string): {
  heading: number;
  pitch: number;
  roll: number;
} {
  let offset;
  switch (frontAxis) {
    case "x":
      offset = { heading: Math.PI / 2, pitch: -Math.PI / 2, roll: 0 }; // +90° heading, -90° pitch to face +X horizontally
      break;
    case "negX":
      offset = { heading: -Math.PI / 2, pitch: -Math.PI / 2, roll: 0 }; // -90° heading, -90° pitch to face -X horizontally
      break;
    case "y":
      offset = { heading: 0, pitch: 0, roll: 0 }; // Face +Y (up) - no offset needed for upward facing
      break;
    case "negY":
      offset = { heading: 0, pitch: Math.PI, roll: 0 }; // Face -Y (down) - 180° pitch for downward facing
      break;
    case "z":
      offset = { heading: 0, pitch: -Math.PI / 2, roll: 0 }; // Face +Z horizontally - -90° pitch for forward facing
      break;
    case "negZ":
      offset = { heading: Math.PI, pitch: -Math.PI / 2, roll: 0 }; // Face -Z horizontally - 180° heading, -90° pitch
      break;
    default:
      offset = { heading: 0, pitch: -Math.PI / 2, roll: 0 }; // Default to forward facing with -90° pitch
  }

  console.log("🔍 Rotation Offset for Front Axis:", {
    frontAxis,
    offset: {
      heading: `${((offset.heading * 180) / Math.PI).toFixed(1)}°`,
      pitch: `${((offset.pitch * 180) / Math.PI).toFixed(1)}°`,
      roll: `${((offset.roll * 180) / Math.PI).toFixed(1)}°`,
    },
  });

  return offset;
}

/**
 * Apply model front direction to sensor rotation
 */
export function applyModelFrontDirection(
  baseRotation: [number, number, number],
  model: THREE.Object3D | null,
  alignWithModelFront: boolean,
  manualFrontDirection?: "x" | "y" | "z" | "negX" | "negY" | "negZ"
): [number, number, number] {
  if (!alignWithModelFront) {
    return baseRotation;
  }

  let frontAxis: string;

  if (manualFrontDirection) {
    // Use manual override
    frontAxis = manualFrontDirection;
    console.log("🔍 Using manual front direction:", frontAxis);
  } else if (model) {
    // Use automatic detection
    const directionInfo = detectModelFrontDirection(model);
    frontAxis = directionInfo.frontAxis;
    console.log(
      "🔍 Using detected front direction:",
      frontAxis,
      "confidence:",
      directionInfo.confidence
    );
  } else {
    // Fallback to default
    frontAxis = "z";
    console.log("🔍 Using default front direction:", frontAxis);
  }

  const offset = getRotationOffsetForFrontAxis(frontAxis);

  // Add the offset to the base rotation
  const result = [
    baseRotation[0] + offset.heading,
    baseRotation[1] + offset.pitch,
    baseRotation[2] + offset.roll,
  ];

  console.log("🔍 Final rotation calculation:", {
    baseRotation: baseRotation.map(
      (r) => `${((r * 180) / Math.PI).toFixed(1)}°`
    ),
    offset: {
      heading: `${((offset.heading * 180) / Math.PI).toFixed(1)}°`,
      pitch: `${((offset.pitch * 180) / Math.PI).toFixed(1)}°`,
      roll: `${((offset.roll * 180) / Math.PI).toFixed(1)}°`,
    },
    result: result.map((r) => `${((r * 180) / Math.PI).toFixed(1)}°`),
  });

  return result as [number, number, number];
}
