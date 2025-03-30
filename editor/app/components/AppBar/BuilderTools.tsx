import React from "react";
import { Box, Typography } from "@mui/material";
import {
  Add as AddIcon,
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material";
import { MinimalButton, MinimalButtonActive } from "./StyledComponents";
import AddModelDialog from "./AddModelDialog";

interface BuilderToolsProps {
  previewMode: boolean;
  selectedObject: any;
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
  onAddModel: () => void;
}

const BuilderTools: React.FC<BuilderToolsProps> = ({
  previewMode,
  selectedObject,
  transformMode,
  onTransformModeChange,
  onAddModel,
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
      <MinimalButton
        onClick={onAddModel}
        disabled={previewMode}
        className={previewMode ? "disabled" : ""}
      >
        <AddIcon />
        <Typography variant="caption">Add</Typography>
      </MinimalButton>

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
