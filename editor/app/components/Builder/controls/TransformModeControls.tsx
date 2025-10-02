"use client";

import React, { useState, useEffect } from "react";
import { Button, ButtonGroup, Tooltip, Box, Typography } from "@mui/material";
import {
  OpenWith as MoveIcon,
  RotateRight as RotateIcon,
  AspectRatio as ScaleIcon,
} from "@mui/icons-material";

interface TransformModeControlsProps {
  transformEditor: any;
}

const TransformModeControls: React.FC<TransformModeControlsProps> = ({
  transformEditor,
}) => {
  const [activeMode, setActiveMode] = useState<
    "translate" | "rotate" | "scale"
  >("translate");

  useEffect(() => {
    if (transformEditor && transformEditor.setModeTranslation) {
      transformEditor.setModeTranslation();
      setActiveMode("translate");
    }
  }, [transformEditor]);

  const handleModeChange = (mode: "translate" | "rotate" | "scale") => {
    if (!transformEditor) return;

    setActiveMode(mode);

    switch (mode) {
      case "translate":
        transformEditor.setModeTranslation();
        break;
      case "rotate":
        transformEditor.setModeRotation();
        break;
      case "scale":
        transformEditor.setModeScale();
        break;
    }
  };

  if (!transformEditor) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderRadius: 2,
        padding: 1,
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "white",
          display: "block",
          textAlign: "center",
          mb: 1,
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        Transform Mode
      </Typography>

      <ButtonGroup
        variant="contained"
        size="small"
        sx={{
          "& .MuiButton-root": {
            minWidth: 40,
            height: 32,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(33, 150, 243, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.9)",
              },
            },
          },
        }}
      >
        <Tooltip title="Move (Translate)" arrow>
          <Button
            onClick={() => handleModeChange("translate")}
            className={activeMode === "translate" ? "Mui-selected" : ""}
            startIcon={<MoveIcon sx={{ fontSize: 16 }} />}
          >
            Move
          </Button>
        </Tooltip>

        <Tooltip title="Rotate" arrow>
          <Button
            onClick={() => handleModeChange("rotate")}
            className={activeMode === "rotate" ? "Mui-selected" : ""}
            startIcon={<RotateIcon sx={{ fontSize: 16 }} />}
          >
            Rotate
          </Button>
        </Tooltip>

        <Tooltip title="Scale" arrow>
          <Button
            onClick={() => handleModeChange("scale")}
            className={activeMode === "scale" ? "Mui-selected" : ""}
            startIcon={<ScaleIcon sx={{ fontSize: 16 }} />}
          >
            Scale
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

export default TransformModeControls;
