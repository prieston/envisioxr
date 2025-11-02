"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  IconButton,
  Typography,
  alpha,
} from "@mui/material";
import { Close, CloudUpload, Folder, Public } from "@mui/icons-material";
import {
  MyLibraryTab,
  UploadModelTab,
  UploadToIonTab,
  type LibraryAsset,
} from "./tabs";

export interface AssetManagerModalProps {
  open: boolean;
  onClose: () => void;
  // My Library props
  userAssets?: LibraryAsset[];
  onModelSelect?: (model: LibraryAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  onAssetUpdate?: (
    assetId: string,
    updates: {
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
      thumbnail?: string;
    }
  ) => void;
  // Upload Model props
  onCustomModelUpload?: (data: {
    file: File;
    friendlyName: string;
    metadata: Array<{ label: string; value: string }>;
    screenshot: string | null;
  }) => Promise<void>;
  customModelUploading?: boolean;
  customModelUploadProgress?: number;
  // Upload to Ion props
  onCesiumIonUpload?: (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
    accessToken: string;
    longitude?: number;
    latitude?: number;
    height?: number;
  }) => Promise<{ assetId: string }>;
  ionUploading?: boolean;
  ionUploadProgress?: number;
}

const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  open,
  onClose,
  // My Library
  userAssets = [],
  onModelSelect,
  onAssetDelete,
  onAssetUpdate,
  // Upload Model
  onCustomModelUpload,
  customModelUploading = false,
  customModelUploadProgress = 0,
  // Upload to Ion
  onCesiumIonUpload,
  ionUploading = false,
  ionUploadProgress = 0,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleModelSelectWrapper = (model: LibraryAsset) => {
    onModelSelect?.(model);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          borderRadius: "4px",
          backgroundColor: theme.palette.background.paper,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
              : "0 8px 32px rgba(95, 136, 199, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          minHeight: "600px",
          maxHeight: "80vh",
        }),
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "24px",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Typography
          sx={(theme) => ({
            fontSize: "1.25rem",
            fontWeight: 600,
            color: theme.palette.text.primary,
          })}
        >
          Asset Manager
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={(theme) => ({
            color: "rgba(100, 116, 139, 0.8)",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(107, 156, 216, 0.12)"
                  : "rgba(107, 156, 216, 0.08)",
            },
          })}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={(theme) => ({
          minHeight: "48px",
          paddingX: "24px",
          paddingY: "4px",
          backgroundColor: theme.palette.background.default,
          "& .MuiTab-root": {
            color: theme.palette.text.secondary,
            minHeight: "40px",
            padding: "8px 12px",
            fontSize: "0.813rem",
            fontWeight: 500,
            flexDirection: "row",
            gap: "6px",
            justifyContent: "center",
            borderRadius: "4px",
            margin: "4px 2px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            textTransform: "none",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(107, 156, 216, 0.12)"
                  : "rgba(107, 156, 216, 0.08)",
              color: theme.palette.primary.main,
            },
            "&.Mui-selected": {
              color: theme.palette.primary.main,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(95, 136, 199, 0.16)"
                  : "rgba(107, 156, 216, 0.15)",
              fontWeight: 600,
            },
            "& .MuiSvgIcon-root": {
              marginBottom: 0,
              fontSize: "1.1rem",
            },
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
        })}
      >
        <Tab icon={<Folder />} iconPosition="start" label="My Library" />
        <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Model" />
        <Tab icon={<Public />} iconPosition="start" label="Upload to Ion" />
      </Tabs>

      {/* Content */}
      <DialogContent
        sx={(theme) => ({
          padding: "24px",
          backgroundColor: theme.palette.background.default,
          overflow: "auto",
          height: "500px",
          minHeight: "500px",
          maxHeight: "500px",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.08)
                : "rgba(95, 136, 199, 0.05)",
            borderRadius: "4px",
            margin: "4px 0",
          },
          "&::-webkit-scrollbar-thumb": {
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.24)
                : "rgba(95, 136, 199, 0.2)",
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
            transition: "background 0.2s ease",
            "&:hover": {
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.38)
                  : "rgba(95, 136, 199, 0.35)",
              backgroundClip: "padding-box",
            },
          },
        })}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* My Library Tab */}
          {activeTab === 0 && (
            <MyLibraryTab
              assets={userAssets}
              onAssetSelect={handleModelSelectWrapper}
              onAssetDelete={onAssetDelete}
              onAssetUpdate={onAssetUpdate}
            />
          )}

          {/* Upload Model Tab */}
          {activeTab === 1 && onCustomModelUpload && (
            <UploadModelTab
              onUpload={onCustomModelUpload}
              uploading={customModelUploading}
              uploadProgress={customModelUploadProgress}
            />
          )}

          {/* Upload to Ion Tab */}
          {activeTab === 2 && onCesiumIonUpload && (
            <UploadToIonTab
              onUpload={onCesiumIonUpload}
              uploading={ionUploading}
              uploadProgress={ionUploadProgress}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AssetManagerModal;
