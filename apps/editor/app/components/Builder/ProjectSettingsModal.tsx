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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useSceneStore } from "@envisio/core";
import {
  modalPaperStyles,
  modalTitleStyles,
  modalTitleTextStyles,
  modalCloseButtonStyles,
} from "@envisio/ui";

interface ProjectSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  open,
  onClose,
}) => {
  const bottomPanelVisible = useSceneStore((state) => state.bottomPanelVisible);
  const setBottomPanelVisible = useSceneStore(
    (state) => state.setBottomPanelVisible
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: modalPaperStyles,
      }}
    >
      <DialogTitle sx={modalTitleStyles}>
        <Typography sx={modalTitleTextStyles}>Project Settings</Typography>
        <IconButton onClick={onClose} size="small" sx={modalCloseButtonStyles}>
          <Close />
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
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
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

          {/* Future settings can be added here */}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSettingsModal;
