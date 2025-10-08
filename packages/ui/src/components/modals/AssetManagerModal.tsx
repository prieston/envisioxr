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
} from "@mui/material";
import { Close, CloudUpload, Folder, Public, Add } from "@mui/icons-material";
import {
  MyLibraryTab,
  UploadModelTab,
  CesiumIonAssetTab,
  UploadToIonTab,
  type LibraryAsset,
  type CesiumAsset,
} from "./tabs";

export interface AssetManagerModalProps {
  open: boolean;
  onClose: () => void;
  // My Library props
  userAssets?: LibraryAsset[];
  onModelSelect?: (model: LibraryAsset) => void;
  onAssetDelete?: (assetId: string) => void;
  // Upload Model props
  onCustomModelUpload?: (data: {
    file: File;
    friendlyName: string;
    metadata: Array<{ label: string; value: string }>;
    screenshot: string | null;
  }) => Promise<void>;
  customModelUploading?: boolean;
  customModelUploadProgress?: number;
  // Cesium Ion Asset props
  cesiumAssets?: CesiumAsset[];
  onCesiumAssetAdd?: (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => void;
  onCesiumAssetToggle?: (assetId: string) => void;
  onCesiumAssetRemove?: (assetId: string) => void;
  onCesiumAssetFlyTo?: (assetId: string) => void;
  // Upload to Ion props
  onCesiumIonUpload?: (data: {
    file: File;
    name: string;
    description: string;
    sourceType: string;
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
  // Upload Model
  onCustomModelUpload,
  customModelUploading = false,
  customModelUploadProgress = 0,
  // Cesium Ion Asset
  cesiumAssets = [],
  onCesiumAssetAdd,
  onCesiumAssetToggle,
  onCesiumAssetRemove,
  onCesiumAssetFlyTo,
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
        sx: {
          borderRadius: "16px",
          boxShadow:
            "0 8px 32px rgba(37, 99, 235, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          minHeight: "600px",
          maxHeight: "80vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "20px 24px",
          backgroundColor: "rgba(248, 250, 252, 0.6)",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "rgba(51, 65, 85, 0.95)",
          }}
        >
          Asset Manager
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgba(100, 116, 139, 0.8)",
            "&:hover": {
              color: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.08)",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          "& .MuiTab-root": {
            color: "rgba(100, 116, 139, 0.8)",
            minHeight: "56px",
            padding: "12px 16px",
            fontSize: "0.875rem",
            fontWeight: 500,
            textTransform: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(37, 99, 235, 0.08)",
              color: "#2563eb",
            },
            "&.Mui-selected": {
              color: "#2563eb",
              fontWeight: 600,
            },
          },
          "& .MuiTabs-indicator": {
            height: "3px",
            borderRadius: "3px 3px 0 0",
            backgroundColor: "#2563eb",
          },
        }}
      >
        <Tab icon={<Folder />} iconPosition="start" label="My Library" />
        <Tab icon={<CloudUpload />} iconPosition="start" label="Upload Model" />
        <Tab icon={<Add />} iconPosition="start" label="Cesium Ion Asset" />
        <Tab icon={<Public />} iconPosition="start" label="Upload to Ion" />
      </Tabs>

      {/* Content */}
      <DialogContent
        sx={{
          padding: "24px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            minHeight: "400px",
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

          {/* Cesium Ion Asset Tab */}
          {activeTab === 2 && onCesiumAssetAdd && (
            <CesiumIonAssetTab
              assets={cesiumAssets}
              onAddAsset={onCesiumAssetAdd}
              onToggleAsset={onCesiumAssetToggle}
              onRemoveAsset={onCesiumAssetRemove}
              onFlyTo={onCesiumAssetFlyTo}
            />
          )}

          {/* Upload to Ion Tab */}
          {activeTab === 3 && onCesiumIonUpload && (
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
