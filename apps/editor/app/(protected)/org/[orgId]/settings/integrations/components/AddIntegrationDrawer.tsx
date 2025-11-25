"use client";

import React from "react";
import {
  Box,
  Button,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import {
  textFieldStyles,
  SettingContainer,
  SettingLabel,
} from "@klorad/ui";

interface AddIntegrationDrawerProps {
  open: boolean;
  label: string;
  readToken: string;
  uploadToken: string;
  saving: boolean;
  readTokenError?: string | null;
  uploadTokenError?: string | null;
  onClose: () => void;
  onLabelChange: (value: string) => void;
  onReadTokenChange: (value: string) => void;
  onUploadTokenChange: (value: string) => void;
  onSave: () => void;
}

export const AddIntegrationDrawer: React.FC<AddIntegrationDrawerProps> = ({
  open,
  label,
  readToken,
  uploadToken,
  saving,
  readTokenError,
  uploadTokenError,
  onClose,
  onLabelChange,
  onReadTokenChange,
  onUploadTokenChange,
  onSave,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500, // Higher than sidebar (1400)
        "& .MuiBackdrop-root": {
          zIndex: 1499, // Backdrop should be just below drawer
        },
      }}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
      }}
      PaperProps={{
        sx: (theme) => ({
          width: { xs: "100%", sm: "500px" },
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A !important"
              : theme.palette.background.paper,
          borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 1500,
          "&.MuiPaper-root": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "#14171A !important"
                : theme.palette.background.paper,
          },
        }),
      }}
    >
      <Box
        sx={(theme) => ({
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? "#14171A" : theme.palette.background.paper,
          minHeight: "100%",
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Cesium Ion Integration
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Name / Label *</SettingLabel>
            <TextField
              id="integration-label"
              name="integration-label"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="Enter integration name"
              fullWidth
              size="small"
              variant="outlined"
              disabled={saving}
              sx={textFieldStyles}
            />
          </SettingContainer>

          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Read-only Token *</SettingLabel>
            <TextField
              id="read-token"
              name="read-token"
              type="password"
              value={readToken}
              onChange={(e) => onReadTokenChange(e.target.value)}
              placeholder="Enter read-only token"
              fullWidth
              size="small"
              variant="outlined"
              disabled={saving}
              error={!!readTokenError}
              sx={textFieldStyles}
            />
            {readTokenError ? (
              <Alert severity="error" sx={{ mt: 1, fontSize: "0.75rem", py: 0.5 }}>
                {readTokenError}
              </Alert>
            ) : (
              <Typography
                variant="caption"
                sx={(theme) => ({
                  fontSize: "0.688rem",
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                })}
              >
                Enable assets:list and assets:read (and optionally assets:limited-list, geocode) when creating this token in Cesium. Do not enable any private/write scopes.
              </Typography>
            )}
          </SettingContainer>

          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Upload Token *</SettingLabel>
            <TextField
              id="upload-token"
              name="upload-token"
              type="password"
              value={uploadToken}
              onChange={(e) => onUploadTokenChange(e.target.value)}
              placeholder="Enter upload token"
              fullWidth
              size="small"
              variant="outlined"
              disabled={saving}
              error={!!uploadTokenError}
              sx={textFieldStyles}
            />
            {uploadTokenError ? (
              <Alert severity="error" sx={{ mt: 1, fontSize: "0.75rem", py: 0.5 }}>
                {uploadTokenError}
              </Alert>
            ) : (
              <Typography
                variant="caption"
                sx={(theme) => ({
                  fontSize: "0.688rem",
                  color: theme.palette.text.secondary,
                  mt: 0.5,
                })}
              >
                Enable assets:list, assets:read and assets:write when creating this token. This token is used only on the server to upload and delete assets.
              </Typography>
            )}
          </SettingContainer>

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              fullWidth
              disabled={saving}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
              })}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onSave}
              fullWidth
              disabled={!label.trim() || !readToken.trim() || !uploadToken.trim() || saving}
              sx={(theme) => ({
                borderRadius: `${theme.shape.borderRadius}px`,
                textTransform: "none",
                fontWeight: 500,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#161B20"
                    : theme.palette.background.paper,
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "#1a1f26"
                      : alpha(theme.palette.primary.main, 0.05),
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                "&:disabled": {
                  opacity: 0.5,
                },
              })}
            >
              {saving ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                "Create Integration"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

