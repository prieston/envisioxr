"use client";

import React, { useRef, useState, Suspense } from "react";
import {
  Dialog,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
      slotProps={{
        backdrop: {
          sx: {
            zIndex: 1599,
          },
        },
      }}
      sx={{
        zIndex: 1600,
      }}
      PaperProps={{
        sx: (theme) => ({
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A !important"
              : theme.palette.background.paper,
          boxShadow: "none",
          position: "relative",
          zIndex: 1601,
          "&.MuiPaper-root": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        }),
      }}
    >
      <Box
        sx={(theme) => ({
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? "#14171A" : theme.palette.background.paper,
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Retake Photo - {modelName}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        <Box>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "text.secondary",
              textAlign: "center",
              mb: 2,
            }}
          >
            Rotate the model to your desired angle, then click &quot;Capture
            Screenshot&quot;
          </Typography>

          <Box
            sx={(theme) => ({
              width: "600px",
              height: "400px",
              borderRadius: "4px",
              overflow: "hidden",
              backgroundColor: theme.palette.background.default,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            })}
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
                    <meshStandardMaterial color="#6B9CD8" wireframe />
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
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={capturing}
            sx={(theme) => ({
              borderRadius: `${theme.shape.borderRadius}px`,
              textTransform: "none",
              fontSize: "0.75rem",
            })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCapture}
            disabled={capturing}
            startIcon={<CameraAlt />}
            sx={(theme) => ({
              borderRadius: `${theme.shape.borderRadius}px`,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.75rem",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#161B20"
                  : theme.palette.background.paper,
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              boxShadow: "none",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#1a1f26"
                    : alpha(theme.palette.primary.main, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.5),
                boxShadow: "none",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            })}
          >
            {capturing ? "Capturing..." : "Capture Screenshot"}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ModelPreviewDialog;
