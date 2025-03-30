"use client";

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Transform as TransformIcon,
  Translate as TranslateIcon,
  RotateRight as RotateRightIcon,
  ZoomIn as ZoomInIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import LogoHeader from "./LogoHeader";
import useSceneStore from "@/app/hooks/useSceneStore";
import { styled } from "@mui/material/styles";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "rgba(15, 23, 42, 0.8)",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "none",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: "64px !important",
  padding: "0 16px !important",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  borderColor: "rgba(99, 102, 241, 0.2)",
  padding: "6px 16px",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  padding: "6px 16px",
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const IconButtonWrapper = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: 8,
  color: theme.palette.text.secondary,
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: theme.palette.text.primary,
  },
  "&.active": {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    color: theme.palette.primary.main,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    background: "rgba(30, 41, 59, 0.95)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: "8px 16px",
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
    color: theme.palette.text.secondary,
  },
}));

interface AdminAppBarProps {
  mode?: "builder" | "publish";
  onSave?: () => void;
  onPublish?: () => void;
}

const AdminAppBar: React.FC<AdminAppBarProps> = ({
  mode = "builder",
  onSave,
  onPublish,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [transformMenuAnchor, setTransformMenuAnchor] =
    useState<null | HTMLElement>(null);

  const {
    previewMode,
    setPreviewMode,
    selectedObject,
    transformMode,
    setTransformMode,
  } = useSceneStore();

  const handleTransformMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTransformMenuAnchor(event.currentTarget);
  };

  const handleTransformMenuClose = () => {
    setTransformMenuAnchor(null);
  };

  const handleTransformModeChange = (mode: string) => {
    setTransformMode(mode);
    handleTransformMenuClose();
  };

  return (
    <StyledAppBar position="fixed" elevation={0}>
      <StyledToolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LogoHeader />
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24 }} />
        </Box>

        <Box
          sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}
        >
          {mode === "builder" && (
            <>
              <Tooltip title="Add Object">
                <IconButtonWrapper size="small">
                  <AddIcon />
                </IconButtonWrapper>
              </Tooltip>

              <Tooltip title="Transform Mode">
                <IconButtonWrapper
                  size="small"
                  onClick={handleTransformMenuOpen}
                  className={transformMode ? "active" : ""}
                >
                  <TransformIcon />
                </IconButtonWrapper>
              </Tooltip>

              <Tooltip title="Toggle Preview Mode">
                <IconButtonWrapper
                  size="small"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={previewMode ? "active" : ""}
                >
                  {previewMode ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButtonWrapper>
              </Tooltip>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {mode === "builder" && (
            <>
              <ActionButton
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={onSave}
              >
                Save
              </ActionButton>
              <PrimaryButton startIcon={<PublishIcon />} onClick={onPublish}>
                Publish
              </PrimaryButton>
            </>
          )}
        </Box>
      </StyledToolbar>

      <StyledMenu
        anchorEl={transformMenuAnchor}
        open={Boolean(transformMenuAnchor)}
        onClose={handleTransformMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <StyledMenuItem onClick={() => handleTransformModeChange("translate")}>
          <TranslateIcon /> Translate
        </StyledMenuItem>
        <StyledMenuItem onClick={() => handleTransformModeChange("rotate")}>
          <RotateRightIcon /> Rotate
        </StyledMenuItem>
        <StyledMenuItem onClick={() => handleTransformModeChange("scale")}>
          <ZoomInIcon /> Scale
        </StyledMenuItem>
      </StyledMenu>
    </StyledAppBar>
  );
};

export default AdminAppBar;
