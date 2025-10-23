"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box, Button, Typography } from "@mui/material";
import useModelLoader from "./hooks/useModelLoader";

interface InlineModelProps {
  url: string;
  type?: string;
}

const InlineModel: React.FC<InlineModelProps> = ({ url, type }) => {
  const model = useModelLoader(url, type);
  const object = (model as any)?.scene || model;
  return object ? <primitive object={object} /> : null;
};

export interface ModelPreviewProps {
  fileUrl: string;
  type?: string;
  onScreenshotCaptured?: (dataUrl: string) => void;
  height?: number;
}

const ModelPreview: React.FC<ModelPreviewProps> = ({
  fileUrl,
  type,
  onScreenshotCaptured,
  height = 400,
}) => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const captureScreenshot = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setScreenshot(dataUrl);
      onScreenshotCaptured?.(dataUrl);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Canvas
        style={{ height, background: "var(--color-surface-1)" }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement as HTMLCanvasElement;
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <InlineModel url={fileUrl} type={type} />
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
