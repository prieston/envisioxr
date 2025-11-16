"use client";

import React, { useState, useCallback } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import { Folder, CloudUpload, Public, Add } from "@mui/icons-material";
import {
  AnimatedBackground,
  GlowingContainer,
  GlowingSpan,
} from "@/app/components/Builder/AdminLayout.styles";
import DashboardSidebar from "@/app/components/Dashboard/DashboardSidebar";
import {
  MyLibraryTab,
  UploadModelTab,
  UploadToIonTab,
  AddIonAssetTab,
} from "@envisio/ui";
import { useAssetManager } from "@/app/components/AppBar/BuilderActions/hooks/useAssetManager";
import { useCesiumIon } from "@/app/components/AppBar/BuilderActions/hooks/useCesiumIon";

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Use the same hooks as the builder
  const {
    userAssets,
    uploading,
    uploadProgress,
    handleCustomModelUpload,
    handleDeleteModel,
    handleAssetUpdate,
    fetchUserAssets,
  } = useAssetManager({});

  const {
    ionUploading,
    ionUploadProgress,
    handleUploadToIon,
    handleCesiumAssetAdd,
  } = useCesiumIon();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleIonUpload = useCallback(
    async (data: {
      file: File;
      name: string;
      description: string;
      sourceType: string;
      accessToken: string;
      longitude?: number;
      latitude?: number;
      height?: number;
    }) => {
      return handleUploadToIon(data, fetchUserAssets);
    },
    [handleUploadToIon, fetchUserAssets]
  );

  const handleIonAssetAdded = useCallback(() => {
    fetchUserAssets();
  }, [fetchUserAssets]);

  return (
    <>
      {/* Animated background */}
      <AnimatedBackground>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
        <GlowingContainer>
          <GlowingSpan index={1} />
          <GlowingSpan index={2} />
          <GlowingSpan index={3} />
        </GlowingContainer>
      </AnimatedBackground>

      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <Box
        sx={(theme) => ({
          marginLeft: "392px",
          padding: "24px",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          backgroundColor: theme.palette.background.default,
        })}
      >
        <Box sx={{ paddingBottom: 3 }}>
          <Typography
            variant="h5"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            Library
          </Typography>
        </Box>

        {/* Tabs - Same as AssetManagerModal */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={(theme) => ({
            minHeight: "48px",
            paddingX: "24px",
            paddingY: "4px",
            backgroundColor: theme.palette.background.default,
            mb: 2,
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
          <Tab
            icon={<CloudUpload />}
            iconPosition="start"
            label="Upload Model"
          />
          <Tab icon={<Public />} iconPosition="start" label="Upload to Ion" />
          <Tab icon={<Add />} iconPosition="start" label="Add Ion Asset" />
        </Tabs>

        {/* Content - Same tabs as AssetManagerModal */}
        <Box
          sx={(theme) => ({
            padding: "24px",
            backgroundColor: theme.palette.background.default,
            overflow: "hidden",
            height: "calc(100vh - 220px)",
            minHeight: "500px",
            display: "flex",
            flexDirection: "column",
          })}
        >
          {/* My Library Tab */}
          {activeTab === 0 && (
            <MyLibraryTab
              assets={userAssets}
              onAssetSelect={() => {
                // No-op in library page - no scene to add to
              }}
              onAssetDelete={handleDeleteModel}
              onAssetUpdate={handleAssetUpdate}
            />
          )}

          {/* Upload Model Tab */}
          {activeTab === 1 && (
            <UploadModelTab
              onUpload={handleCustomModelUpload}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />
          )}

          {/* Upload to Ion Tab */}
          {activeTab === 2 && (
            <UploadToIonTab
              onUpload={handleIonUpload}
              uploading={ionUploading}
              uploadProgress={ionUploadProgress}
            />
          )}

          {/* Add Ion Asset Tab */}
          {activeTab === 3 && (
            <AddIonAssetTab
              onAdd={handleCesiumAssetAdd}
              onSuccess={handleIonAssetAdded}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default LibraryPage;
