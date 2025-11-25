"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import { CloseIcon, PhotoCameraIcon, RefreshIcon } from "@klorad/ui";
import { alpha } from "@mui/material/styles";
import { useSceneStore } from "@klorad/core";
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "@klorad/ui";
import { useProjectThumbnailCapture } from "@/app/hooks/useProjectThumbnailCapture";
import ProjectThumbnailCaptureModal from "./ProjectThumbnailCaptureModal";

interface ProjectSettingsModalProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  projectThumbnail?: string | null;
  onThumbnailUpdate?: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  open,
  onClose,
  projectId,
  projectThumbnail,
  onThumbnailUpdate,
}) => {
  const bottomPanelVisible = useSceneStore((state) => state.bottomPanelVisible);
  const setBottomPanelVisible = useSceneStore(
    (state) => state.setBottomPanelVisible
  );

  const {
    captureModalOpen,
    capturedImage,
    uploading,
    handleCaptureClick,
    handleCapture,
    handleRetake,
    handleUpload,
    handleCancelCapture,
  } = useProjectThumbnailCapture({
    projectId,
    onThumbnailUpdate,
    onUploadComplete: onClose,
  });

  return (
    <>
      <Dialog
        open={open && !captureModalOpen}
        onClose={() => {
          // Prevent closing if capture modal is open
          if (captureModalOpen) return;
          onClose();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: modalPaperStyles,
        }}
      >
        <DialogTitle sx={modalTitleStyles}>
          <Typography sx={modalTitleTextStyles}>Project Settings</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={modalCloseButtonStyles}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={(theme) => ({
            padding: "24px !important",
            paddingTop: "24px !important",
            backgroundColor: theme.palette.background.default,
          })}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* UI Settings Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={(theme) => ({
                  fontWeight: 600,
                  mb: 2,
                  color:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.text.secondary, 0.9)
                      : "rgba(15, 23, 42, 0.7)",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                })}
              >
                Interface
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={bottomPanelVisible}
                    onChange={(e) => setBottomPanelVisible(e.target.checked)}
                    sx={(theme) => ({
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: theme.palette.primary.main,
                        },
                    })}
                  />
                }
                label={
                  <Box>
                    <Typography
                      sx={(theme) => ({
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      })}
                    >
                      Show Bottom Panel
                    </Typography>
                    <Typography
                      sx={(theme) => ({
                        fontSize: "0.75rem",
                        color:
                          theme.palette.mode === "dark"
                            ? theme.palette.text.secondary
                            : "rgba(15, 23, 42, 0.6)",
                      })}
                    >
                      Display the timeline and observation points panel
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Box>

            {/* Project Thumbnail Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={(theme) => ({
                  fontWeight: 600,
                  mb: 2,
                  color:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.text.secondary, 0.9)
                      : "rgba(15, 23, 42, 0.7)",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.5px",
                })}
              >
                Project Thumbnail
              </Typography>

              {projectThumbnail ? (
                <Box>
                  <Box
                    sx={(theme) => ({
                      width: "100%",
                      maxWidth: "300px",
                      height: "200px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      backgroundColor: theme.palette.background.default,
                      mb: 2,
                    })}
                  >
                    <Box
                      component="img"
                      src={projectThumbnail}
                      alt="Project Thumbnail"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleCaptureClick}
                    sx={{
                      textTransform: "none",
                    }}
                  >
                    Retake Project Thumbnail
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={handleCaptureClick}
                  sx={{
                    textTransform: "none",
                  }}
                >
                  Capture Project Thumbnail
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Capture Modal - rendered outside Dialog so it stays open when settings modal closes */}
      <ProjectThumbnailCaptureModal
        open={captureModalOpen}
        onCapture={handleCapture}
        onCancel={handleCancelCapture}
        capturedImage={capturedImage}
        onRetake={handleRetake}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </>
  );
};

export default ProjectSettingsModal;
