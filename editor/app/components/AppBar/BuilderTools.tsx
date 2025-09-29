import React from "react";
import { Box, Typography } from "@mui/material";
import {
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
  AttachFile as MagnetIcon,
} from "@mui/icons-material";
import { MinimalButtonActive } from "./StyledComponents.tsx";
import { useSceneStore } from "@envisio/core/state";
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
          <MinimalButtonActive
            active={transformMode === "translate"}
            onClick={() => onTransformModeChange("translate")}
          >
            <OpenWithIcon />
            <Typography variant="caption">Move</Typography>
          </MinimalButtonActive>
          <MinimalButtonActive
            active={transformMode === "rotate"}
            onClick={() => onTransformModeChange("rotate")}
          >
            <RotateRightIcon />
            <Typography variant="caption">Rotate</Typography>
          </MinimalButtonActive>
          <MinimalButtonActive
            active={transformMode === "scale"}
            onClick={() => onTransformModeChange("scale")}
          >
            <AspectRatioIcon />
            <Typography variant="caption">Scale</Typography>
          </MinimalButtonActive>
          <MinimalButtonActive
            active={magnetEnabled}
            onClick={handleMagnetToggle}
          >
            <MagnetIcon />
            <Typography variant="caption">Magnet</Typography>
          </MinimalButtonActive>
        </>
      )}
    </Box>
  );
};

export default BuilderTools;
