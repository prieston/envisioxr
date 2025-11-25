"use client";

import React from "react";
import { Box, Drawer, Typography, IconButton, Divider } from "@mui/material";
import { CloseIcon } from "@klorad/ui";
import { AddIonAssetTab } from "@klorad/ui";
import { showToast } from "@klorad/ui";
import { createCesiumIonAsset } from "@/app/utils/api";
import { useOrgId } from "@/app/hooks/useOrgId";

interface AddIonAssetDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddIonAssetDrawer: React.FC<AddIonAssetDrawerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const orgId = useOrgId();

  const handleAdd = async (data: {
    assetId: string;
    name: string;
    apiKey?: string;
  }) => {
    try {
      if (!orgId) {
        throw new Error("Organization ID is required");
      }

      // Save to database
      await createCesiumIonAsset({
        assetType: "cesiumIonAsset",
        cesiumAssetId: data.assetId,
        cesiumApiKey: data.apiKey,
        name: data.name,
        organizationId: orgId,
      });

      showToast(`Cesium Ion asset added: ${data.name}`);
      onSuccess();
    } catch (error) {
      console.error("Cesium Ion asset save error:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred while saving Cesium Ion asset.",
        "error"
      );
      throw error;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1500,
        "& .MuiBackdrop-root": {
          zIndex: 1499,
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
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#14171A"
              : theme.palette.background.paper,
        })}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Add Cesium Ion Asset
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

        <Divider />

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 3,
          }}
        >
          <AddIonAssetTab onAdd={handleAdd} onSuccess={onSuccess} />
        </Box>
      </Box>
    </Drawer>
  );
};
