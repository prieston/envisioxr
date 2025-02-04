"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Toolbar,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import MoveIcon from "@mui/icons-material/OpenWith";
import RotateIcon from "@mui/icons-material/RotateRight";
import ScaleIcon from "@mui/icons-material/ZoomOutMap";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PublishIcon from "@mui/icons-material/Publish";
import AddModelDialog from "./AddModelDialog";
import useSceneStore from "@/hooks/useSceneStore";
import { showToast } from "@/utils/toastUtils";
import PublishDialog from "./PublishDialog";

const BuilderActions = ({ onSave, onPublish }) => {
  // Dialog state for adding a model and publishing
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [openPublishDialog, setOpenPublishDialog] = useState(false);

  // Scene state from useSceneStore
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);
  const previewMode = useSceneStore((state) => state.previewMode);
  const startPreview = useSceneStore((state) => state.startPreview);
  const exitPreview = useSceneStore((state) => state.exitPreview);
  const nextObservation = useSceneStore((state) => state.nextObservation);
  const previewIndex = useSceneStore((state) => state.previewIndex);
  const observationPoints = useSceneStore((state) => state.observationPoints);
  const prevObservation = useSceneStore((state) => state.prevObservation);
  const selectObservationPoint = useSceneStore(
    (state) => state.selectObservationPoint
  );

  // Handlers for preview navigation
  const handlePrev = () => {
    prevObservation();
    const newIndex = Math.max(previewIndex - 1, 0);
    const newObservation = observationPoints[newIndex];
    if (newObservation) {
      selectObservationPoint(newObservation.id);
    }
  };

  const handleNext = () => {
    nextObservation();
    const newIndex = Math.min(previewIndex + 1, observationPoints.length - 1);
    const newObservation = observationPoints[newIndex];
    if (newObservation) {
      selectObservationPoint(newObservation.id);
    }
  };

  // Publish dialog handlers
  const handlePublishClick = () => {
    setOpenPublishDialog(true);
  };

  const handlePublishCancel = () => {
    setOpenPublishDialog(false);
  };

  const handlePublishConfirm = async () => {
    try {
      if (onPublish) {
        await onPublish();
        showToast("World published successfully!");
      } else {
        showToast("Publish action not yet implemented.");
      }
    } catch (error) {
      console.error("Error publishing world:", error);
      showToast("Error publishing world.");
    } finally {
      setOpenPublishDialog(false);
    }
  };

  return (
    <>
      {/* Center Section: Add Model & Preview Toggle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {!previewMode && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            Add Model
          </Button>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={previewMode ? exitPreview : startPreview}
        >
          {previewMode ? (
            <>
              <VisibilityOffIcon sx={{ mr: 1 }} /> Exit Preview
            </>
          ) : (
            <>
              <VisibilityIcon sx={{ mr: 1 }} /> Preview
            </>
          )}
        </Button>
      </Box>

      {/* Right Section: Controls depending on preview mode */}
      {!previewMode ? (
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Transform Controls */}
          <Tooltip title="Move">
            <span>
              <IconButton
                color={transformMode === "translate" ? "primary" : "inherit"}
                onClick={() => setTransformMode("translate")}
                disabled={!selectedObject}
              >
                <MoveIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rotate">
            <span>
              <IconButton
                color={transformMode === "rotate" ? "primary" : "inherit"}
                onClick={() => setTransformMode("rotate")}
                disabled={!selectedObject}
              >
                <RotateIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Scale">
            <span>
              <IconButton
                color={transformMode === "scale" ? "primary" : "inherit"}
                onClick={() => setTransformMode("scale")}
                disabled={!selectedObject}
              >
                <ScaleIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, borderColor: "rgba(255, 255, 255, 0.3)" }}
          />
          {/* Save Button */}
          <Tooltip title="Save">
            <IconButton
              color="inherit"
              onClick={async () => {
                if (onSave) {
                  await onSave()
                    .then(() => showToast("Saved!"))
                    .catch(() => showToast("Error saving."));
                } else {
                  showToast("Save action not yet implemented.");
                }
              }}
            >
              <SaveIcon />
            </IconButton>
          </Tooltip>
          {/* Publish Button */}
          <Tooltip title="Publish">
            <IconButton color="inherit" onClick={handlePublishClick}>
              <PublishIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Preview Navigation Buttons */}
          <Tooltip title="Previous Observation">
            <span>
              <IconButton
                color="inherit"
                onClick={handlePrev}
                disabled={previewIndex === 0}
              >
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next Observation">
            <span>
              <IconButton
                color="inherit"
                onClick={handleNext}
                disabled={previewIndex >= observationPoints.length - 1}
              >
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}

      {/* Dialogs */}
      <AddModelDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
      <PublishDialog
        open={openPublishDialog}
        onCancel={handlePublishCancel}
        onConfirm={handlePublishConfirm}
      />
    </>
  );
};

export default BuilderActions;
