import React from "react";
import { Box, Typography } from "@mui/material";
import {
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
  AttachFile as MagnetIcon,
} from "@mui/icons-material";
import { MinimalButton } from "./StyledComponents.tsx";
import { useSceneStore } from "@envisio/core";
import { logger } from "./logger.ts";

interface BuilderToolsProps {
  previewMode: boolean;
  selectedObject: unknown | null;
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
}

const BuilderTools: React.FC<BuilderToolsProps> = ({
  previewMode,
  selectedObject,
  transformMode,
  onTransformModeChange,
}) => {
  const magnetEnabled = useSceneStore((state) => state.magnetEnabled);
  const setMagnetEnabled = useSceneStore((state) => state.setMagnetEnabled);

  // Debug logging
  logger.debug("[BuilderTools] render", {
    hasSelectedObject: Boolean(selectedObject),
    previewMode,
    transformMode,
    shouldShowButtons: Boolean(selectedObject) && !previewMode,
  });

  const handleMagnetToggle = () => {
    setMagnetEnabled(!magnetEnabled);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {Boolean(selectedObject) && !previewMode && (
        <>
          <MinimalButton
            active={transformMode === "translate"}
            onClick={() => onTransformModeChange("translate")}
          >
            <OpenWithIcon />
            <Typography
              sx={{
                fontSize: "0.75rem", // 12px - toolbar labels
                fontWeight: 400, // Normal weight
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              Move
            </Typography>
          </MinimalButton>
          <MinimalButton
            active={transformMode === "rotate"}
            onClick={() => onTransformModeChange("rotate")}
          >
            <RotateRightIcon />
            <Typography
              sx={{
                fontSize: "0.75rem", // 12px - toolbar labels
                fontWeight: 400, // Normal weight
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              Rotate
            </Typography>
          </MinimalButton>
          <MinimalButton
            active={transformMode === "scale"}
            onClick={() => onTransformModeChange("scale")}
          >
            <AspectRatioIcon />
            <Typography
              sx={{
                fontSize: "0.75rem", // 12px - toolbar labels
                fontWeight: 400, // Normal weight
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              Scale
            </Typography>
          </MinimalButton>
          <MinimalButton active={magnetEnabled} onClick={handleMagnetToggle}>
            <MagnetIcon />
            <Typography
              sx={{
                fontSize: "0.75rem", // 12px - toolbar labels
                fontWeight: 400, // Normal weight
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}
            >
              Magnet
            </Typography>
          </MinimalButton>
        </>
      )}
    </Box>
  );
};

export default BuilderTools;
