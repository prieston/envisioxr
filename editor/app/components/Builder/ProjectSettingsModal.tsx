"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useSceneStore } from "@envisio/core";

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
        sx: {
          borderRadius: "16px",
          backgroundColor: "var(--glass-bg, rgba(255, 255, 255, 0.95))",
          backdropFilter: "blur(24px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.25rem",
          fontWeight: 600,
          pb: 1,
        }}
      >
        Project Settings
      </DialogTitle>

      <Divider sx={{ mb: 2 }} />

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* UI Settings Section */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: "rgba(15, 23, 42, 0.7)",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                letterSpacing: "0.5px",
              }}
            >
              Interface
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={bottomPanelVisible}
                  onChange={(e) => setBottomPanelVisible(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#2563eb",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#2563eb",
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    Show Bottom Panel
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "rgba(15, 23, 42, 0.6)",
                    }}
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

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#2563eb",
            "&:hover": {
              backgroundColor: "#1d4ed8",
            },
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSettingsModal;

