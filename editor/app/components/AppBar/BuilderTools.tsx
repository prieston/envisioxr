import React from "react";
import { Box, Typography } from "@mui/material";
import {
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material";
import { MinimalButtonActive } from "./StyledComponents.tsx";

interface BuilderToolsProps {
  previewMode: boolean;
  selectedObject: any;
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
}

const BuilderTools: React.FC<BuilderToolsProps> = ({
  previewMode,
  selectedObject,
  transformMode,
  onTransformModeChange,
}) => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {selectedObject && !previewMode && (
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
        </>
      )}
    </Box>
  );
};

export default BuilderTools;
