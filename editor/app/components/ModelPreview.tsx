"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box, Button, Typography } from "@mui/material";
import useModelLoader from "@/src/components/useModelLoader";

const Model = ({ url, type }) => {
  const model = useModelLoader(url, type);
  // @ts-expect-error - model.scene is not defined
  return model ? <primitive object={model.scene || model} /> : null;
};

const ModelPreview = ({ fileUrl, type, onScreenshotCaptured }) => {
  const [screenshot, setScreenshot] = useState(null);
  const canvasRef = useRef(null);

  const captureScreenshot = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      setScreenshot(dataUrl);
      if (onScreenshotCaptured) {
        onScreenshotCaptured(dataUrl);
      }
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <Canvas
        style={{ height: 400, background: "var(--color-surface-1)" }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Model url={fileUrl} type={type} />
        <OrbitControls />
      </Canvas>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" onClick={captureScreenshot}>
          Capture Thumbnail
        </Button>
      </Box>
      {screenshot && (
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption">Thumbnail Preview:</Typography>
          <img
            src={screenshot}
            alt="Screenshot Preview"
            style={{
              maxWidth: "100%",
              border: "1px solid var(--color-border)",
              marginTop: 8,
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default ModelPreview;
