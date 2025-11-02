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
import { alpha } from "@mui/material/styles";
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
        sx: (theme) => ({
          borderRadius: "16px",
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha("#0E0F10", 0.92)
              : "var(--glass-bg, rgba(255, 255, 255, 0.95))",
          backdropFilter: "blur(24px)",
          border:
            theme.palette.mode === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : undefined,
        }),
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          fontSize: "1.25rem",
          fontWeight: 600,
          pb: 1,
          color: theme.palette.text.primary,
        })}
      >
        Project Settings
      </DialogTitle>

      <Divider sx={{ mb: 2, borderColor: (theme) => theme.palette.divider }} />

      <DialogContent>
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

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.85)
                  : "#1d4ed8",
            },
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            color: theme.palette.getContrastText(theme.palette.primary.main),
          })}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectSettingsModal;

