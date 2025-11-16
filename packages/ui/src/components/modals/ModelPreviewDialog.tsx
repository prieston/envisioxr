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
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "../../styles/modalStyles";

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
          ...((typeof modalPaperStyles === "function"
            ? modalPaperStyles(theme)
            : modalPaperStyles) as Record<string, any>),
          position: "relative",
          zIndex: 1601, // Higher than backdrop to ensure content is on top
        }),
      }}
    >
      <DialogTitle sx={modalTitleStyles}>
        <Typography sx={modalTitleTextStyles}>
          Retake Photo - {modelName}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={modalCloseButtonStyles}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          padding: "24px",
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Typography
          sx={(theme) => ({
            fontSize: "0.813rem",
            color: theme.palette.text.secondary,
            textAlign: "center",
            mb: 2,
          })}
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
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          padding: "16px 24px",
          gap: 1,
          backgroundColor: theme.palette.background.paper,
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        })}
      >
        <Button
          onClick={onClose}
          disabled={capturing}
          sx={(theme) => ({
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 500,
            borderRadius: "4px",
            color: theme.palette.text.secondary,
            boxShadow: "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(100, 116, 139, 0.12)"
                  : "rgba(100, 116, 139, 0.08)",
              boxShadow: "none",
            },
          })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCapture}
          disabled={capturing}
          variant="contained"
          startIcon={<CameraAlt />}
          sx={(theme) => ({
            textTransform: "none",
            fontSize: "0.813rem",
            fontWeight: 600,
            borderRadius: "4px",
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: "none",
            },
          })}
        >
          {capturing ? "Capturing..." : "Capture Screenshot"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModelPreviewDialog;
