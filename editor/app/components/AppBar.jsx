// app/components/AppBar.js
"use client";

import React, { useState } from "react";
import {
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
// import UndoIcon from "@mui/icons-material/Undo";
// import RedoIcon from "@mui/icons-material/Redo";
import MoveIcon from "@mui/icons-material/OpenWith";
import RotateIcon from "@mui/icons-material/RotateRight";
import ScaleIcon from "@mui/icons-material/ZoomOutMap";
import { showToast } from "../utils/toastUtils";
import AddModelDialog from "./AddModelDialog";
import useSceneStore from "../hooks/useSceneStore";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LogoHeader from "./LogoHeader";

const AdminAppBar = ({ mode = "builder", onSave }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const transformMode = useSceneStore((state) => state.transformMode);
  const setTransformMode = useSceneStore((state) => state.setTransformMode);
  const selectedObject = useSceneStore((state) => state.selectedObject);

  // Preview mode state and navigation
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

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "background.paper",
        color: "text.primary",
        display: "flex",
        height: "64px",
        alignItems: "center",
        justifyContent: "space-between",
        paddingX: 2,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Left Section: Logo */}
      <LogoHeader />
      {mode === "builder" && (
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

            {/* Toggle Preview Mode */}
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

          {/* Right Section: Transform Controls, Save, and Navigation */}
          <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!previewMode ? (
              <>
                {/* Transform Controls */}
                <Tooltip title="Move">
                  <span>
                    <IconButton
                      color={
                        transformMode === "translate" ? "primary" : "inherit"
                      }
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
                      debugger; // eslint-disable-line
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

                {/* <Tooltip title="Undo">
                  <IconButton color="inherit">
                    <UndoIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Redo">
                  <IconButton color="inherit">
                    <RedoIcon />
                  </IconButton>
                </Tooltip> */}
              </>
            ) : (
              <>
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
              </>
            )}
          </Toolbar>

          {/* Add Model Dialog */}
          <AddModelDialog
            open={isDialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        </>
      )}
    </Box>
  );
};

export default AdminAppBar;
