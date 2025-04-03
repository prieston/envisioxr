import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Add as AddIcon,
  OpenWith as OpenWithIcon,
  RotateRight as RotateRightIcon,
  AspectRatio as AspectRatioIcon,
  Map as MapIcon,
  Terrain as TerrainIcon,
} from "@mui/icons-material";
import { MinimalButton, MinimalButtonActive } from "./StyledComponents.tsx";
import AddTilesDialog from "./AddTilesDialog.tsx";

interface BuilderToolsProps {
  previewMode: boolean;
  selectedObject: any;
  transformMode: "translate" | "rotate" | "scale";
  onTransformModeChange: (mode: "translate" | "rotate" | "scale") => void;
  onAddModel: () => void;
  onAddTiles: (apiKey: string) => void;
  onAddCesiumIonTiles: () => void;
}

const BuilderTools: React.FC<BuilderToolsProps> = ({
  previewMode,
  selectedObject,
  transformMode,
  onTransformModeChange,
  onAddModel,
  onAddTiles,
  onAddCesiumIonTiles,
}) => {
  const [isAddTilesDialogOpen, setIsAddTilesDialogOpen] = useState(false);

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

      <MinimalButton
        onClick={() => onAddCesiumIonTiles()}
        disabled={previewMode}
        className={previewMode ? "disabled" : ""}
      >
        <TerrainIcon />
        <Typography variant="caption">Tiles</Typography>
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

      <AddTilesDialog
        open={isAddTilesDialogOpen}
        onClose={() => setIsAddTilesDialogOpen(false)}
        onAddTiles={onAddTiles}
      />
    </Box>
  );
};

export default BuilderTools;
