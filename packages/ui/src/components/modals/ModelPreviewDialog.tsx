"use client";

import React, { useRef, useState, Suspense } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close, CameraAlt } from "@mui/icons-material";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

interface ModelPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  modelUrl: string;
  modelName: string;
  onCapture: (screenshot: string) => void;
}

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ModelPreviewDialog: React.FC<ModelPreviewDialogProps> = ({
  open,
  onClose,
  modelUrl,
  modelName,
  onCapture,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturing, setCapturing] = useState(false);

  const handleCapture = () => {
    if (!canvasRef.current) return;

    setCapturing(true);
    setTimeout(() => {
      if (canvasRef.current) {
        const screenshot = canvasRef.current.toDataURL("image/png");
        onCapture(screenshot);
        setCapturing(false);
        onClose();
      }
    }, 100);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "20px 24px",
          backgroundColor: "rgba(248, 250, 252, 0.6)",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Retake Photo - {modelName}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "rgba(100, 116, 139, 0.8)" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        <Typography
          sx={{
            fontSize: "0.813rem",
            color: "rgba(100, 116, 139, 0.9)",
            textAlign: "center",
            mb: 2,
          }}
        >
          Rotate the model to your desired angle, then click "Capture
          Screenshot"
        </Typography>

        <Box
          sx={{
            width: "600px",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <Canvas
            camera={{ position: [3, 2, 3], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
            onCreated={({ gl }) => {
              canvasRef.current = gl.domElement as HTMLCanvasElement;
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 7.5]} intensity={0.8} />
            <directionalLight position={[-5, 5, -5]} intensity={0.3} />
            <Suspense
              fallback={
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#2563eb" wireframe />
                </mesh>
              }
            >
              <Model url={modelUrl} />
            </Suspense>
            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              minDistance={1}
              maxDistance={50}
            />
          </Canvas>
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px", gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={capturing}
          sx={{ textTransform: "none", fontSize: "0.813rem", fontWeight: 500 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCapture}
          disabled={capturing}
          variant="contained"
          startIcon={<CameraAlt />}
          sx={{
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 500,
            backgroundColor: "#2563eb",
          }}
        >
          {capturing ? "Capturing..." : "Capture Screenshot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelPreviewDialog;
