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
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import {
  textFieldStyles,
  SettingContainer,
  SettingLabel,
} from "@envisio/ui";

interface CreateOrganizationDrawerProps {
  open: boolean;
  name: string;
  slug: string;
  saving: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSave: () => void;
}

export const CreateOrganizationDrawer: React.FC<CreateOrganizationDrawerProps> = ({
  open,
  name,
  slug,
  saving,
  onClose,
  onNameChange,
  onSlugChange,
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
          width: { xs: "100%", sm: "420px" },
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
            Create New Organization
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Organization Name</SettingLabel>
            <TextField
              id="org-name"
              name="org-name"
              value={name}
              onChange={(e) => {
                onNameChange(e.target.value);
                // Auto-generate slug from name if slug is empty or matches previous name
                if (!slug || slug === name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) {
                  const autoSlug = e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  onSlugChange(autoSlug);
                }
              }}
              placeholder="Enter organization name"
              fullWidth
              size="small"
              variant="outlined"
              sx={textFieldStyles}
            />
          </SettingContainer>

          <SettingContainer sx={{ borderBottom: "none", padding: 0 }}>
            <SettingLabel>Slug</SettingLabel>
            <TextField
              id="org-slug"
              name="org-slug"
              value={slug}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");
                onSlugChange(value);
              }}
              placeholder="organization-slug"
              fullWidth
              size="small"
              variant="outlined"
              sx={textFieldStyles}
              helperText="Used in URLs. Only lowercase letters, numbers, hyphens, and underscores."
            />
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
              disabled={!name.trim() || !slug.trim() || saving}
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
              {saving ? "Creating..." : "Create Organization"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

